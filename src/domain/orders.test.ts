import { describe, expect, it } from "vitest";
import {
  applyVerifiedPayment,
  orderTotalFromItems,
  type Order,
} from "./orders";

const pendingOrder: Order = {
  id: "ord_1",
  status: "pending",
  totalPaise: 20000,
  items: [
    {
      productId: "p1",
      name: "Rose Dew Serum",
      unitPricePaise: 10000,
      quantity: 2,
    },
  ],
};

describe("orders", () => {
  it("computes order total in paise", () => {
    expect(orderTotalFromItems(pendingOrder.items)).toBe(20000);
  });

  it("marks paid only with a valid signature and successful stock decrement", () => {
    const result = applyVerifiedPayment({
      order: pendingOrder,
      paymentId: "pay_1",
      signatureValid: true,
      stockDecrementSucceeded: true,
      appliedPaymentIds: new Set(),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.status).toBe("paid");
    expect(result.shouldDecrementStock).toBe(true);
  });

  it("does not double-decrement for a repeat payment id", () => {
    const result = applyVerifiedPayment({
      order: { ...pendingOrder, status: "paid", razorpayPaymentId: "pay_1" },
      paymentId: "pay_1",
      signatureValid: true,
      stockDecrementSucceeded: true,
      appliedPaymentIds: new Set(["pay_1"]),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.alreadyApplied).toBe(true);
    expect(result.shouldDecrementStock).toBe(false);
  });

  it("sets paid_out_of_stock when stock decrement fails", () => {
    const result = applyVerifiedPayment({
      order: pendingOrder,
      paymentId: "pay_2",
      signatureValid: true,
      stockDecrementSucceeded: false,
      appliedPaymentIds: new Set(),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.status).toBe("paid_out_of_stock");
    expect(result.shouldDecrementStock).toBe(false);
  });

  it("marks failed when signature is invalid", () => {
    const result = applyVerifiedPayment({
      order: pendingOrder,
      paymentId: "pay_3",
      signatureValid: false,
      stockDecrementSucceeded: true,
      appliedPaymentIds: new Set(),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.status).toBe("failed");
  });
});
