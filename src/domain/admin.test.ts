import { describe, expect, it } from "vitest";
import { isAllowlistedAdmin } from "./admin";

describe("isAllowlistedAdmin", () => {
  it("matches allowlisted email case-insensitively", () => {
    expect(isAllowlistedAdmin("Admin@Aone.beauty", "admin@aone.beauty")).toBe(
      true,
    );
  });

  it("rejects other emails", () => {
    expect(isAllowlistedAdmin("guest@example.com", "admin@aone.beauty")).toBe(
      false,
    );
  });

  it("rejects missing values", () => {
    expect(isAllowlistedAdmin(null, "admin@aone.beauty")).toBe(false);
    expect(isAllowlistedAdmin("admin@aone.beauty", undefined)).toBe(false);
  });
});
