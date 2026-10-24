import {
  getFeaturedProducts,
  getProductBySlug,
  getProductsByCategory,
  SEED_PRODUCTS,
  type Product,
  type ProductCategory,
} from "@/data/products";
import { createAnonClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { productImagePublicUrl } from "@/lib/storage";

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  price_paise: number;
  compare_at_price_paise: number | null;
  quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  image_path: string | null;
  accent_from: string | null;
  accent_to: string | null;
  featured: boolean | null;
};

function mapDbProduct(row: DbProduct): Product {
  const imagePath = row.image_path;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    pricePaise: row.price_paise,
    compareAtPricePaise: row.compare_at_price_paise ?? null,
    quantity: row.quantity,
    lowStockThreshold: row.low_stock_threshold,
    featured: Boolean(row.featured),
    accentFrom: row.accent_from ?? "#f3d6cf",
    accentTo: row.accent_to ?? "#c97b7b",
    isActive: row.is_active,
    imagePath,
    imageUrl: productImagePublicUrl(imagePath),
  };
}

export async function listProducts(
  category: ProductCategory | "all" = "all",
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return getProductsByCategory(category);
  }

  const supabase = createAnonClient();
  if (!supabase) return getProductsByCategory(category);

  let query = supabase.from("products").select("*").eq("is_active", true);
  if (category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query.order("name");
  if (error || !data) {
    return getProductsByCategory(category);
  }
  return (data as DbProduct[]).map(mapDbProduct);
}

export async function listFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return getFeaturedProducts();
  }

  const supabase = createAnonClient();
  if (!supabase) return getFeaturedProducts();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("featured", true)
    .order("name");

  if (error || !data || data.length === 0) {
    return getFeaturedProducts();
  }
  return (data as DbProduct[]).map(mapDbProduct);
}

export async function findProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) {
    return getProductBySlug(slug);
  }

  const supabase = createAnonClient();
  if (!supabase) return getProductBySlug(slug);

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return getProductBySlug(slug);
  }
  return mapDbProduct(data as DbProduct);
}

export async function getProductStockMap(
  productIds: string[],
): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};

  if (!isSupabaseConfigured()) {
    return Object.fromEntries(
      SEED_PRODUCTS.filter((p) => productIds.includes(p.id)).map((p) => [
        p.id,
        p.quantity,
      ]),
    );
  }

  const supabase = createAnonClient();
  if (!supabase) {
    return Object.fromEntries(
      SEED_PRODUCTS.filter((p) => productIds.includes(p.id)).map((p) => [
        p.id,
        p.quantity,
      ]),
    );
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, quantity")
    .in("id", productIds);

  if (error || !data) {
    return Object.fromEntries(
      SEED_PRODUCTS.filter((p) => productIds.includes(p.id)).map((p) => [
        p.id,
        p.quantity,
      ]),
    );
  }

  return Object.fromEntries(
    data.map((row: { id: string; quantity: number }) => [row.id, row.quantity]),
  );
}
