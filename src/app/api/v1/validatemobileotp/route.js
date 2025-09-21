
import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma-client';
import { generateToken } from '../../../util/jwt-access.js';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { mobile, otp, role_id } = body;

    // Validate required fields
    if (!mobile || !otp || !role_id) {
      return NextResponse.json({
        statusCode: "400",
        message: "Mobile, OTP, and role_id are required"
      }, { status: 400 });
    }

    // Find user by mobile number and role
    const user = await prisma.user.findFirst({
      where: { 
        mobile: mobile.trim(),
        role_id: role_id
      }
    });

    if (!user) {
      return NextResponse.json({
        statusCode: "404",
        message: "Mobile number not found"
      }, { status: 404 });
    }

    // Find valid OTP for this mobile number
    const otpRecord = await prisma.otp.findFirst({
      where: {
        mobile: mobile.trim(),
        otp: otp.trim(),
        type: 'mobile',
        is_used: false,
        expires_at: {
          gte: new Date()
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!otpRecord) {
      return NextResponse.json({
        statusCode: "400",
        message: "Invalid or expired OTP"
      }, { status: 400 });
    }

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { 
        is_used: true,
        verified_at: new Date()
      }
    });

    // Update user mobile verification status and registration status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        mobile_verified: true,
        registration_status: 'pending_approval', // Update registration status
        updated_at: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role_id: true,
        registration_status: true,
        is_active: true,
        mobile_verified: true,
        email_verified: true
      }
    });

    // Generate JWT Token directly (instead of calling login API)
    const tokenPayload = {
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role_id,
      mobile: updatedUser.mobile,
      registration_status: updatedUser.registration_status
    };

    const token = await generateToken(tokenPayload);

    // Create response with token
    const response = NextResponse.json({
      statusCode: "200",
      message: "Mobile OTP Validated Successfully",
      data: {
        token,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          role: updatedUser.role_id,
          registration_status: updatedUser.registration_status,
          is_active: updatedUser.is_active,
          mobile_verified: updatedUser.mobile_verified,
          email_verified: updatedUser.email_verified
        }
      }
    }, { status: 200 });

    // Set secure HTTP-only cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Mobile OTP validation error:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Internal server error"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
