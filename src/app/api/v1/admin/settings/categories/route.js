
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/v1/admin/settings/categories:
 *   get:
 *     summary: Retrieve all distinct setting categories
 *     description: Fetches a list of unique category names from the settings in the database.
 *     tags:
 *       - Settings
 *     responses:
 *       200:
 *         description: A list of category names.
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
 *                     type: string
 *       500:
 *         description: Internal server error.
 */
export async function GET() {
  try {
    const categories = await prisma.setting.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    const categoryList = categories.map(c => c.category);

    return NextResponse.json({ success: true, data: categoryList });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
