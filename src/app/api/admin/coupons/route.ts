import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { normalizeCouponCode } from "@/domain/coupons";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const db = createServiceRoleClient();
  if (!db) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
  }

  const { data, error } = await db
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ coupons: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const db = createServiceRoleClient();
  if (!db) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
  }

  const body = await request.json();
  const code = normalizeCouponCode(String(body.code ?? ""));
  const discountType = body.discountType as "percent" | "flat";

  if (!code || !body.occasionLabel || !discountType) {
    return NextResponse.json({ error: "Missing coupon fields" }, { status: 400 });
  }

  const row = {
    code,
    occasion_label: String(body.occasionLabel),
    description: String(body.description ?? ""),
    discount_type: discountType,
    percent_off: discountType === "percent" ? Number(body.percentOff) : null,
    amount_paise: discountType === "flat" ? Number(body.amountPaise) : null,
    min_order_paise: Number(body.minOrderPaise ?? 0),
    starts_at: body.startsAt || null,
    ends_at: body.endsAt || null,
    is_active: body.isActive !== false,
  };

  const { data, error } = await db.from("coupons").insert(row).select("id").single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const db = createServiceRoleClient();
  if (!db) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
  }

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await db
    .from("coupons")
    .update({ is_active: Boolean(body.isActive) })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
