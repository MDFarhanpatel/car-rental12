
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET - Fetch all providers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const status = searchParams.get('status');
    
    let whereClause = {};
    
    if (active !== null && active !== undefined) {
      whereClause.is_active = active === 'true';
    }
    
    if (status) {
      whereClause.registration_status = status.toUpperCase();
    }
    
    const providers = await prisma.provider.findMany({
      where: whereClause,
      include: {
        city: {
          select: {
            id: true,
            name: true,
            pincode: true
          }
        },
        state: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch providers'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create a new provider
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      mobile, 
      alternate_mobile, 
      address, 
      cityId, 
      stateId, 
      zipcode,
      registration_status = 'PENDING'
    } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Name is required'
      }, { status: 400 });
    }

    if (!email?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    if (!mobile?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Mobile number is required'
      }, { status: 400 });
    }

    if (!address?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Address is required'
      }, { status: 400 });
    }

    if (!cityId?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'City is required'
      }, { status: 400 });
    }

    if (!stateId?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'State is required'
      }, { status: 400 });
    }

    if (!zipcode?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Zipcode is required'
      }, { status: 400 });
    }

    // Check if email already exists
    const existingEmailProvider = await prisma.provider.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingEmailProvider) {
      return NextResponse.json({
        success: false,
        error: 'Email already exists'
      }, { status: 409 });
    }

    // Check if mobile already exists
    const existingMobileProvider = await prisma.provider.findUnique({
      where: { mobile: mobile.trim() }
    });

    if (existingMobileProvider) {
      return NextResponse.json({
        success: false,
        error: 'Mobile number already exists'
      }, { status: 409 });
    }

    // Check if alternate mobile exists (if provided)
    if (alternate_mobile?.trim()) {
      const existingAlternateMobile = await prisma.provider.findFirst({
        where: { 
          OR: [
            { mobile: alternate_mobile.trim() },
            { alternate_mobile: alternate_mobile.trim() }
          ]
        }
      });

      if (existingAlternateMobile) {
        return NextResponse.json({
          success: false,
          error: 'Alternate mobile number already exists'
        }, { status: 409 });
      }
    }

    // Verify city exists and belongs to the state
    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: { state: true }
    });

    if (!city) {
      return NextResponse.json({
        success: false,
        error: 'Invalid city selected'
      }, { status: 400 });
    }

    if (city.stateId !== stateId) {
      return NextResponse.json({
        success: false,
        error: 'City does not belong to the selected state'
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

    // Create provider
    const newProvider = await prisma.provider.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile.trim(),
        alternate_mobile: alternate_mobile?.trim() || null,
        address: address.trim(),
        cityId,
        stateId,
        zipcode: zipcode.trim(),
        registration_status: registration_status.toUpperCase(),
        is_active: true
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            pincode: true
          }
        },
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
      message: 'Provider created successfully',
      data: newProvider
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating provider:', error);
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return NextResponse.json({
        success: false,
        error: `Provider with this ${field} already exists`
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create provider'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
