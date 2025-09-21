import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch cities
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('stateId');
    const active = searchParams.get('active');
    
    let whereClause = {};
    
    if (stateId) {
      whereClause.stateId = stateId;
    }
    
    if (active !== null && active !== undefined) {
      whereClause.active = active === 'true';
    }
    
    const cities = await prisma.city.findMany({
      where: whereClause,
      include: {
        state: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: cities
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch cities' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create a new city
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, stateId, pincode, active = true } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'City name is required'
      }, { status: 400 });
    }

    if (!stateId?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'State ID is required'
      }, { status: 400 });
    }

    // Verify state exists
    const state = await prisma.state.findUnique({
      where: { id: stateId }
    });

    if (!state) {
      return NextResponse.json({
        success: false,
        error: 'Invalid state selected'
      }, { status: 400 });
    }

    // Check if city with same name already exists in the state
    const existingCity = await prisma.city.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        },
        stateId: stateId
      }
    });

    if (existingCity) {
      return NextResponse.json({
        success: false,
        error: 'City with this name already exists in the selected state'
      }, { status: 409 });
    }

    const newCity = await prisma.city.create({
      data: {
        name: name.trim(),
        stateId,
        pincode: pincode?.trim() || null,
        active
      },
      include: {
        state: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'City created successfully',
      data: newCity
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating city:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'City with this name already exists'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create city'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update a city
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, stateId, pincode, active } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'City ID is required'
      }, { status: 400 });
    }

    // Check if city exists
    const existingCity = await prisma.city.findUnique({
      where: { id }
    });

    if (!existingCity) {
      return NextResponse.json({
        success: false,
        error: 'City not found'
      }, { status: 404 });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (stateId !== undefined) updateData.stateId = stateId;
    if (pincode !== undefined) updateData.pincode = pincode?.trim() || null;
    if (active !== undefined) updateData.active = active;

    const updatedCity = await prisma.city.update({
      where: { id },
      data: updateData,
      include: {
        state: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'City updated successfully',
      data: updatedCity
    });

  } catch (error) {
    console.error('Error updating city:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update city'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a city
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'City ID is required'
      }, { status: 400 });
    }

    // Check if city exists
    const existingCity = await prisma.city.findUnique({
      where: { id }
    });

    if (!existingCity) {
      return NextResponse.json({
        success: false,
        error: 'City not found'
      }, { status: 404 });
    }

    await prisma.city.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'City deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting city:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete city'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}