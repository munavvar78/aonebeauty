/** Build a public S3 URL from a stored object key. */
export function productImagePublicUrl(
  imagePath: string | null | undefined,
): string | null {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const explicitBase = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (explicitBase) {
    return `${explicitBase}/${imagePath.replace(/^\//, "")}`;
  }

  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION || "us-east-1";
  if (!bucket) return null;

  return `https://${bucket}.s3.${region}.amazonaws.com/${imagePath.replace(/^\//, "")}`;
}
