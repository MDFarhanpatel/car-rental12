
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


// Bulk create or update settings
export async function POST(request) {
  try {
    const body = await request.json();
    const { settings } = body;
    
    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Valid settings array is required' 
      }, { status: 400 });
    }
    
    const results = [];
    
    // Process each setting
    for (const setting of settings) {
      const { key, value, category, description, dataType, active } = setting;
      
      if (!key || !value || !category) {
        results.push({
          key,
          success: false,
          error: 'Key, value and category are required'
        });
        continue;
      }
      
      try {
        // Try to update if exists, otherwise create
        const existingSetting = await prisma.setting.findUnique({
          where: { key }
        });
        
        if (existingSetting) {
          // Update
          const updated = await prisma.setting.update({
            where: { key },
            data: {
              value,
              category,
              description: description !== undefined ? description : existingSetting.description,
              dataType: dataType !== undefined ? dataType : existingSetting.dataType,
              active: active !== undefined ? active : existingSetting.active
            }
          });
          
          results.push({
            key,
            success: true,
            operation: 'updated',
            data: updated
          });
        } else {
          // Create
          const created = await prisma.setting.create({
            data: {
              key,
              value,
              category,
              description,
              dataType,
              active: active !== undefined ? active : true
            }
          });
          
          results.push({
            key,
            success: true,
            operation: 'created',
            data: created
          });
        }
      } catch (error) {
        results.push({
          key,
          success: false,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bulk operation completed',
      results
    });
  } catch (error) {
    console.error('Error in bulk settings operation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Bulk delete settings
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { keys } = body;
    
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Valid keys array is required' 
      }, { status: 400 });
    }
    
    const results = [];
    
    // Process each key
    for (const key of keys) {
      try {
        // Check if setting exists
        const existingSetting = await prisma.setting.findUnique({
          where: { key }
        });
        
        if (!existingSetting) {
          results.push({
            key,
            success: false,
            error: 'Setting not found'
          });
          continue;
        }
        
        await prisma.setting.delete({
          where: { key }
        });
        
        results.push({
          key,
          success: true,
          operation: 'deleted'
        });
      } catch (error) {
        results.push({
          key,
          success: false,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bulk delete operation completed',
      results
    });
  } catch (error) {
    console.error('Error in bulk delete operation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
