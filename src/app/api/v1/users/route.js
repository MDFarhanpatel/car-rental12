import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = parseInt(searchParams.get('sortOrder') || '-1');

    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { role_id: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    // Get total count
    const totalCount = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
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
      orderBy: { [sortField]: sortOrder === 1 ? 'asc' : 'desc' },
      skip,
      take: limit
    });

    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(skip / limit) + 1;

    return NextResponse.json({
      message: "Users fetched successfully",
      users: users,
      count: users.length,
      totalCount,
      currentPage,
      totalPages,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: "Failed to fetch users", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, name, password, role } = body;

    // Validation
    if (!username || !email || !name || !password || !role) {
      return NextResponse.json(
        { message: "All fields are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email or username already exists", statusCode: 400 },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        name,
        password: hashedPassword,
        role_id: role,
        is_active: true
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role_id: true,
        is_active: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: "User created successfully",
      user: newUser,
      statusCode: 201
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: "Failed to create user", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
