
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export async function GET() {
  try {
    const [active, inactive, total, pending, approved] = await Promise.all([
      prisma.user.count({ where: { role_id: 'provider', is_active: true } }),
      prisma.user.count({ where: { role_id: 'provider', is_active: false } }),
      prisma.user.count({ where: { role_id: 'provider' } }),
      prisma.user.count({ where: { role_id: 'provider', registration_status: 'pending' } }),
      prisma.user.count({ where: { role_id: 'provider', registration_status: 'approved' } })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          active,
          inactive,
          total,
          pending,
          approved
        }
      }
    });
  } catch (error) {
    console.error('Error fetching provider stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch provider statistics'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
