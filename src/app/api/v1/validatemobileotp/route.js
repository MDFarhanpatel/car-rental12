
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

    // Update user mobile verification status
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        mobile_verified: true,
        updated_at: new Date()
      }
    });

    // Create user approval record
    await prisma.user_approval.create({
      data: {
        user_id: user.id,
        status: 'Pending Approval',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Consume Login API and return JWT token
    const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobile: mobile.trim(),
        password: user.password, // Assuming password is stored in user table
        role_id: role_id
      })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      return NextResponse.json({
        statusCode: "401",
        message: "Login failed"
      }, { status: 401 });
    }

    return NextResponse.json({
      statusCode: "200",
      message: "Mobile OTP Validated",
      token: loginData.token
    }, { status: 200 });

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
