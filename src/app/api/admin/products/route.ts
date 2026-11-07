import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { isMongoConfigured } from "@/lib/mongo";
import {
  insertProduct,
  updateProductFields,
} from "@/lib/repositories/products";
import { insertStockMovement } from "@/lib/repositories/stock";

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

  try {
    const id = await insertProduct({
      slug,
      name,
      description: description ?? "",
      category,
      pricePaise,
      compareAtPricePaise:
        compareAtPricePaise === null || compareAtPricePaise === ""
          ? null
          : Number(compareAtPricePaise),
      quantity,
      lowStockThreshold,
      featured,
      accentFrom,
      accentTo,
      isActive,
      imagePath,
    });

    if (Number.isInteger(quantity) && quantity > 0) {
      await insertStockMovement({
        productId: id,
        delta: quantity,
        reason: "restock",
        note: "Initial stock on create",
      });
    }

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
  const { id, ...fields } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  if (fields.quantity !== undefined) {
    return NextResponse.json(
      { error: "Set quantity via stock adjustment endpoint" },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (fields.name !== undefined) update.name = fields.name;
  if (fields.description !== undefined) update.description = fields.description;
  if (fields.category !== undefined) update.category = fields.category;
  if (fields.pricePaise !== undefined) update.pricePaise = fields.pricePaise;
  if (fields.compareAtPricePaise !== undefined) {
    update.compareAtPricePaise =
      fields.compareAtPricePaise === null || fields.compareAtPricePaise === ""
        ? null
        : Number(fields.compareAtPricePaise);
  }
  if (fields.lowStockThreshold !== undefined) {
    update.lowStockThreshold = fields.lowStockThreshold;
  }
  if (fields.featured !== undefined) update.featured = fields.featured;
  if (fields.isActive !== undefined) update.isActive = fields.isActive;
  if (fields.accentFrom !== undefined) update.accentFrom = fields.accentFrom;
  if (fields.accentTo !== undefined) update.accentTo = fields.accentTo;
  if (fields.imagePath !== undefined) update.imagePath = fields.imagePath;
  if (fields.slug !== undefined) update.slug = fields.slug;

  try {
    const ok = await updateProductFields(id, update as never);
    if (!ok) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 400 },
    );
  }
}
