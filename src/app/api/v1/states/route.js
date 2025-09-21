import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all states
export async function GET() {
  try {
    const states = await prisma.state.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: states
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch states'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create a new state
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, code, active = true } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'State name is required'
      }, { status: 400 });
    }

    if (!code?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'State code is required'
      }, { status: 400 });
    }

    // Check if state with same name or code already exists
    const existingState = await prisma.state.findFirst({
      where: {
        OR: [
          { 
            name: {
              equals: name.trim(),
              mode: 'insensitive'
            }
          },
          { 
            code: {
              equals: code.trim().toUpperCase(),
              mode: 'insensitive'
            }
          }
        ]
      }
    });

    if (existingState) {
      return NextResponse.json({
        success: false,
        error: 'State with this name or code already exists'
      }, { status: 409 });
    }

    const newState = await prisma.state.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        active
      }
    });

    return NextResponse.json({
      success: true,
      message: 'State created successfully',
      data: newState
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating state:', error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return NextResponse.json({
        success: false,
        error: `State with this ${field} already exists`
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create state'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update an existing state
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, code, active } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'State ID is required'
      }, { status: 400 });
    }

    // Check if state exists
    const existingState = await prisma.state.findUnique({
      where: { id }
    });

    if (!existingState) {
      return NextResponse.json({
        success: false,
        error: 'State not found'
      }, { status: 404 });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (code !== undefined) updateData.code = code.trim().toUpperCase();
    if (active !== undefined) updateData.active = active;

    const updatedState = await prisma.state.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'State updated successfully',
      data: updatedState
    });

  } catch (error) {
    console.error('Error updating state:', error);
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return NextResponse.json({
        success: false,
        error: `State with this ${field} already exists`
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update state'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a state
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'State ID is required'
      }, { status: 400 });
    }

    // Check if state exists
    const existingState = await prisma.state.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            cities: true,
            providers: true
          }
        }
      }
    });

    if (!existingState) {
      return NextResponse.json({
        success: false,
        error: 'State not found'
      }, { status: 404 });
    }

    // Check if state has associated cities or providers
    if (existingState._count.cities > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete state with associated cities'
      }, { status: 400 });
    }

    if (existingState._count.providers > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete state with associated providers'
      }, { status: 400 });
    }

    await prisma.state.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'State deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting state:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete state'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}