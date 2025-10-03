import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

// Configuration constants
const REGION = "blr1";
const BUCKET_NAME = "sdhub";

// DigitalOcean Spaces credentials from environment variables (recommended)
const ACCESS_KEY = process.env.DO_SPACE_ACCESS_KEY;
const SECRET_KEY = process.env.DO_SPACE_SECRET_KEY;

if (!ACCESS_KEY || !SECRET_KEY) {
  console.warn("Warning: DO_SPACE_ACCESS_KEY or DO_SPACE_SECRET_KEY not set");
}

// Initialize the S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  region: REGION,
  endpoint: "https://blr1.digitaloceanspaces.com",
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

// GET handler - reads filename/type from query parameters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("filename");
    const fileType = searchParams.get("type");

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Missing required parameters: filename and type" },
        { status: 400 }
      );
    }

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
      ACL: "public-read",
    });

    const signedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 900, // 15 minutes
    });

    return NextResponse.json({ data: { url: signedUrl } }, { status: 200 });
  } catch (error) {
    console.error("Error generating signed URL (GET):", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}

// POST handler - reads filename/type from JSON body
export async function POST(request) {
  try {
    const body = await request.json();
    const { fileName, fileType } = body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "Missing required parameters: fileName and fileType" },
        { status: 400 }
      );
    }

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
      ACL: "public-read",
    });

    const signedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 900, // 15 minutes
    });

    return NextResponse.json({ data: { url: signedUrl } }, { status: 200 });
  } catch (error) {
    console.error("Error generating signed URL (POST):", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
