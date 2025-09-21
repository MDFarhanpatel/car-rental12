
import { NextResponse } from 'next/server';
import { ProviderService } from '../../../../../services/providerService.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Basic input validation
    const { name, email, mobile, password, address, cityId, stateId, zipcode } = body;
    
    if (!name || !email || !mobile || !password || !address || !cityId || !stateId || !zipcode) {
      return NextResponse.json({
        statusCode: "400",
        message: "All required fields must be provided: name, email, mobile, password, address, cityId, stateId, zipcode"
      }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        statusCode: "400",
        message: "Please provide a valid email address"
      }, { status: 400 });
    }

    // Mobile number validation (basic)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile.replace(/\D/g, ''))) {
      return NextResponse.json({
        statusCode: "400",
        message: "Please provide a valid 10-digit mobile number"
      }, { status: 400 });
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json({
        statusCode: "400",
        message: "Password must be at least 6 characters long"
      }, { status: 400 });
    }

    const newProvider = await ProviderService.registerProvider(body);

    return NextResponse.json({
      statusCode: "201",
      message: "Provider registered successfully. Please verify your email and mobile number.",
      data: {
        id: newProvider.id,
        name: newProvider.name,
        email: newProvider.email,
        mobile: newProvider.mobile,
        registration_status: newProvider.registration_status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Provider registration error:', error);
    
    // Handle duplicate email/mobile error
    if (error.message.includes('Email or Mobile already exists')) {
      return NextResponse.json({
        statusCode: "409",
        message: error.message
      }, { status: 409 });
    }

    // Handle validation errors
    if (error.message.includes('required fields') || 
        error.message.includes('Invalid') || 
        error.message.includes('does not belong')) {
      return NextResponse.json({
        statusCode: "400",
        message: error.message
      }, { status: 400 });
    }

    // Handle city/state validation errors
    if (error.message.includes('city') || error.message.includes('state')) {
      return NextResponse.json({
        statusCode: "400",
        message: error.message
      }, { status: 400 });
    }

    // Handle database connection errors
    if (error.message.includes('database') || error.message.includes('connection')) {
      return NextResponse.json({
        statusCode: "503",
        message: "Database service temporarily unavailable. Please try again later."
      }, { status: 503 });
    }

    // Generic server error
    return NextResponse.json({
      statusCode: "500",
      message: "Internal server error. Please try again later."
    }, { status: 500 });
  }
}
