import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const allowedOrigin = 'http://localhost:3000'; // Replace with your frontend URL in production

// Handle CORS preflight OPTIONS request
export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// GET /api/v1/providers - List all providers
export async function GET() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
  };

  try {
    const providers = await prisma.provider.findMany();
    return NextResponse.json({ success: true, providers }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch providers' },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/v1/providers - Create a new provider
export async function POST(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
  };

  try {
    const data = await request.json();

    // Basic validation
    if (!data.email || !data.password || !data.name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // NOTE: In production, you must hash the password before saving
    // For example, using bcrypt: const hashedPassword = await bcrypt.hash(data.password, 10);

    const newProvider = await prisma.provider.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        name: data.name.trim(),
        mobileOTPVerified: data.mobileOTPVerified ?? false,
        emailOTPVerified: data.emailOTPVerified ?? false,
        active: data.active ?? true,
      },
    });

    return NextResponse.json({ success: true, provider: newProvider }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Error creating provider:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create provider' },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}
