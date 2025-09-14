import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/prisma-client';

const prisma = new PrismaClient();

// GET all settings or filter by category
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeParam = searchParams.get('active');
    
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (activeParam !== null) {
      filter.active = activeParam === 'true';
    }
    
    const settings = await prisma.setting.findMany({
      where: filter,
      orderBy: {
        category: 'asc'
      }
    });
    
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Create a new setting
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }
    
    // Check if all required fields are present
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ 
        success: false, 
        error: 'Request body must be a valid JSON object' 
      }, { status: 400 });
    }
    
    const { key, value, category, description, dataType, active } = body;
    
    // Validate required fields
    if (!key) {
      return NextResponse.json({ 
        success: false, 
        error: 'Key is required' 
      }, { status: 400 });
    }
    
    if (value === undefined || value === null) {
      return NextResponse.json({ 
        success: false, 
        error: 'Value is required' 
      }, { status: 400 });
    }
    
    if (!category) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category is required' 
      }, { status: 400 });
    }
    
    try {
      // Check if setting with the same key already exists
      const existingSetting = await prisma.setting.findUnique({
        where: { key }
      });
      
      if (existingSetting) {
        return NextResponse.json({ 
          success: false, 
          error: 'A setting with this key already exists' 
        }, { status: 409 });
      }
      
      // Convert value to string if it's not already
      const stringValue = typeof value === 'string' ? value : String(value);
      
      // Create the new setting
      const newSetting = await prisma.setting.create({
        data: {
          key,
          value: stringValue,
          category,
          description: description || null,
          dataType: dataType || null,
          active: active !== undefined ? active : true
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Setting created successfully',
        data: newSetting
      }, { status: 201 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: `Database error: ${dbError.message}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Server error: ${error.message}` 
    }, { status: 500 });
  } finally {
    // Make sure to disconnect the Prisma client to prevent connection leaks
    await prisma.$disconnect();
  }
}

// Update an existing setting
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, key, value, category, description, dataType, active } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Setting ID is required' }, { status: 400 });
    }
    
    // Check if setting exists
    const existingSetting = await prisma.setting.findUnique({
      where: { id }
    });
    
    if (!existingSetting) {
      return NextResponse.json({ success: false, error: 'Setting not found' }, { status: 404 });
    }
    
    // If key is being changed, check if the new key already exists
    if (key && key !== existingSetting.key) {
      const keyExists = await prisma.setting.findUnique({
        where: { key }
      });
      
      if (keyExists) {
        return NextResponse.json({ 
          success: false, 
          error: 'A setting with this key already exists' 
        }, { status: 409 });
      }
    }
    
    const updatedSetting = await prisma.setting.update({
      where: { id },
      data: {
        key: key || existingSetting.key,
        value: value !== undefined ? value : existingSetting.value,
        category: category || existingSetting.category,
        description: description !== undefined ? description : existingSetting.description,
        dataType: dataType !== undefined ? dataType : existingSetting.dataType,
        active: active !== undefined ? active : existingSetting.active
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Setting updated successfully',
      data: updatedSetting
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Delete a setting
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Setting ID is required' }, { status: 400 });
    }
    
    // Check if setting exists
    const existingSetting = await prisma.setting.findUnique({
      where: { id }
    });
    
    if (!existingSetting) {
      return NextResponse.json({ success: false, error: 'Setting not found' }, { status: 404 });
    }
    
    await prisma.setting.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
