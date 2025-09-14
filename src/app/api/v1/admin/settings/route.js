
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/v1/admin/settings:
 *   get:
 *     summary: Retrieve settings
 *     description: Fetches settings, optionally filtered by category.
 *     tags:
 *       - Settings
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: The category to filter settings by.
 *     responses:
 *       200:
 *         description: A list of settings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Setting'
 *       500:
 *         description: Internal server error.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const where = category ? { category } : {};
    
    const settings = await prisma.setting.findMany({ where });
    
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/v1/admin/settings:
 *   post:
 *     summary: Create a new setting
 *     description: Adds a new setting to the database.
 *     tags:
 *       - Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Setting'
 *     responses:
 *       201:
 *         description: Setting created successfully.
 *       400:
 *         description: Bad request, required fields are missing.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { key, value, category, description, dataType, active } = body;
    
    if (!key || !value || !category) {
      return NextResponse.json({ success: false, error: 'Key, value and category are required' }, { status: 400 });
    }
    
    const newSetting = await prisma.setting.create({
      data: {
        key,
        value,
        category,
        description,
        dataType,
        active,
      },
    });
    
    return NextResponse.json({ success: true, data: newSetting, message: 'Setting created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/v1/admin/settings:
 *   put:
 *     summary: Update an existing setting
 *     description: Updates a setting's details by its ID.
 *     tags:
 *       - Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Setting'
 *     responses:
 *       200:
 *         description: Setting updated successfully.
 *       400:
 *         description: Bad request, setting ID is required.
 *       404:
 *         description: Setting not found.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, key, value, category, description, dataType, active } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Setting ID is required' }, { status: 400 });
    }
    
    const updatedSetting = await prisma.setting.update({
      where: { id: Number(id) },
      data: {
        key,
        value,
        category,
        description,
        dataType,
        active,
      },
    });
    
    return NextResponse.json({ success: true, data: updatedSetting, message: 'Setting updated successfully' });
  } catch (error) {
    if (error.code === 'P2025') { // Prisma code for record not found
      return NextResponse.json({ success: false, error: 'Setting not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
