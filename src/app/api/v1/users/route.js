import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this username or email already exists", statusCode: 400 },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        name,
        password, // In production, hash this password
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
        createdAt: true,
        updatedAt: true,
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

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, username, email, name, role, password } = body;

    // Validation
    if (!id || !username || !email || !name || !role) {
      return NextResponse.json(
        { message: "All fields except password are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found", statusCode: 404 },
        { status: 404 }
      );
    }

    // Check if username or email is taken by another user
    const duplicateUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { username: username },
              { email: email }
            ]
          }
        ]
      }
    });

    if (duplicateUser) {
      return NextResponse.json(
        { message: "Username or email already taken by another user", statusCode: 400 },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      username,
      email,
      name,
      role_id: role
    };

    // Only update password if provided
    if (password && password.trim()) {
      updateData.password = password; // In production, hash this password
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role_id: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: "Failed to update user", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found", statusCode: 404 },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "User deleted successfully",
      statusCode: 200
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: "Failed to delete user", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
