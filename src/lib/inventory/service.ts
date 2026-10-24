import {
  applyStockAdjustment,
  type StockAdjustment,
  type StockAdjustmentReason,
} from "@/domain/inventory";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function adjustProductStock(input: {
  productId: string;
  adjustment: StockAdjustment;
  note?: string;
  orderId?: string;
}): Promise<{ ok: true; quantity: number } | { ok: false; error: string }> {
  const adminDb = createServiceRoleClient();
  if (!adminDb) {
    return { ok: false, error: "Service role client is not configured" };
  }

  const { data: product, error: readError } = await adminDb
    .from("products")
    .select("id, quantity")
    .eq("id", input.productId)
    .single();

  if (readError || !product) {
    return { ok: false, error: "Product not found" };
  }

  const result = applyStockAdjustment(product.quantity, input.adjustment);
  if (!result.ok) {
    return result;
  }

  const { data: updated, error: updateError } = await adminDb
    .from("products")
    .update({ quantity: result.quantity, updated_at: new Date().toISOString() })
    .eq("id", input.productId)
    .eq("quantity", product.quantity)
    .select("quantity")
    .maybeSingle();

  if (updateError) {
    return { ok: false, error: updateError.message };
  }
  if (!updated) {
    return { ok: false, error: "Stock changed concurrently; retry" };
  }

  const reason: StockAdjustmentReason = result.reason;
  const { error: movementError } = await adminDb.from("stock_movements").insert({
    product_id: input.productId,
    delta: result.delta,
    reason,
    note: input.note ?? null,
    order_id: input.orderId ?? null,
  });

  if (movementError) {
    return { ok: false, error: movementError.message };
  }

  return { ok: true, quantity: result.quantity };
}

/**
 * Conditional sale decrement: succeeds only when quantity >= requested.
 * Used after Razorpay verification.
 */
export async function trySaleDecrement(input: {
  productId: string;
  quantity: number;
  orderId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const adminDb = createServiceRoleClient();
  if (!adminDb) {
    return { ok: false, error: "Service role client is not configured" };
  }

  const { data: product, error: readError } = await adminDb
    .from("products")
    .select("id, quantity")
    .eq("id", input.productId)
    .single();

  if (readError || !product) {
    return { ok: false, error: "Product not found" };
  }

  const planned = applyStockAdjustment(product.quantity, {
    kind: "sale",
    amount: input.quantity,
  });
  if (!planned.ok) {
    return { ok: false, error: planned.error };
  }

  const { data: updated, error: updateError } = await adminDb
    .from("products")
    .update({
      quantity: planned.quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.productId)
    .gte("quantity", input.quantity)
    .select("id")
    .maybeSingle();

  if (updateError) {
    return { ok: false, error: updateError.message };
  }
  if (!updated) {
    return { ok: false, error: "insufficient stock" };
  }

  const { error: movementError } = await adminDb.from("stock_movements").insert({
    product_id: input.productId,
    delta: planned.delta,
    reason: "sale",
    note: "Verified Razorpay sale",
    order_id: input.orderId,
  });

  if (movementError) {
    return { ok: false, error: movementError.message };
  }

  return { ok: true };
}
