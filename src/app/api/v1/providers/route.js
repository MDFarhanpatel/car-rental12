import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // install jsonwebtoken if not done

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// Handle CORS preflight OPTIONS request
export async function OPTIONS(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Replace '*' with your frontend domain in production
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  return new NextResponse(null, { headers });
}

// Handle POST login
export async function POST(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Replace '*' with your frontend domain in production
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400, headers }
      );
    }

    const provider = await prisma.provider.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          error: 'No email or username found. Please register first.',
        },
        { status: 404, headers }
      );
    }

    // Check password validity with bcrypt (password should be hashed on registration)
    const isPasswordValid = await bcrypt.compare(password, provider.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401, headers }
      );
    }

    // OTP verification flags — adjust these fields to your schema
    if (!provider.mobileOTPVerified || !provider.emailOTPVerified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email or Mobile OTP not verified',
        },
        { status: 401, headers }
      );
    }

    // Generate JWT token with provider info
    const token = jwt.sign(
      {
        id: provider.id,
        email: provider.email,
        name: provider.name,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json(
      {
        success: true,
        token,
        message: 'Login successful',
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers }
    );
  } finally {
    await prisma.$disconnect();
  }
}
