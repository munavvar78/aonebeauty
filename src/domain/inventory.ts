export type StockLabel = "sold_out" | "low_stock" | "in_stock";

export type StockAdjustmentReason =
  | "restock"
  | "adjustment"
  | "sale"
  | "sale_reversal";

export type StockAdjustment =
  | { kind: "add"; amount: number }
  | { kind: "remove"; amount: number }
  | { kind: "set"; amount: number }
  | { kind: "sale"; amount: number };

export type StockAdjustmentResult =
  | { ok: true; quantity: number; delta: number; reason: StockAdjustmentReason }
  | { ok: false; error: string };

export function stockLabel(
  quantity: number,
  lowStockThreshold = 5,
): StockLabel {
  if (quantity <= 0) return "sold_out";
  if (quantity <= lowStockThreshold) return "low_stock";
  return "in_stock";
}

/** Customer-facing status — no raw inventory counts. */
export function stockLabelText(
  quantity: number,
  lowStockThreshold = 5,
): string {
  const label = stockLabel(quantity, lowStockThreshold);
  if (label === "sold_out") return "Sold out";
  if (label === "low_stock") return "Almost gone";
  return "In stock";
}

/** Admin-facing count for inventory management. */
export function stockCountText(
  quantity: number,
  lowStockThreshold = 5,
): string {
  const label = stockLabel(quantity, lowStockThreshold);
  if (label === "sold_out") return "0 · Sold out";
  if (label === "low_stock") return `${quantity} left · Low stock`;
  return `${quantity} on hand`;
}

export function isPurchasable(quantity: number): boolean {
  return quantity > 0;
}

export function applyStockAdjustment(
  currentQuantity: number,
  adjustment: StockAdjustment,
): StockAdjustmentResult {
  if (!Number.isInteger(currentQuantity) || currentQuantity < 0) {
    return { ok: false, error: "current quantity must be a non-negative integer" };
  }

  if (adjustment.kind === "add") {
    if (!Number.isInteger(adjustment.amount) || adjustment.amount <= 0) {
      return { ok: false, error: "add amount must be a positive integer" };
    }
    return {
      ok: true,
      quantity: currentQuantity + adjustment.amount,
      delta: adjustment.amount,
      reason: "restock",
    };
  }

  if (adjustment.kind === "remove") {
    if (!Number.isInteger(adjustment.amount) || adjustment.amount <= 0) {
      return { ok: false, error: "remove amount must be a positive integer" };
    }
    if (adjustment.amount > currentQuantity) {
      return { ok: false, error: "cannot reduce stock below zero" };
    }
    return {
      ok: true,
      quantity: currentQuantity - adjustment.amount,
      delta: -adjustment.amount,
      reason: "adjustment",
    };
  }

  if (adjustment.kind === "set") {
    if (!Number.isInteger(adjustment.amount) || adjustment.amount < 0) {
      return { ok: false, error: "set amount must be a non-negative integer" };
    }
    const delta = adjustment.amount - currentQuantity;
    return {
      ok: true,
      quantity: adjustment.amount,
      delta,
      reason: "adjustment",
    };
  }

  // sale
  if (!Number.isInteger(adjustment.amount) || adjustment.amount <= 0) {
    return { ok: false, error: "sale amount must be a positive integer" };
  }
  if (adjustment.amount > currentQuantity) {
    return { ok: false, error: "insufficient stock for sale" };
  }
  return {
    ok: true,
    quantity: currentQuantity - adjustment.amount,
    delta: -adjustment.amount,
    reason: "sale",
  };
}
