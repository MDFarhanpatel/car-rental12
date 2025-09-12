import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/models - Fetch all models
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const active = searchParams.get('active');

    // Build where clause
    const where = {};
    if (brandId) where.brandId = brandId;
    if (active !== null && active !== undefined) {
      where.active = active === 'true';
    }

    const models = await prisma.model.findMany({
      where,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        _count: {
          select: { variants: true }
        }
      },
      orderBy: [
        { brand: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      message: "Models fetched successfully",
      models: models,
      count: models.length,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { message: "Failed to fetch models", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/v1/models - Create new model
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { name, brandId, active } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Model name is required", statusCode: 400 },
        { status: 400 }
      );
    }

    if (!brandId) {
      return NextResponse.json(
        { message: "Brand ID is required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    });

    if (!brand) {
      return NextResponse.json(
        { message: "Brand not found", statusCode: 404 },
        { status: 404 }
      );
    }

    // Check if model already exists for this brand
    const existingModel = await prisma.model.findFirst({
      where: { 
        name: name.trim(),
        brandId: brandId
      }
    });

    if (existingModel) {
      return NextResponse.json(
        { message: "Model already exists for this brand", statusCode: 409 },
        { status: 409 }
      );
    }

    // Create model
    const model = await prisma.model.create({
      data: {
        name: name.trim(),
        brandId: brandId,
        active: active !== undefined ? active : true,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Model created successfully",
      model: model,
      statusCode: 201
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating model:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: "Model name already exists for this brand", statusCode: 409 },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create model", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
