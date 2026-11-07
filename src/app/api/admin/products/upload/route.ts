import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/auth/admin";
import { isMongoConfigured } from "@/lib/mongo";
import { updateProductFields } from "@/lib/repositories/products";
import { productImagePublicUrl } from "@/lib/storage";

function getS3Client(): S3Client | null {
  const region = process.env.AWS_REGION || "us-east-1";
  const bucket = process.env.S3_BUCKET;
  if (!bucket) return null;
  return new S3Client({
    region,
    // Avoid PermanentRedirect when AWS_REGION does not match the bucket.
    followRegionRedirects: true,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "MongoDB is not configured" },
      { status: 500 },
    );
  }

  const s3 = getS3Client();
  const bucket = process.env.S3_BUCKET;
  if (!s3 || !bucket) {
    return NextResponse.json(
      { error: "S3 is not configured (AWS_REGION, S3_BUCKET)" },
      { status: 500 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const productId = String(form.get("productId") ?? "");

  if (!(file instanceof File) || !productId) {
    return NextResponse.json(
      { error: "file and productId required" },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${productId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    // No ACL: modern buckets often use "Bucket owner enforced".
    // Make objects readable via a public bucket policy instead.
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        Body: buffer,
        ContentType: file.type || "image/jpeg",
      }),
    );

    await updateProductFields(productId, {
      imagePath: path,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      path,
      publicUrl: productImagePublicUrl(path),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
