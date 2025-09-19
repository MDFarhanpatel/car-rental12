
import { NextResponse } from 'next/server';
import { UserService } from '../../../../services/userService.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('limit') || '10');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = parseInt(searchParams.get('sortOrder') || '-1');
    const filters = JSON.parse(searchParams.get('filters') || '{}');

    const result = await UserService.getProviders({
      skip,
      take,
      sortField,
      sortOrder,
      filters,
    });

    return NextResponse.json({
      success: true,
      providers: result.users,
      totalCount: result.totalCount,
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const providerData = {
      ...body,
      role: 'provider', // Force role to be provider
    };
    
    const provider = await UserService.createUser(providerData);

    return NextResponse.json({
      success: true,
      provider,
      message: 'Provider created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating provider:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
