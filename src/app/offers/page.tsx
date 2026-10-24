import { listActiveCoupons } from "@/lib/coupons";
import { formatInr } from "@/domain/money";
import { CopyCodeButton } from "@/components/CopyCodeButton";
import { Reveal } from "@/components/Reveal";

export const metadata = {
  title: "Offers",
};

export default async function OffersPage() {
  const coupons = await listActiveCoupons();

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <Reveal>
        <div className="max-w-xl space-y-3">
          <p className="label-nav text-rose">Offers</p>
          <h1 className="font-display text-5xl sm:text-6xl">Seasonal codes</h1>
          <p className="text-ink-soft">
            Copy a code and enter it at checkout to enjoy the discount.
          </p>
        </div>
      </Reveal>

      {coupons.length === 0 ? (
        <p className="text-ink-soft">No offers right now — check back soon.</p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {coupons.map((coupon, i) => (
            <Reveal key={coupon.code} delayMs={i * 100}>
              <li className="surface-card relative overflow-hidden space-y-4 p-7">
                <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-rose/15 to-jade/20 blur-2xl" />
                <p className="label-nav relative text-jade">{coupon.occasionLabel}</p>
                <h2 className="relative font-display text-4xl">
                  {coupon.discountType === "percent"
                    ? `${coupon.percentOff}% off`
                    : `${formatInr(coupon.amountPaise ?? 0)} off`}
                </h2>
                <p className="relative text-ink-soft">{coupon.description}</p>
                <div className="relative flex flex-wrap items-center gap-3">
                  <code className="rounded-lg bg-ink px-3 py-2 font-mono text-sm text-paper">
                    {coupon.code}
                  </code>
                  <CopyCodeButton code={coupon.code} />
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
