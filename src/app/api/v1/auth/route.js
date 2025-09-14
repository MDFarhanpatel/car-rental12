import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../../../util/jwt-access.js';

// Initialize Prisma client
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    console.log('Auth API called');
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { message: "Invalid JSON in request body", statusCode: 400 },
        { status: 400 }
      );
    }

    const { username, password } = body;
    
    console.log('Login attempt for username:', username);
    
    if (!username || !password) {
      console.log('Missing credentials');
      return NextResponse.json(
        { message: "Username and password are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Test database connection first
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { message: "Database connection failed", statusCode: 500 },
        { status: 500 }
      );
    }

    // Find user in database
    let userFromDb;
    try {
      userFromDb = await prisma.user.findUnique({
        where: { username },
      });
      console.log('User found:', userFromDb ? 'Yes' : 'No');
    } catch (dbQueryError) {
      console.error('Database query error:', dbQueryError);
      return NextResponse.json(
        { message: "Database query failed", statusCode: 500 },
        { status: 500 }
      );
    }
    
    if (!userFromDb) {
      console.log('User not found in database');
      return NextResponse.json(
        { message: "Invalid username or password", statusCode: 401 },
        { status: 401 }
      );
    }
    
    console.log('User is_active:', userFromDb.is_active);
    
    if (!userFromDb.is_active) {
      console.log('User account is inactive');
      return NextResponse.json(
        { message: "Account is deactivated", statusCode: 403 },
        { status: 403 }
      );
    }
    
    // Verify password
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, userFromDb.password);
      console.log('Password valid:', isPasswordValid);
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return NextResponse.json(
        { message: "Password verification failed", statusCode: 500 },
        { status: 500 }
      );
    }
    
    if (!isPasswordValid) {
      console.log('Password verification failed');
      return NextResponse.json(
        { message: "Invalid username or password", statusCode: 401 },
        { status: 401 }
      );
    }

    // Generate token
    let token;
    try {
      const tokenPayload = {
        userId: userFromDb.id,
        username: userFromDb.username,
        name: userFromDb.name,
        role: userFromDb.role_id
      };
      
      token = await generateToken(tokenPayload);
      console.log('Token generated successfully');
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return NextResponse.json(
        { message: "Token generation failed", statusCode: 500 },
        { status: 500 }
      );
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = userFromDb;
    
    // Create response with token
    const response = NextResponse.json({
      message: "Login Successful",
      data: {
        token,
        user: userWithoutPassword
      },
      statusCode: 200
    });

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
    console.error('Unexpected login error:', error);
    return NextResponse.json(
      { 
        message: "Internal server error", 
        error: error.message,
        statusCode: 500 
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Prisma disconnect error:', disconnectError);
    }
  }
}
