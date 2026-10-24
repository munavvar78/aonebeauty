import { applyVerifiedPayment } from "@/domain/orders";
import { trySaleDecrement } from "@/lib/inventory/service";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function applyRazorpayPayment(input: {
  localOrderId: string;
  razorpayOrderId: string;
  paymentId: string;
  signatureValid: boolean;
}): Promise<{ ok: true; status: string } | { ok: false; error: string }> {
  const db = createServiceRoleClient();
  if (!db) {
    return { ok: false, error: "Service role client is not configured" };
  }

  const { data: applied } = await db
    .from("applied_payments")
    .select("payment_id")
    .eq("payment_id", input.paymentId)
    .maybeSingle();

  const appliedIds = new Set<string>(applied ? [applied.payment_id] : []);

  const { data: orderRow, error: orderError } = await db
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", input.localOrderId)
    .maybeSingle();

  if (orderError || !orderRow) {
    return { ok: false, error: "Order not found" };
  }

  if (
    orderRow.razorpay_order_id &&
    orderRow.razorpay_order_id !== input.razorpayOrderId
  ) {
    return { ok: false, error: "Razorpay order mismatch" };
  }

  const items = (
    (orderRow.order_items as Array<{
      product_id: string;
      name: string;
      unit_price_paise: number;
      quantity: number;
    }>) ?? []
  ).map((item) => ({
    productId: item.product_id,
    name: item.name,
    unitPricePaise: item.unit_price_paise,
    quantity: item.quantity,
  }));

  const domainOrder = {
    id: orderRow.id as string,
    status: orderRow.status as
      | "pending"
      | "paid"
      | "failed"
      | "paid_out_of_stock",
    totalPaise: orderRow.total_paise as number,
    razorpayOrderId: orderRow.razorpay_order_id as string | undefined,
    razorpayPaymentId: orderRow.razorpay_payment_id as string | undefined,
    items,
  };

  if (!input.signatureValid) {
    const decision = applyVerifiedPayment({
      order: domainOrder,
      paymentId: input.paymentId,
      signatureValid: false,
      stockDecrementSucceeded: false,
      appliedPaymentIds: appliedIds,
    });
    if (!decision.ok) return decision;
    await db
      .from("orders")
      .update({
        status: decision.order.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderRow.id);
    return { ok: true, status: decision.order.status };
  }

  if (appliedIds.has(input.paymentId) || domainOrder.status === "paid") {
    return { ok: true, status: domainOrder.status };
  }

  // Pre-check all lines so we never partially decrement.
  const productIds = items.map((item) => item.productId);
  const { data: stockRows } = await db
    .from("products")
    .select("id, quantity")
    .in("id", productIds);

  const stockMap = new Map(
    (stockRows ?? []).map((row: { id: string; quantity: number }) => [
      row.id,
      row.quantity,
    ]),
  );

  const stockOk = items.every(
    (item) => (stockMap.get(item.productId) ?? 0) >= item.quantity,
  );

  const decision = applyVerifiedPayment({
    order: domainOrder,
    paymentId: input.paymentId,
    signatureValid: true,
    stockDecrementSucceeded: stockOk,
    appliedPaymentIds: appliedIds,
  });

  if (!decision.ok) return decision;

  if (decision.alreadyApplied) {
    return { ok: true, status: decision.order.status };
  }

  if (decision.shouldDecrementStock) {
    for (const item of items) {
      const decrement = await trySaleDecrement({
        productId: item.productId,
        quantity: item.quantity,
        orderId: domainOrder.id,
      });
      if (!decrement.ok) {
        await db
          .from("orders")
          .update({
            status: "paid_out_of_stock",
            razorpay_payment_id: input.paymentId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", domainOrder.id);
        await db.from("applied_payments").upsert({
          payment_id: input.paymentId,
          order_id: domainOrder.id,
        });
        return { ok: true, status: "paid_out_of_stock" };
      }
    }
  }

  await db.from("applied_payments").upsert({
    payment_id: input.paymentId,
    order_id: domainOrder.id,
  });
  await db
    .from("orders")
    .update({
      status: decision.order.status,
      razorpay_payment_id: input.paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", domainOrder.id);

  return { ok: true, status: decision.order.status };
}
