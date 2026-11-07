import {
  getFeaturedProducts,
  getProductBySlug,
  getProductsByCategory,
  SEED_PRODUCTS,
  type Product,
  type ProductCategory,
} from "@/data/products";
import { isMongoConfigured } from "@/lib/mongo";
import {
  findActiveProductBySlug,
  getStockMap,
  listActiveProducts,
  listFeaturedActiveProducts,
} from "@/lib/repositories/products";

export async function listProducts(
  category: ProductCategory | "all" = "all",
): Promise<Product[]> {
  if (!isMongoConfigured()) {
    return getProductsByCategory(category);
  }

  try {
    return await listActiveProducts(category);
  } catch {
    return getProductsByCategory(category);
  }
}

export async function listFeaturedProducts(): Promise<Product[]> {
  if (!isMongoConfigured()) {
    return getFeaturedProducts();
  }

  try {
    const featured = await listFeaturedActiveProducts();
    if (featured.length > 0) return featured;
    return listActiveProducts("all");
  } catch {
    return getFeaturedProducts();
  }
}

export async function findProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (!isMongoConfigured()) {
    return getProductBySlug(slug);
  }

  try {
    const product = await findActiveProductBySlug(slug);
    return product ?? getProductBySlug(slug);
  } catch {
    return getProductBySlug(slug);
  }
}

export async function getProductStockMap(
  productIds: string[],
): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};

  if (!isMongoConfigured()) {
    return Object.fromEntries(
      SEED_PRODUCTS.filter((p) => productIds.includes(p.id)).map((p) => [
        p.id,
        p.quantity,
      ]),
    );
  }

  try {
    const map = await getStockMap(productIds);
    if (Object.keys(map).length > 0) return map;
  } catch {
    // fall through to seed
  }

  return Object.fromEntries(
    SEED_PRODUCTS.filter((p) => productIds.includes(p.id)).map((p) => [
      p.id,
      p.quantity,
    ]),
  );
}
