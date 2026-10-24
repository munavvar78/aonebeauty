import Link from "next/link";
import { isPurchasable, stockLabel, stockLabelText } from "@/domain/inventory";
import type { Product } from "@/data/products";
import { ProductMedia } from "./ProductMedia";
import { ProductPrice } from "./ProductPrice";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const label = stockLabel(product.quantity, product.lowStockThreshold);
  const soldOut = label === "sold_out";
  const canBuy = isPurchasable(product.quantity);

  return (
    <article className="group overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_20px_50px_-30px_rgba(14,12,18,0.45)] transition duration-300 hover:-translate-y-1 hover:border-rose/40 hover:shadow-[0_24px_50px_-24px_rgba(255,61,110,0.35)]">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative overflow-hidden">
          <div className="transition duration-500 ease-out group-hover:scale-[1.03]">
            <ProductMedia
              name={product.name}
              accentFrom={product.accentFrom}
              accentTo={product.accentTo}
              imageUrl={product.imageUrl}
              className="rounded-none"
            />
          </div>
          {soldOut && (
            <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-paper">
              Sold out
            </span>
          )}
        </div>
      </Link>
      <div className="space-y-3 p-5">
        <Link href={`/shop/${product.slug}`} className="block space-y-2">
          <p className="label-nav !text-rose">{product.category}</p>
          <h3 className="font-display text-2xl italic leading-tight text-ink transition-colors group-hover:text-rose">
            {product.name}
          </h3>
          <div className="flex items-baseline justify-between gap-3">
            <ProductPrice
              pricePaise={product.pricePaise}
              compareAtPricePaise={product.compareAtPricePaise}
            />
            <p
              className={`text-xs font-medium ${
                label === "low_stock"
                  ? "text-flame"
                  : label === "sold_out"
                    ? "text-ink/40"
                    : "text-jade"
              }`}
            >
              {stockLabelText(product.quantity, product.lowStockThreshold)}
            </p>
          </div>
        </Link>
        <AddToCartButton
          compact
          disabled={!canBuy}
          product={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            unitPricePaise: product.pricePaise,
            availableQuantity: product.quantity,
          }}
        />
      </div>
    </article>
  );
}
