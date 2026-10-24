import { describe, expect, it } from "vitest";
import {
  addToCart,
  cartTotalPaise,
  emptyCart,
  setCartLineQuantity,
} from "./cart";

const product = {
  productId: "p1",
  slug: "rose-dew-serum",
  name: "Rose Dew Serum",
  unitPricePaise: 10000,
  availableQuantity: 3,
};

describe("cart", () => {
  it("adds a line and totals in paise", () => {
    const result = addToCart(emptyCart(), product, 2);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.cart.lines[0].quantity).toBe(2);
    expect(cartTotalPaise(result.cart)).toBe(20000);
  });

  it("caps quantity to available stock", () => {
    const first = addToCart(emptyCart(), product, 2);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = addToCart(first.cart, product, 5);
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.cart.lines[0].quantity).toBe(3);
  });

  it("refuses quantity above stock when setting", () => {
    const added = addToCart(emptyCart(), product, 1);
    expect(added.ok).toBe(true);
    if (!added.ok) return;
    const result = setCartLineQuantity(added.cart, "p1", 9, 3);
    expect(result.ok).toBe(false);
  });

  it("refuses sold-out products", () => {
    const result = addToCart(emptyCart(), { ...product, availableQuantity: 0 }, 1);
    expect(result.ok).toBe(false);
  });
});
