import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const allowedOrigin = 'http://localhost:3000';

export async function OPTIONS() {
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
        { success: false, error: 'Email and password required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const provider = await prisma.provider.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'No account found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const validPassword = await bcrypt.compare(password, provider.password);
    if (!validPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = jwt.sign(
      { id: provider.id, email: provider.email, name: provider.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json(
      { success: true, token },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}
