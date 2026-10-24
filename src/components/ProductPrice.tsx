import { formatInr } from "@/domain/money";

type ProductPriceProps = {
  pricePaise: number;
  compareAtPricePaise?: number | null;
  className?: string;
  size?: "sm" | "lg";
  /** Use on dark surfaces (product detail) */
  tone?: "light" | "dark";
};

export function ProductPrice({
  pricePaise,
  compareAtPricePaise,
  className = "",
  size = "sm",
  tone = "light",
}: ProductPriceProps) {
  const showMrp =
    typeof compareAtPricePaise === "number" &&
    compareAtPricePaise > pricePaise;

  const priceClass =
    size === "lg" ? "text-2xl font-medium sm:text-3xl" : "font-medium";
  const mrpClass = size === "lg" ? "text-base" : "text-sm";
  const priceColor = tone === "dark" ? "text-paper" : "text-ink";
  const mrpColor = tone === "dark" ? "text-paper/40" : "text-ink/40";

  return (
    <p className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className={`${priceClass} ${priceColor}`}>
        {formatInr(pricePaise)}
      </span>
      {showMrp && (
        <>
          <span className={`${mrpClass} ${mrpColor} line-through`}>
            {formatInr(compareAtPricePaise)}
          </span>
          <span className="rounded-full bg-rose/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-rose">
            Sale
          </span>
        </>
      )}
    </p>
  );
}
