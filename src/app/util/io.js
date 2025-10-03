import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Load environment variables
const REGION = process.env.DO_SPACE_REGION;
const BUCKET_NAME = process.env.DO_SPACE_BUCKET;
const ACCESS_KEY = process.env.DO_SPACE_ACCESS_KEY;
const SECRET_KEY = process.env.DO_SPACE_SECRET_KEY;
const ENDPOINT = process.env.DO_SPACE_ENDPOINT;

// Initialize the DigitalOcean Spaces S3 client


/**
 * Generate a signed URL to upload a file to DigitalOcean Spaces.
 * @param {string} fileName - Name of file to upload (including folder path if any)
 * @param {string} fileType - MIME type of the file (e.g. 'image/jpeg')
 * @returns {Promise<string>} - A signed URL valid for 15 minutes
 */
export async function generateUploadSignedUrl(fileName, fileType) {
  const s3Client = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  return signedUrl;
}

export async function generateDownloadSignedUrl(fileName) {
  console.log("Region:", REGION);
  const s3Client = new S3Client({
  region: REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
  });
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  return signedUrl;
}
