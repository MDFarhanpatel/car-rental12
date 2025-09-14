import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/prisma-client';

const prisma = new PrismaClient();

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get('categoryId');
        
        let checklistItems;
        
        if (categoryId) {
            checklistItems = await prisma.checklistItem.findMany({
                where: {
                    categoryId: categoryId,
                    active: true
                },
                include: {
                    category: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } else {
            checklistItems = await prisma.checklistItem.findMany({
                where: {
                    active: true
                },
                include: {
                    category: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }
        
        return NextResponse.json({
            success: true,
            data: checklistItems
        });
    } catch (error) {
        console.error('Error fetching checklist items:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch checklist items' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, categoryId, description, checkType, required } = body;
        
        if (!name || !categoryId) {
            return NextResponse.json(
                { success: false, error: 'Name and category ID are required' },
                { status: 400 }
            );
        }
        
        const checklistItem = await prisma.checklistItem.create({
            data: {
                name,
                categoryId,
                description,
                checkType: checkType || 'boolean',
                required: required || false,
                active: true
            },
            include: {
                category: true
            }
        });
        
        return NextResponse.json({
            success: true,
            data: checklistItem
        });
    } catch (error) {
        console.error('Error creating checklist item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create checklist item' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            );
        }
        
        const body = await request.json();
        const { name, categoryId, description, checkType, required, active } = body;
        
        const checklistItem = await prisma.checklistItem.update({
            where: { id },
            data: {
                name,
                categoryId,
                description,
                checkType,
                required,
                active
            },
            include: {
                category: true
            }
        });
        
        return NextResponse.json({
            success: true,
            data: checklistItem
        });
    } catch (error) {
        console.error('Error updating checklist item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update checklist item' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            );
        }
        
        await prisma.checklistItem.delete({
            where: { id }
        });
        
        return NextResponse.json({
            success: true,
            message: 'Checklist item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting checklist item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete checklist item' },
            { status: 500 }
        );
    }
}