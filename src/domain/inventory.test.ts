import { describe, expect, it } from "vitest";
import {
  applyStockAdjustment,
  isPurchasable,
  stockCountText,
  stockLabel,
  stockLabelText,
} from "./inventory";

describe("inventory labels", () => {
  it("marks sold out at zero", () => {
    expect(stockLabel(0)).toBe("sold_out");
    expect(stockLabelText(0)).toBe("Sold out");
    expect(isPurchasable(0)).toBe(false);
  });

  it("marks low stock at or below threshold", () => {
    expect(stockLabel(4, 5)).toBe("low_stock");
    expect(stockLabelText(4, 5)).toBe("Almost gone");
    expect(stockCountText(4, 5)).toBe("4 left · Low stock");
  });

  it("marks in stock above threshold", () => {
    expect(stockLabel(12, 5)).toBe("in_stock");
    expect(stockLabelText(12, 5)).toBe("In stock");
    expect(stockCountText(12, 5)).toBe("12 on hand");
  });
});

describe("applyStockAdjustment", () => {
  it("adds stock", () => {
    const result = applyStockAdjustment(10, { kind: "add", amount: 5 });
    expect(result).toEqual({
      ok: true,
      quantity: 15,
      delta: 5,
      reason: "restock",
    });
  });

  it("removes stock", () => {
    const result = applyStockAdjustment(10, { kind: "remove", amount: 3 });
    expect(result).toEqual({
      ok: true,
      quantity: 7,
      delta: -3,
      reason: "adjustment",
    });
  });

  it("rejects removal that would go negative", () => {
    const result = applyStockAdjustment(2, { kind: "remove", amount: 5 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/below zero/);
  });

  it("sets absolute quantity", () => {
    const result = applyStockAdjustment(10, { kind: "set", amount: 4 });
    expect(result).toEqual({
      ok: true,
      quantity: 4,
      delta: -6,
      reason: "adjustment",
    });
  });

  it("decrements on sale when stock is enough", () => {
    const result = applyStockAdjustment(5, { kind: "sale", amount: 2 });
    expect(result).toEqual({
      ok: true,
      quantity: 3,
      delta: -2,
      reason: "sale",
    });
  });

  it("rejects sale when stock is insufficient", () => {
    const result = applyStockAdjustment(1, { kind: "sale", amount: 2 });
    expect(result.ok).toBe(false);
  });
});
