import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/prisma-client';
import { generateToken, verifyToken } from '../../../util/jwt-access.js';

const prisma = new PrismaClient();

// LOGIN - POST request
export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    console.log('Login attempt:', { username }); // Debug log
    
    if (!username || !password) {
      console.log('Missing credentials'); // Debug log
      return NextResponse.json(
        { message: "Username and password are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Find user in database
    const userFromDb = await prisma.user.findUnique({
      where: { username },
    });
    
    console.log('User found:', userFromDb ? 'Yes' : 'No'); // Debug log
    
    if (!userFromDb) {
      console.log('User not found in database'); // Debug log
      return NextResponse.json(
        { message: "Invalid username or Password", statusCode: 401 },
        { status: 401 }
      );
    }
    
    console.log('User is_active:', userFromDb.is_active); // Debug log
    
    if (!userFromDb.is_active) {
      console.log('User account is inactive'); // Debug log
      return NextResponse.json(
        { message: "Account is deactivated", statusCode: 403 },
        { status: 403 }
      );
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userFromDb.password);
    console.log('Password valid:', isPasswordValid); // Debug log
    
    if (!isPasswordValid) {
      console.log('Password verification failed'); // Debug log
      return NextResponse.json(
        { message: "Invalid username or Password", statusCode: 401 },
        { status: 401 }
      );
    }

    // Generate token - FIXED: use role_id
    const tokenPayload = {
      userId: userFromDb.id,
      username: userFromDb.username,
      name: userFromDb.name,
      role: userFromDb.role_id  // CHANGED: use role_id from database
    };
    
    const token = await generateToken(tokenPayload);
    console.log('Token generated successfully'); // Debug log
    
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
    console.error('Login error:', error);
    return NextResponse.json(
      { message: "Internal server error", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// REGISTRATION - PUT request (FIXED FOR ENUM)
export async function PUT(request) {
  try {
    const { username, password, name, role } = await request.json();

    console.log('Registration attempt:', { username, name, role }); // Debug log

    // Validate required fields
    if (!username || !password || !name) {
      console.log('Missing required fields'); // Debug log
      return NextResponse.json(
        { message: "Username, password, and name are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // FIXED: Map role to match your exact enum values (case-sensitive!)
    let userRole;
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        userRole = 'ADMIN';
        break;
      case 'USER':
        userRole = 'USER';
        break;
      case 'HOSTER':
        userRole = 'Hoster';  // Note: Capital H, lowercase rest
        break;
      case 'DRIVER':
        userRole = 'Driver';  // Note: Capital D, lowercase rest
        break;
      case 'PROVIDER':
        userRole = 'provider'; // Note: all lowercase
        break;
      case 'CUSTOMER':
        userRole = 'customer'; // Note: all lowercase
        break;
      case 'MECHANIC':
        userRole = 'mechanic'; // Note: all lowercase
        break;
      default:
        userRole = 'USER'; // Default fallback
    }

    console.log('Mapped role:', userRole); // Debug log

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      console.log('User already exists'); // Debug log
      return NextResponse.json(
        { message: "User with this username already exists", statusCode: 409 },
        { status: 409 }
      );
    }

    // Hash password
    console.log('Hashing password...'); // Debug log
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully'); // Debug log

    // Create user - FIXED: use role_id field
    console.log('Creating user in database...'); // Debug log
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role_id: userRole,  // CHANGED: use role_id instead of role
        is_active: true,
      },
    });

    console.log('User created successfully:', user.id); // Debug log

    // Generate token for immediate login after registration
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role_id  // CHANGED: use role_id from created user
    };
    
    const token = await generateToken(tokenPayload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      message: "User created and logged in successfully",
      data: {
        token,
        user: userWithoutPassword
      },
      statusCode: 201
    }, { status: 201 });

    // Set secure cookie for immediate login
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: "Username already exists", statusCode: 409 },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// TOKEN VERIFICATION - GET request (FIXED)
export async function GET(request) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('authToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "No token provided", statusCode: 401 },
        { status: 401 }
      );
    }

    // Verify the token
    const payload = await verifyToken(token);
    
    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        name: true,
        role_id: true,  // CHANGED: use role_id field
        is_active: true
      }
    });

    if (!user || !user.is_active) {
      return NextResponse.json(
        { message: "User not found or inactive", statusCode: 401 },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Token valid",
      data: { user },
      statusCode: 200
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: "Invalid token", statusCode: 401 },
      { status: 401 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
