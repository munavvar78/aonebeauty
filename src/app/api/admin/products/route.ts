import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const db = createServiceRoleClient();
  if (!db) {
    return NextResponse.json(
      { error: "Service role client is not configured" },
      { status: 500 },
    );
  }

  const body = await request.json();
  const {
    slug,
    name,
    description,
    category,
    pricePaise,
    compareAtPricePaise = null,
    quantity,
    lowStockThreshold = 5,
    featured = false,
    accentFrom = "#f3d6cf",
    accentTo = "#c97b7b",
    isActive = true,
    imagePath = null,
  } = body;

  if (
    !slug ||
    !name ||
    !category ||
    !Number.isInteger(pricePaise) ||
    !Number.isInteger(quantity)
  ) {
    return NextResponse.json({ error: "Invalid product payload" }, { status: 400 });
  }

  const { data, error } = await db
    .from("products")
    .insert({
      slug,
      name,
      description: description ?? "",
      category,
      price_paise: pricePaise,
      compare_at_price_paise:
        compareAtPricePaise === null || compareAtPricePaise === ""
          ? null
          : Number(compareAtPricePaise),
      quantity,
      low_stock_threshold: lowStockThreshold,
      featured,
      accent_from: accentFrom,
      accent_to: accentTo,
      is_active: isActive,
      image_path: imagePath,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (Number.isInteger(quantity) && quantity > 0) {
    await db.from("stock_movements").insert({
      product_id: data.id,
      delta: quantity,
      reason: "restock",
      note: "Initial stock on create",
    });
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
    return NextResponse.json(
      { error: "Service role client is not configured" },
      { status: 500 },
    );
  }

  const body = await request.json();
  const { id, ...fields } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (fields.name !== undefined) update.name = fields.name;
  if (fields.description !== undefined) update.description = fields.description;
  if (fields.category !== undefined) update.category = fields.category;
  if (fields.pricePaise !== undefined) update.price_paise = fields.pricePaise;
  if (fields.compareAtPricePaise !== undefined) {
    update.compare_at_price_paise =
      fields.compareAtPricePaise === null || fields.compareAtPricePaise === ""
        ? null
        : Number(fields.compareAtPricePaise);
  }
  if (fields.lowStockThreshold !== undefined) {
    update.low_stock_threshold = fields.lowStockThreshold;
  }
  if (fields.featured !== undefined) update.featured = fields.featured;
  if (fields.isActive !== undefined) update.is_active = fields.isActive;
  if (fields.accentFrom !== undefined) update.accent_from = fields.accentFrom;
  if (fields.accentTo !== undefined) update.accent_to = fields.accentTo;
  if (fields.imagePath !== undefined) update.image_path = fields.imagePath;
  if (fields.slug !== undefined) update.slug = fields.slug;

  // Quantity must never be set directly here — use /api/admin/stock.
  if (fields.quantity !== undefined) {
    return NextResponse.json(
      { error: "Set quantity via stock adjustment endpoint" },
      { status: 400 },
    );
  }

  const { error } = await db.from("products").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
