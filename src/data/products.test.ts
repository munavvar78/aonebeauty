import { describe, expect, it } from "vitest";
import {
  getFeaturedProducts,
  getProductBySlug,
  getProductsByCategory,
  SEED_PRODUCTS,
} from "./products";

describe("product catalog", () => {
  it("looks up products by slug", () => {
    expect(getProductBySlug("gentle-face-wash")?.name).toBe("Gentle Face Wash");
    expect(getProductBySlug("soft-day-cream")?.pricePaise).toBe(6000);
    expect(getProductBySlug("missing")).toBeUndefined();
  });

  it("has face wash sale price under MRP", () => {
    const wash = getProductBySlug("gentle-face-wash");
    expect(wash?.pricePaise).toBe(17000);
    expect(wash?.compareAtPricePaise).toBe(29900);
  });

  it("returns featured products", () => {
    expect(getFeaturedProducts()).toHaveLength(2);
    expect(getFeaturedProducts().every((p) => p.featured)).toBe(true);
  });

  it("filters by category", () => {
    expect(getProductsByCategory("skin").every((p) => p.category === "skin")).toBe(
      true,
    );
    expect(getProductsByCategory("all").length).toBe(
      SEED_PRODUCTS.filter((p) => p.isActive).length,
    );
  });
});
