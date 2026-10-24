import type { Paise } from "./money";

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "paid_out_of_stock";

export type OrderItem = {
  productId: string;
  name: string;
  unitPricePaise: Paise;
  quantity: number;
};

export type Order = {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  totalPaise: Paise;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
};

export type ApplyPaymentInput = {
  order: Order;
  paymentId: string;
  signatureValid: boolean;
  /** True when conditional stock decrement succeeded for every line. */
  stockDecrementSucceeded: boolean;
  /** Payment ids already applied (idempotency). */
  appliedPaymentIds: Set<string>;
};

export type ApplyPaymentResult =
  | {
      ok: true;
      order: Order;
      shouldDecrementStock: boolean;
      alreadyApplied: boolean;
    }
  | { ok: false; error: string };

export function applyVerifiedPayment(
  input: ApplyPaymentInput,
): ApplyPaymentResult {
  const { order, paymentId, signatureValid, stockDecrementSucceeded, appliedPaymentIds } =
    input;

  if (!signatureValid) {
    return {
      ok: true,
      order: { ...order, status: "failed" },
      shouldDecrementStock: false,
      alreadyApplied: false,
    };
  }

  if (appliedPaymentIds.has(paymentId)) {
    return {
      ok: true,
      order,
      shouldDecrementStock: false,
      alreadyApplied: true,
    };
  }

  if (order.status === "paid" || order.status === "paid_out_of_stock") {
    return {
      ok: true,
      order,
      shouldDecrementStock: false,
      alreadyApplied: true,
    };
  }

  if (order.status !== "pending" && order.status !== "failed") {
    return { ok: false, error: `cannot apply payment to status ${order.status}` };
  }

  if (!stockDecrementSucceeded) {
    return {
      ok: true,
      order: {
        ...order,
        status: "paid_out_of_stock",
        razorpayPaymentId: paymentId,
      },
      shouldDecrementStock: false,
      alreadyApplied: false,
    };
  }

  return {
    ok: true,
    order: {
      ...order,
      status: "paid",
      razorpayPaymentId: paymentId,
    },
    shouldDecrementStock: true,
    alreadyApplied: false,
  };
}

export function orderTotalFromItems(items: OrderItem[]): Paise {
  return items.reduce(
    (sum, item) => sum + item.unitPricePaise * item.quantity,
    0,
  );
}
