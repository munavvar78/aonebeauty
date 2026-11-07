import {
  applyStockAdjustment,
  type StockAdjustment,
  type StockAdjustmentReason,
} from "@/domain/inventory";
import { isMongoConfigured } from "@/lib/mongo";
import {
  findProductById,
  setProductQuantityCas,
  decrementProductIfAvailable,
} from "@/lib/repositories/products";
import { insertStockMovement } from "@/lib/repositories/stock";
import type { ClientSession } from "mongodb";

export async function adjustProductStock(input: {
  productId: string;
  adjustment: StockAdjustment;
  note?: string;
  orderId?: string;
}): Promise<{ ok: true; quantity: number } | { ok: false; error: string }> {
  if (!isMongoConfigured()) {
    return { ok: false, error: "MongoDB is not configured" };
  }

  const product = await findProductById(input.productId);
  if (!product) {
    return { ok: false, error: "Product not found" };
  }

  const result = applyStockAdjustment(product.quantity, input.adjustment);
  if (!result.ok) {
    return result;
  }

  const casOk = await setProductQuantityCas(
    input.productId,
    product.quantity,
    result.quantity,
  );
  if (!casOk) {
    return { ok: false, error: "Stock changed concurrently; retry" };
  }

  const reason: StockAdjustmentReason = result.reason;
  await insertStockMovement({
    productId: input.productId,
    delta: result.delta,
    reason,
    note: input.note ?? null,
    orderId: input.orderId ?? null,
  });

  return { ok: true, quantity: result.quantity };
}

/**
 * Conditional sale decrement: succeeds only when quantity >= requested.
 * Used after Razorpay verification (optionally inside a Mongo transaction).
 */
export async function trySaleDecrement(input: {
  productId: string;
  quantity: number;
  orderId: string;
  session?: ClientSession;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isMongoConfigured()) {
    return { ok: false, error: "MongoDB is not configured" };
  }

  const decremented = await decrementProductIfAvailable(
    input.productId,
    input.quantity,
    input.session,
  );
  if (!decremented.ok) {
    return { ok: false, error: "insufficient stock" };
  }

  await insertStockMovement(
    {
      productId: input.productId,
      delta: -input.quantity,
      reason: "sale",
      note: "Verified Razorpay sale",
      orderId: input.orderId,
    },
    input.session,
  );

  return { ok: true };
}
