import Link from "next/link";
import type { Coupon } from "@/domain/coupons";
import { formatInr } from "@/domain/money";

function discountLabel(coupon: Coupon): string {
  if (coupon.discountType === "percent" && coupon.percentOff != null) {
    return `${coupon.percentOff}% off`;
  }
  if (coupon.amountPaise != null) {
    return `${formatInr(coupon.amountPaise)} off`;
  }
  return "Special offer";
}

export function OffersStrip({ coupons }: { coupons: Coupon[] }) {
  if (coupons.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label-nav !text-rose">Hot offers</p>
          <h2 className="mt-2 font-display text-4xl italic text-ink sm:text-5xl">
            Codes that sparkle
          </h2>
        </div>
        <Link
          href="/offers"
          className="label-nav !text-ink hover:!text-rose"
        >
          All offers
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {coupons.slice(0, 3).map((coupon) => (
          <article
            key={coupon.code}
            className="group relative overflow-hidden rounded-2xl border border-ink/10 bg-white p-6 shadow-[0_20px_50px_-28px_rgba(255,61,110,0.35)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_28px_60px_-24px_rgba(255,61,110,0.5)]"
          >
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br from-rose/30 to-gold/40 blur-2xl transition duration-500 group-hover:scale-150" />
            <p className="label-nav relative !text-rose">{coupon.occasionLabel}</p>
            <p className="relative mt-3 font-display text-3xl italic text-ink">
              {discountLabel(coupon)}
            </p>
            <p className="relative mt-2 text-sm leading-relaxed text-ink/60">
              {coupon.description}
            </p>
            <p className="relative mt-5 inline-block rounded-full bg-ink px-4 py-2 font-mono text-sm tracking-wide text-gold transition group-hover:bg-rose group-hover:text-white">
              {coupon.code}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
