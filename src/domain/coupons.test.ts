import { describe, expect, it } from "vitest";
import { computeCouponDiscount, type Coupon } from "./coupons";

const base: Coupon = {
  code: "WELCOME10",
  occasionLabel: "Welcome",
  description: "Welcome offer",
  discountType: "percent",
  percentOff: 10,
  amountPaise: null,
  minOrderPaise: 50000,
  startsAt: null,
  endsAt: null,
  isActive: true,
};

describe("computeCouponDiscount", () => {
  it("applies percent off and caps at subtotal", () => {
    const result = computeCouponDiscount(base, 100000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.discountPaise).toBe(10000);
    expect(result.payablePaise).toBe(90000);
  });

  it("rejects below min order", () => {
    const result = computeCouponDiscount(base, 10000);
    expect(result.ok).toBe(false);
  });

  it("applies flat discount in paise", () => {
    const coupon: Coupon = {
      ...base,
      code: "FLAT200",
      discountType: "flat",
      percentOff: null,
      amountPaise: 20000,
      minOrderPaise: 0,
    };
    const result = computeCouponDiscount(coupon, 50000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.discountPaise).toBe(20000);
    expect(result.payablePaise).toBe(30000);
  });

  it("caps flat discount at subtotal", () => {
    const coupon: Coupon = {
      ...base,
      discountType: "flat",
      percentOff: null,
      amountPaise: 99900,
      minOrderPaise: 0,
    };
    const result = computeCouponDiscount(coupon, 50000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.discountPaise).toBe(50000);
    expect(result.payablePaise).toBe(0);
  });

  it("rejects inactive coupons", () => {
    const result = computeCouponDiscount({ ...base, isActive: false }, 100000);
    expect(result.ok).toBe(false);
  });
});
