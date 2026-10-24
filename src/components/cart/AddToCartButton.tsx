"use client";

import { useCallback, useState } from "react";
import { useCart } from "./CartProvider";
import { CartToast } from "./CartToast";

type AddToCartButtonProps = {
  product: {
    productId: string;
    slug: string;
    name: string;
    unitPricePaise: number;
    availableQuantity: number;
  };
  disabled?: boolean;
  compact?: boolean;
};

export function AddToCartButton({
  product,
  disabled,
  compact = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const max = Math.max(1, product.availableQuantity);
  const closeToast = useCallback(() => setToast(null), []);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || busy) return;
    setBusy(true);
    const error = addItem(product, compact ? 1 : qty);
    setToast(error ?? `Added ${compact ? 1 : qty} × ${product.name}`);
    setBusy(false);
  }

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || busy}
          className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper transition hover:bg-rose disabled:cursor-not-allowed disabled:opacity-40"
        >
          {disabled ? "Sold out" : busy ? "…" : "Add"}
        </button>
        <CartToast open={Boolean(toast)} message={toast ?? ""} onClose={closeToast} />
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center overflow-hidden rounded-full border border-white/15 bg-white/5">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={disabled || qty <= 1}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-paper disabled:opacity-30"
          >
            −
          </button>
          <span className="min-w-8 text-center text-sm tabular-nums text-paper">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={disabled || qty >= max}
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            className="px-3 py-2 text-paper disabled:opacity-30"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || busy}
          className="btn-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Sold out" : busy ? "Adding…" : "Add to bag"}
        </button>
      </div>
      <CartToast open={Boolean(toast)} message={toast ?? ""} onClose={closeToast} />
    </div>
  );
}
