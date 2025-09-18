import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = parseInt(searchParams.get('sortOrder') || '-1');

    // Parse filters JSON parameter
    const filtersStr = searchParams.get('filters') || '{}';
    let filtersObj = {};
    try {
      filtersObj = JSON.parse(filtersStr);
    } catch (err) {
      console.error('Error parsing filters JSON:', err);
      filtersObj = {};
    }

    // Build Prisma where clause from filters
    const where = { AND: [] };

    for (const [field, value] of Object.entries(filtersObj)) {
      if (value && typeof value === 'string' && value.trim() !== '') {
        where.AND.push({
          [field]: {
            contains: value,
            mode: 'insensitive',
          },
        });
      }
    }

    // If no filter criteria, remove empty AND array to avoid filtering all rows out
    if (where.AND.length === 0) {
      delete where.AND;
    }

    // Get total matching count
    const totalCount = await prisma.user.count({ where });

    // Fetch paginated users
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
      orderBy: {
        [sortField]: sortOrder === 1 ? 'asc' : 'desc',
      },
      skip,
      take: limit,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(skip / limit) + 1;

    return NextResponse.json({
      message: 'Users fetched successfully',
      users,
      count: users.length,
      totalCount,
      currentPage,
      totalPages,
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users', error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
