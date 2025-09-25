import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "3c70e2953eb0c8ae70ba1a6b71102036e1d4ebc10e3fd3830dc124b9051afd6b60810da228a723d3b4b759c765b4d3a7364ac746b0573119e69a86042c7258df";

// Set your frontend origin here for CORS (change in production)
const allowedOrigin = "http://localhost:3000";

// Handle CORS preflight OPTIONS request
export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// Handle POST /api/v1/providers/login - User login
export async function POST(request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const provider = await prisma.provider.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: "No account found. Please register first." },
        { status: 404, headers: corsHeaders }
      );
    }

    const validPassword = await bcrypt.compare(password, provider.password);
    if (!validPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!provider.mobileOTPVerified || !provider.emailOTPVerified) {
      return NextResponse.json(
        { success: false, error: "Email or Mobile OTP not verified" },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = jwt.sign(
      {
        id: provider.id,
        email: provider.email,
        name: provider.name,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json(
      { success: true, token, message: "Login successful" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}
