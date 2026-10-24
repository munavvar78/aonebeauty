import { lineTotalPaise, sumPaise, type Paise } from "./money";
import { isPurchasable } from "./inventory";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  unitPricePaise: Paise;
  quantity: number;
  availableQuantity: number;
};

export type Cart = {
  lines: CartLine[];
};

export type CartMutationResult =
  | { ok: true; cart: Cart }
  | { ok: false; error: string };

export function emptyCart(): Cart {
  return { lines: [] };
}

export function addToCart(
  cart: Cart,
  product: {
    productId: string;
    slug: string;
    name: string;
    unitPricePaise: Paise;
    availableQuantity: number;
  },
  quantity = 1,
): CartMutationResult {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, error: "quantity must be a positive integer" };
  }
  if (!isPurchasable(product.availableQuantity)) {
    return { ok: false, error: "product is sold out" };
  }

  const existing = cart.lines.find((line) => line.productId === product.productId);
  const nextQty = (existing?.quantity ?? 0) + quantity;
  const capped = Math.min(nextQty, product.availableQuantity);

  if (capped < nextQty && capped === (existing?.quantity ?? 0)) {
    return { ok: false, error: "cannot add more than available stock" };
  }

  const line: CartLine = {
    productId: product.productId,
    slug: product.slug,
    name: product.name,
    unitPricePaise: product.unitPricePaise,
    quantity: capped,
    availableQuantity: product.availableQuantity,
  };

  const lines = existing
    ? cart.lines.map((l) => (l.productId === product.productId ? line : l))
    : [...cart.lines, line];

  return { ok: true, cart: { lines } };
}

export function setCartLineQuantity(
  cart: Cart,
  productId: string,
  quantity: number,
  availableQuantity: number,
): CartMutationResult {
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { ok: false, error: "quantity must be a non-negative integer" };
  }
  if (quantity === 0) {
    return {
      ok: true,
      cart: { lines: cart.lines.filter((l) => l.productId !== productId) },
    };
  }
  if (quantity > availableQuantity) {
    return { ok: false, error: "quantity exceeds available stock" };
  }

  const lines = cart.lines.map((line) =>
    line.productId === productId
      ? { ...line, quantity, availableQuantity }
      : line,
  );
  return { ok: true, cart: { lines } };
}

export function cartTotalPaise(cart: Cart): Paise {
  return sumPaise(
    cart.lines.map((line) =>
      lineTotalPaise(line.unitPricePaise, line.quantity),
    ),
  );
}

export function revalidateCartAgainstStock(
  cart: Cart,
  stockByProductId: Record<string, number>,
): Cart {
  const lines: CartLine[] = [];
  for (const line of cart.lines) {
    const available = stockByProductId[line.productId] ?? 0;
    if (available <= 0) continue;
    lines.push({
      ...line,
      availableQuantity: available,
      quantity: Math.min(line.quantity, available),
    });
  }
  return { lines };
}
