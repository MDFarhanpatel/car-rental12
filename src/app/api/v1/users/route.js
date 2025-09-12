import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // ← FIXED IMPORT
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role_id: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      message: "Users fetched successfully",
      users: users,
      count: users.length,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: "Failed to fetch users", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const { username, email, name, password, role } = await request.json();

    if (!username || !name || !password) {
      return NextResponse.json(
        { message: "Username, name, and password are required", statusCode: 400 },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists", statusCode: 409 },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        name,
        password: hashedPassword,
        role_id: role || 'USER',
        is_active: true,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        is_active: user.is_active,
      },
      statusCode: 201
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: "Failed to create user", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
