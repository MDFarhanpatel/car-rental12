// import { NextResponse } from "next/server";
// import { PrismaClient } from "../../../../../generated/prisma-client";

// // Initialize Prisma Client correctly
// const prisma = new PrismaClient();
// export async function GET() {
//   try {
//     const users = await prisma.user.findMany();
//     return NextResponse.json({ data: users, statusCode: 200 });
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error", statusCode: 500 },
//       { status: 500 }
//     );
//   } 
// }
//   catch (error) {
//     console.error('Internal server error:', error);
//     return NextResponse.json(
//       { message: "Internal server error", statusCode: 500 },
//       { status: 500 }
//     );
//   }
