import { applyVerifiedPayment } from "@/domain/orders";
import { trySaleDecrement } from "@/lib/inventory/service";
import { isMongoConfigured, withTransaction } from "@/lib/mongo";
import {
  findOrderById,
  updateOrderStatus,
} from "@/lib/repositories/orders";
import {
  findAppliedPayment,
  upsertAppliedPayment,
} from "@/lib/repositories/payments";
import { getStockMap } from "@/lib/repositories/products";

export async function applyRazorpayPayment(input: {
  localOrderId: string;
  razorpayOrderId: string;
  paymentId: string;
  signatureValid: boolean;
}): Promise<{ ok: true; status: string } | { ok: false; error: string }> {
  if (!isMongoConfigured()) {
    return { ok: false, error: "MongoDB is not configured" };
  }

  const applied = await findAppliedPayment(input.paymentId);
  const appliedIds = new Set<string>(applied ? [applied.paymentId] : []);

  const orderRow = await findOrderById(input.localOrderId);
  if (!orderRow) {
    return { ok: false, error: "Order not found" };
  }

  if (
    orderRow.razorpayOrderId &&
    orderRow.razorpayOrderId !== input.razorpayOrderId
  ) {
    return { ok: false, error: "Razorpay order mismatch" };
  }

  const items = orderRow.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    unitPricePaise: item.unitPricePaise,
    quantity: item.quantity,
  }));

  const domainOrder = {
    id: orderRow._id.toHexString(),
    status: orderRow.status,
    totalPaise: orderRow.totalPaise,
    razorpayOrderId: orderRow.razorpayOrderId ?? undefined,
    razorpayPaymentId: orderRow.razorpayPaymentId ?? undefined,
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
    await updateOrderStatus(domainOrder.id, { status: decision.order.status });
    return { ok: true, status: decision.order.status };
  }

  if (appliedIds.has(input.paymentId) || domainOrder.status === "paid") {
    return { ok: true, status: domainOrder.status };
  }

  const productIds = items.map((item) => item.productId);
  const stockMapObj = await getStockMap(productIds);
  const stockMap = new Map(Object.entries(stockMapObj));

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

  if (!decision.shouldDecrementStock) {
    await upsertAppliedPayment(input.paymentId, domainOrder.id);
    await updateOrderStatus(domainOrder.id, {
      status: decision.order.status,
      razorpayPaymentId: input.paymentId,
    });
    return { ok: true, status: decision.order.status };
  }

  try {
    await withTransaction(async (session) => {
      for (const item of items) {
        const decrement = await trySaleDecrement({
          productId: item.productId,
          quantity: item.quantity,
          orderId: domainOrder.id,
          session,
        });
        if (!decrement.ok) {
          throw new Error("insufficient stock");
        }
      }
      await upsertAppliedPayment(input.paymentId, domainOrder.id, session);
      await updateOrderStatus(
        domainOrder.id,
        {
          status: "paid",
          razorpayPaymentId: input.paymentId,
        },
        session,
      );
    });
    return { ok: true, status: "paid" };
  } catch {
    await upsertAppliedPayment(input.paymentId, domainOrder.id);
    await updateOrderStatus(domainOrder.id, {
      status: "paid_out_of_stock",
      razorpayPaymentId: input.paymentId,
    });
    return { ok: true, status: "paid_out_of_stock" };
  }
}
