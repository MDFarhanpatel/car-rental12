
import { NextResponse } from 'next/server';

// Define the available data types for settings
const dataTypes = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'JSON', value: 'json' },
  { label: 'Text', value: 'text' },
];

/**
 * @swagger
 * /api/v1/admin/settings/data-types:
 *   get:
 *     summary: Retrieve a list of setting data types
 *     description: Fetches a predefined list of data types that can be used for settings.
 *     tags:
 *       - Settings
 *     responses:
 *       200:
 *         description: A list of data types.
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
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                       value:
 *                         type: string
 *       500:
 *         description: Internal server error.
 */
export async function GET() {
  try {
    return NextResponse.json({ success: true, data: dataTypes });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
