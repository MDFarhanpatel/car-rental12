import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// Set your exact front-end URL here for security (do NOT use '*' in production)
const allowedOrigin = 'http://localhost:3000';

export async function OPTIONS(request) {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const provider = await prisma.provider.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'No email or username found. Please register first.' },
        { status: 404, headers: corsHeaders }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, provider.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!provider.mobileOTPVerified || !provider.emailOTPVerified) {
      return NextResponse.json(
        { success: false, error: 'Email or Mobile OTP not verified' },
        { status: 401, headers: corsHeaders }
      );
    }

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
      { success: true, token, message: 'Login successful' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}
