import { SEED_COUPONS } from "@/data/coupons";
import {
  computeCouponDiscount,
  isCouponInWindow,
  normalizeCouponCode,
  type Coupon,
} from "@/domain/coupons";
import { isMongoConfigured } from "@/lib/mongo";
import {
  findCouponByCodeDoc,
  listActiveCouponsDocs,
} from "@/lib/repositories/coupons";

export async function listActiveCoupons(): Promise<Coupon[]> {
  if (!isMongoConfigured()) {
    return SEED_COUPONS.filter((c) => isCouponInWindow(c));
  }

  try {
    const coupons = await listActiveCouponsDocs();
    if (coupons.length === 0) {
      return SEED_COUPONS.filter((c) => isCouponInWindow(c));
    }
    return coupons.filter((c) => isCouponInWindow(c));
  } catch {
    return SEED_COUPONS.filter((c) => isCouponInWindow(c));
  }
}

export async function findCouponByCode(code: string): Promise<Coupon | null> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;

  if (!isMongoConfigured()) {
    return (
      SEED_COUPONS.find((c) => normalizeCouponCode(c.code) === normalized) ??
      null
    );
  }

  try {
    const coupon = await findCouponByCodeDoc(normalized);
    if (coupon) return coupon;
  } catch {
    // fall through
  }

  return (
    SEED_COUPONS.find((c) => normalizeCouponCode(c.code) === normalized) ??
    null
  );
}

export async function applyCouponCode(code: string, subtotalPaise: number) {
  const coupon = await findCouponByCode(code);
  if (!coupon) {
    return { ok: false as const, error: "Unknown coupon code" };
  }
  return computeCouponDiscount(coupon, subtotalPaise);
}
