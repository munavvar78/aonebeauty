import { describe, expect, it } from "vitest";
import { validateCheckout } from "./checkout";

const valid = {
  name: "Asha Rao",
  phone: "9876543210",
  email: "asha@example.com",
  address: "12 Lotus Lane, Koramangala",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560034",
};

describe("validateCheckout", () => {
  it("accepts a valid guest checkout payload", () => {
    const result = validateCheckout(valid);
    expect(result.ok).toBe(true);
  });

  it("rejects invalid Indian phone numbers", () => {
    const result = validateCheckout({ ...valid, phone: "12345" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.phone).toBeTruthy();
  });

  it("requires a 6-digit pincode", () => {
    const result = validateCheckout({ ...valid, pincode: "560" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.pincode).toBeTruthy();
  });

  it("allows blank email", () => {
    const result = validateCheckout({ ...valid, email: "" });
    expect(result.ok).toBe(true);
  });
});
