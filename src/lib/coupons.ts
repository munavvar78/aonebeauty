import { SEED_COUPONS } from "@/data/coupons";
import {
  computeCouponDiscount,
  isCouponInWindow,
  normalizeCouponCode,
  type Coupon,
} from "@/domain/coupons";
import { createAnonClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { createServiceRoleClient } from "@/lib/supabase/server";

type DbCoupon = {
  code: string;
  occasion_label: string;
  description: string;
  discount_type: "percent" | "flat";
  percent_off: number | null;
  amount_paise: number | null;
  min_order_paise: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

function mapCoupon(row: DbCoupon): Coupon {
  return {
    code: row.code,
    occasionLabel: row.occasion_label,
    description: row.description,
    discountType: row.discount_type,
    percentOff: row.percent_off,
    amountPaise: row.amount_paise,
    minOrderPaise: row.min_order_paise,
    startsAt: row.starts_at ? new Date(row.starts_at) : null,
    endsAt: row.ends_at ? new Date(row.ends_at) : null,
    isActive: row.is_active,
  };
}

export async function listActiveCoupons(): Promise<Coupon[]> {
  if (!isSupabaseConfigured()) {
    return SEED_COUPONS.filter((c) => isCouponInWindow(c));
  }

  const supabase = createAnonClient();
  if (!supabase) {
    return SEED_COUPONS.filter((c) => isCouponInWindow(c));
  }

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .order("occasion_label");

  if (error || !data || data.length === 0) {
    return SEED_COUPONS.filter((c) => isCouponInWindow(c));
  }

  return (data as DbCoupon[])
    .map(mapCoupon)
    .filter((c) => isCouponInWindow(c));
}

export async function findCouponByCode(code: string): Promise<Coupon | null> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;

  if (!isSupabaseConfigured()) {
    return (
      SEED_COUPONS.find((c) => normalizeCouponCode(c.code) === normalized) ??
      null
    );
  }

  const db = createServiceRoleClient() ?? createAnonClient();
  if (!db) {
    return (
      SEED_COUPONS.find((c) => normalizeCouponCode(c.code) === normalized) ??
      null
    );
  }

  const { data, error } = await db
    .from("coupons")
    .select("*")
    .ilike("code", normalized)
    .maybeSingle();

  if (error || !data) {
    return (
      SEED_COUPONS.find((c) => normalizeCouponCode(c.code) === normalized) ??
      null
    );
  }

  return mapCoupon(data as DbCoupon);
}

export async function applyCouponCode(
  code: string,
  subtotalPaise: number,
) {
  const coupon = await findCouponByCode(code);
  if (!coupon) {
    return { ok: false as const, error: "Unknown coupon code" };
  }
  return computeCouponDiscount(coupon, subtotalPaise);
}
