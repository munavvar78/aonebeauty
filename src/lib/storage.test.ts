import { describe, expect, it } from "vitest";
import { productImagePublicUrl } from "./storage";

describe("productImagePublicUrl", () => {
  it("returns null without path or url", () => {
    expect(productImagePublicUrl(null, "https://x.supabase.co")).toBeNull();
    expect(productImagePublicUrl("a.jpg", undefined)).toBeNull();
  });

  it("builds a public storage URL", () => {
    expect(productImagePublicUrl("abc/photo.jpg", "https://x.supabase.co")).toBe(
      "https://x.supabase.co/storage/v1/object/public/product-images/abc/photo.jpg",
    );
  });

  it("passes through absolute URLs", () => {
    expect(
      productImagePublicUrl("https://cdn.example/p.jpg", "https://x.supabase.co"),
    ).toBe("https://cdn.example/p.jpg");
  });
});
