import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function deleteFromR2(url: string): Promise<void> {
  const r2Base = process.env.R2_PUBLIC_URL;
  if (!r2Base || !url.startsWith(r2Base)) return;

  const key = url.slice(r2Base.length + 1); // remove trailing slash
  await r2Client.send(
    new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }),
  );
}
