"use client";

import Link from "next/link";
import { formatInr } from "@/domain/money";
import { useCart } from "@/components/cart/CartProvider";

export default function CartPage() {
  const { cart, totalPaise, updateQuantity, removeItem, itemCount } = useCart();

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <p className="label-nav text-gold">Bag</p>
        <h1 className="font-display text-5xl italic">Your bag is empty</h1>
        <p className="text-paper/60">Add something soft from the shop.</p>
        <Link href="/shop" className="btn-ink inline-flex">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="label-nav text-gold">Bag</p>
          <h1 className="font-display text-5xl italic">Your bag</h1>
          <p className="text-sm text-paper/55">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/shop" className="label-nav text-paper/60 hover:text-gold">
          Keep shopping
        </Link>
      </div>

      <ul className="space-y-3">
        {cart.lines.map((line) => (
          <li
            key={line.productId}
            className="surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <Link
                href={`/shop/${line.slug}`}
                className="font-display text-2xl italic hover:text-rose"
              >
                {line.name}
              </Link>
              <p className="mt-1 text-sm text-paper/55">
                {formatInr(line.unitPricePaise)} each
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center overflow-hidden rounded-full border border-white/15 bg-white/5">
                <button
                  type="button"
                  aria-label={`Decrease ${line.name}`}
                  className="px-3 py-2 text-paper"
                  onClick={() =>
                    updateQuantity(
                      line.productId,
                      Math.max(0, line.quantity - 1),
                      line.availableQuantity,
                    )
                  }
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm tabular-nums">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase ${line.name}`}
                  className="px-3 py-2 text-paper disabled:opacity-30"
                  disabled={line.quantity >= line.availableQuantity}
                  onClick={() =>
                    updateQuantity(
                      line.productId,
                      line.quantity + 1,
                      line.availableQuantity,
                    )
                  }
                >
                  +
                </button>
              </div>
              <p className="min-w-20 text-right font-medium">
                {formatInr(line.unitPricePaise * line.quantity)}
              </p>
              <button
                type="button"
                onClick={() => removeItem(line.productId)}
                className="text-sm text-rose hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xl text-paper/80">
          Total{" "}
          <span className="font-display text-3xl italic text-gold">
            {formatInr(totalPaise)}
          </span>
        </p>
        <Link href="/checkout" className="btn-ink inline-flex justify-center">
          Checkout
        </Link>
      </div>
    </div>
  );
}
