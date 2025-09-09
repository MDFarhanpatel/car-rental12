import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
// import { generateToken } from '../../../../../src/app/util/jwt-access';
import { generateToken } from '@/app/util/jwt-access';
// Import your database connection here
// import { connectDB } from '../../../../util/database';

const prisma = new prismaClient();

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const userFromDb = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required", statusCode: 400 },
        { status: 400 }
      );
    }

    
    // Connect to database and find user
    // await connectDB();
    // const user = await User.findOne({ email });
    
    // For demonstration - replace with actual database logic
    // const user = await getUserFromDatabase(email);
    
    // if (!user) {
    //   return NextResponse.json(
    //     { message: "Invalid credentials", statusCode: 401 },
    //     { status: 401 }
    //   );
    // }
    
    // Verify password
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    
    // if (!isPasswordValid) {
    //   return NextResponse.json(
    //     { message: "Invalid credentials", statusCode: 401 },
    //     { status: 401 }
    //   );
    // }
    
    // Generate token with user data
    const tokenPayload = {
      userId: "user.id", // Replace with actual user.id
      email: email,
      // Add other user data as needed
    };
    
    const token = await generateToken(tokenPayload);
    
    return NextResponse.json({
      message: "Login Successful",
      data: token,
      statusCode: 200
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: "Internal server error", statusCode: 500 },
      { status: 500 }
    );
  }
}
