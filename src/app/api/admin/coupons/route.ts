import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { normalizeCouponCode } from "@/domain/coupons";
import { isMongoConfigured } from "@/lib/mongo";
import {
  insertCoupon,
  listAllCouponsAdmin,
  setCouponActive,
} from "@/lib/repositories/coupons";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "MongoDB is not configured" },
      { status: 500 },
    );
  }

  const docs = await listAllCouponsAdmin();
  return NextResponse.json({
    coupons: docs.map((c) => ({
      id: c._id.toHexString(),
      code: c.code,
      occasion_label: c.occasionLabel,
      description: c.description,
      discount_type: c.discountType,
      percent_off: c.percentOff,
      amount_paise: c.amountPaise,
      min_order_paise: c.minOrderPaise,
      starts_at: c.startsAt,
      ends_at: c.endsAt,
      is_active: c.isActive,
      created_at: c.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "MongoDB is not configured" },
      { status: 500 },
    );
  }

  const body = await request.json();
  const code = normalizeCouponCode(String(body.code ?? ""));
  const discountType = body.discountType as "percent" | "flat";

  if (!code || !body.occasionLabel || !discountType) {
    return NextResponse.json({ error: "Missing coupon fields" }, { status: 400 });
  }

  try {
    const id = await insertCoupon({
      code,
      occasionLabel: String(body.occasionLabel),
      description: String(body.description ?? ""),
      discountType,
      percentOff: discountType === "percent" ? Number(body.percentOff) : null,
      amountPaise: discountType === "flat" ? Number(body.amountPaise) : null,
      minOrderPaise: Number(body.minOrderPaise ?? 0),
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      isActive: body.isActive !== false,
    });
    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Create failed" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "MongoDB is not configured" },
      { status: 500 },
    );
  }

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const ok = await setCouponActive(body.id, Boolean(body.isActive));
  if (!ok) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
