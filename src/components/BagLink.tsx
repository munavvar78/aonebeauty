"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export function BagLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="label-nav relative text-paper/70 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-rose after:to-gold after:transition-transform after:duration-300 hover:text-gold hover:after:scale-x-100"
    >
      Bag
      {itemCount > 0 && (
        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-[0.65rem] font-semibold tracking-normal text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
