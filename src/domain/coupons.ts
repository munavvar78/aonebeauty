import { assertPaise, type Paise } from "./money";

export type CouponDiscountType = "percent" | "flat";

export type Coupon = {
  code: string;
  occasionLabel: string;
  description: string;
  discountType: CouponDiscountType;
  /** Integer percent 1–100 when type is percent */
  percentOff: number | null;
  /** Flat discount in paise when type is flat */
  amountPaise: Paise | null;
  minOrderPaise: Paise;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
};

export type CouponApplyResult =
  | {
      ok: true;
      code: string;
      occasionLabel: string;
      discountPaise: Paise;
      payablePaise: Paise;
    }
  | { ok: false; error: string };

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isCouponInWindow(coupon: Coupon, now = new Date()): boolean {
  if (!coupon.isActive) return false;
  if (coupon.startsAt && now < coupon.startsAt) return false;
  if (coupon.endsAt && now > coupon.endsAt) return false;
  return true;
}

export function computeCouponDiscount(
  coupon: Coupon,
  subtotalPaise: Paise,
  now = new Date(),
): CouponApplyResult {
  assertPaise(subtotalPaise, "subtotalPaise");

  if (!isCouponInWindow(coupon, now)) {
    return { ok: false, error: "This coupon is not active right now" };
  }

  if (subtotalPaise < coupon.minOrderPaise) {
    return {
      ok: false,
      error: `Minimum order is ₹${(coupon.minOrderPaise / 100).toFixed(0)}`,
    };
  }

  let discountPaise = 0;

  if (coupon.discountType === "percent") {
    const pct = coupon.percentOff;
    if (pct == null || !Number.isInteger(pct) || pct < 1 || pct > 100) {
      return { ok: false, error: "Invalid percent coupon" };
    }
    discountPaise = Math.floor((subtotalPaise * pct) / 100);
  } else {
    const flat = coupon.amountPaise;
    if (flat == null || !Number.isInteger(flat) || flat <= 0) {
      return { ok: false, error: "Invalid flat coupon" };
    }
    discountPaise = flat;
  }

  discountPaise = Math.min(discountPaise, subtotalPaise);
  if (discountPaise <= 0) {
    return { ok: false, error: "Coupon does not apply" };
  }

  return {
    ok: true,
    code: normalizeCode(coupon.code),
    occasionLabel: coupon.occasionLabel,
    discountPaise,
    payablePaise: subtotalPaise - discountPaise,
  };
}

export function normalizeCouponCode(code: string): string {
  return normalizeCode(code);
}
