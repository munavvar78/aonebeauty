const BUCKET = "product-images";

/** Build a public Supabase Storage URL from a stored object path. */
export function productImagePublicUrl(
  imagePath: string | null | undefined,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
): string | null {
  if (!imagePath || !supabaseUrl) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${imagePath.replace(/^\//, "")}`;
}
