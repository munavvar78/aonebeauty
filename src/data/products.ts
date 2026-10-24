export type ProductCategory = "skin" | "makeup" | "body" | "fragrance";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  /** Selling price in paise */
  pricePaise: number;
  /** Optional MRP / original price in paise (shown struck through when higher) */
  compareAtPricePaise?: number | null;
  quantity: number;
  lowStockThreshold: number;
  featured: boolean;
  accentFrom: string;
  accentTo: string;
  isActive: boolean;
  imagePath?: string | null;
  imageUrl?: string | null;
};

export const CATEGORIES: { id: ProductCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "skin", label: "Skin" },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "p-face-wash",
    slug: "gentle-face-wash",
    name: "Gentle Face Wash",
    description:
      "A soft daily face wash that cleans without stripping. Leaves skin calm, fresh, and ready for cream.",
    category: "skin",
    pricePaise: 17000,
    compareAtPricePaise: 29900,
    quantity: 50,
    lowStockThreshold: 5,
    featured: true,
    accentFrom: "#e8efe8",
    accentTo: "#8aa89a",
    isActive: true,
  },
  {
    id: "p-cream",
    slug: "soft-day-cream",
    name: "Soft Day Cream",
    description:
      "A light everyday cream for soft, comfortable skin. Absorbs clean — perfect after your face wash.",
    category: "skin",
    pricePaise: 6000,
    compareAtPricePaise: null,
    quantity: 50,
    lowStockThreshold: 5,
    featured: true,
    accentFrom: "#f3d6cf",
    accentTo: "#c97b7b",
    isActive: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return SEED_PRODUCTS.find((p) => p.slug === slug && p.isActive);
}

export function getFeaturedProducts(): Product[] {
  return SEED_PRODUCTS.filter((p) => p.featured && p.isActive);
}

export function getProductsByCategory(
  category: ProductCategory | "all",
): Product[] {
  const active = SEED_PRODUCTS.filter((p) => p.isActive);
  if (category === "all") return active;
  return active.filter((p) => p.category === category);
}
