import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/v1/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";    
import bcrypt from "bcryptjs";

const bodySchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
}); 

export  async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new ApiError(401, "Unauthorized");
    }
    const body = await request.json();
    const { currentPassword, newPassword } = bodySchema.parse(body);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { password: true },
    });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ApiError(400, "Current password is incorrect");
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedNewPassword },
    });
    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    } else if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    } else {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }     
  }
}
