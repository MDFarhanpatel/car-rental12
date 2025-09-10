import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../../util/jwt-access'; // Fixed import path

// Initialize Prisma Client correctly
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input FIRST
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Then query database
    const userFromDb = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!userFromDb) {
      return NextResponse.json(
        { message: "Invalid credentials", statusCode: 401 },
        { status: 401 }
      );
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userFromDb.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials", statusCode: 401 },
        { status: 401 }
      );
    }
    
    // Generate token with actual user data
    const tokenPayload = {
      userId: userFromDb.id, // Use actual user ID
      email: userFromDb.email,
      name: userFromDb.name,
    };
    
    const token = await generateToken(tokenPayload);
    
    return NextResponse.json({
      message: "Login Successful",
      data: token,
      statusCode: 200
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: "Internal server error", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    // Always disconnect Prisma
    await prisma.$disconnect();
  }
}
