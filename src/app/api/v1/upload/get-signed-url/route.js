import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const REGION = "blr1";
const BUCKET_NAME = "sdhub";

// DigitalOcean access credentials
const ACCESS_KEY = "DO00BEMEAPVBLQF9MZE6";
const SECRET_KEY = "VfOEUenigzyb9+wzwiNz9VlSgBJXu4OQ9RCDAQfcrE8";

// Initialize S3 client
const s3Client = new S3Client({
  region: REGION,
  endpoint: "https://blr1.digitaloceanspaces.com",
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileName, fileType } = body;
    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Missing fileName or fileType" }, { status: 400 });
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    // Wrap signedUrl inside "data" object
    return NextResponse.json({ data: { url: signedUrl } }, { status: 200 });
  } catch (error) {
    console.error("Error generating signed URL", error);
    return NextResponse.json({ error: "Could not generate signed URL" }, { status: 500 });
  }
}
