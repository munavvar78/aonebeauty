import { describe, expect, it, afterEach } from "vitest";
import { productImagePublicUrl } from "./storage";

describe("productImagePublicUrl", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("returns null without path", () => {
    expect(productImagePublicUrl(null)).toBeNull();
    expect(productImagePublicUrl(undefined)).toBeNull();
  });

  it("builds an S3 URL from bucket + region", () => {
    process.env.S3_BUCKET = "aone-bucket";
    process.env.AWS_REGION = "ap-south-1";
    delete process.env.S3_PUBLIC_BASE_URL;
    expect(productImagePublicUrl("abc/photo.jpg")).toBe(
      "https://aone-bucket.s3.ap-south-1.amazonaws.com/abc/photo.jpg",
    );
  });

  it("uses S3_PUBLIC_BASE_URL when set", () => {
    process.env.S3_PUBLIC_BASE_URL = "https://cdn.example.com";
    expect(productImagePublicUrl("abc/photo.jpg")).toBe(
      "https://cdn.example.com/abc/photo.jpg",
    );
  });

  it("passes through absolute URLs", () => {
    expect(productImagePublicUrl("https://cdn.example/p.jpg")).toBe(
      "https://cdn.example/p.jpg",
    );
  });
});
