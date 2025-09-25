
import { NextResponse } from 'next/server';
import { generateToken } from '../../../util/jwt-access.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function POST(request) {
  try {
    const body = await request.json();
    const { email, otp, role_id } = body;

    // Validate required fields
    if (!email || !otp || !role_id) {
      return NextResponse.json({
        statusCode: "400",
        message: "Email, OTP, and role_id are required"
      }, { status: 400 });
    }

    // Find user by email and role
    const user = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase().trim(),
        role_id: role_id
      }
    });

    if (!user) {
      return NextResponse.json({
        statusCode: "404",
        message: "Email not found"
      }, { status: 404 });
    }

    // Find valid OTP for this email
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
        type: 'email',
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
        message: "Invalid OTP"
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

    // Update user email verification status and change status to "pending_approval"
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        email_verified: true,
        registration_status: 'pending_approval',
        updated_at: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role_id: true,
        registration_status: true,
        is_active: true
      }
    });

    // Generate JWT Token for login
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
      message: "Email OTP Validated",
      data: {
        token,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          role: updatedUser.role_id,
          registration_status: updatedUser.registration_status,
          is_active: updatedUser.is_active
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
    console.error('Email OTP validation error:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Internal server error"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
