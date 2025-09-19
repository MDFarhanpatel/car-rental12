
import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/prisma-client';

const prisma = new PrismaClient();

// GET - Fetch providers with pagination, sorting, and filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = parseInt(searchParams.get('sortOrder') || '-1');
    const filters = JSON.parse(searchParams.get('filters') || '{}');

    // Build where clause for filtering
    const where = {};
    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters.username) {
      where.username = { contains: filters.username, mode: 'insensitive' };
    }
    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }
    if (filters.role_id) {
      where.role_id = { contains: filters.role_id, mode: 'insensitive' };
    }

    // Add filter to only get providers
    where.role_id = 'provider';

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortField] = sortOrder === 1 ? 'asc' : 'desc';

    // Fetch providers and total count
    const [providers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          role_id: true,
          is_active: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      providers,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create a new provider
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, username, email, password } = body;

    // Validate required fields
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Create provider (user with provider role)
    const provider = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password, // Note: In production, hash the password before storing
        role_id: 'provider',
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role_id: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: provider });
  } catch (error) {
    console.error('Error creating provider:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
