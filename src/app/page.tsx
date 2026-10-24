import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { OffersStrip } from "@/components/OffersStrip";
import { Reveal } from "@/components/Reveal";
import { listFeaturedProducts } from "@/lib/catalog";
import { listActiveCoupons } from "@/lib/coupons";
import { SITE } from "@/data/site";

export default async function HomePage() {
  const [featured, coupons] = await Promise.all([
    listFeaturedProducts(),
    listActiveCoupons(),
  ]);

  return (
    <div>
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
        <div className="relative flex min-h-[94vh] items-center overflow-hidden px-6 pb-24 pt-28 sm:px-10">
          <div className="absolute inset-0 bg-void" />
          <div className="absolute inset-0 opacity-90">
            <div className="spotlight-beam absolute -left-1/4 top-[-20%] h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(255,61,110,0.4)_0%,transparent_65%)]" />
            <div className="spotlight-beam absolute -right-1/4 top-[10%] h-[60vh] w-[55vw] rounded-full bg-[radial-gradient(circle,rgba(242,201,76,0.28)_0%,transparent_65%)]" />
            <div className="hero-orb bottom-[-10%] left-[25%] h-[32vw] max-h-[320px] w-[32vw] max-w-[320px] bg-jade/25" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(7,6,10,0.85)_100%)]" />

          <div className="relative mx-auto w-full max-w-6xl">
            <p
              className="label-nav text-gold animate-fade-up"
              style={{ animationDelay: "60ms" }}
            >
              Live · India · Beauty house
            </p>
            <p
              className="mt-4 font-display text-[clamp(3.6rem,14vw,8.5rem)] italic leading-[0.88] tracking-tight animate-fade-up"
              style={{ animationDelay: "140ms" }}
            >
              <span className="text-shimmer">{SITE.brand}</span>
            </p>
            <h1
              className="mt-8 max-w-2xl font-display text-3xl font-normal italic leading-snug text-paper/90 sm:text-4xl md:text-5xl animate-fade-up"
              style={{ animationDelay: "260ms" }}
            >
              Soft rituals that{" "}
              <span className="text-rose-glow not-italic">glow</span> on skin.
            </h1>
            <p
              className="mt-5 max-w-lg text-base text-paper/60 sm:text-lg animate-fade-up"
              style={{ animationDelay: "360ms" }}
            >
              {SITE.tagline} — by {SITE.owner.name}.
            </p>
            <div
              className="mt-12 flex flex-wrap gap-4 animate-fade-up"
              style={{ animationDelay: "460ms" }}
            >
              <Link href="/shop" className="btn-ink">
                Shop the edit
              </Link>
              <Link href="/offers" className="btn-ghost">
                Grab offers
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden border-y border-rose/30 bg-gradient-to-r from-rose via-flame to-gold">
          <div className="marquee-track flex w-max gap-10 whitespace-nowrap py-3.5 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-void">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex gap-10">
                {[
                  "Rose rituals",
                  "Glow skin",
                  "Secure pay",
                  "WhatsApp care",
                  "Hot offers",
                  "New drops",
                ].map((item) => (
                  <span key={`${copy}-${item}`} className="flex items-center gap-10">
                    {item}
                    <span>✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="light-band relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="mx-auto max-w-6xl space-y-section px-6 py-20">
          <Reveal>
            <OffersStrip coupons={coupons} />
          </Reveal>

          <section className="space-y-10">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="label-nav text-rose">Featured</p>
                  <h2 className="mt-2 font-display text-4xl italic sm:text-6xl">
                    Reach for these first
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="rounded-full bg-ink px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-paper transition hover:bg-rose"
                >
                  View all
                </Link>
              </div>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product, index) => (
                <Reveal key={product.id} delayMs={index * 90}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <section className="relative grid items-center gap-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1a0f18] via-[#2a1020] to-[#0f2a28] p-8 md:grid-cols-2 md:p-14">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose/40 blur-3xl animate-float"
            />
            <div className="relative space-y-5">
              <p className="label-nav text-gold">The house</p>
              <h2 className="font-display text-4xl italic sm:text-5xl">
                Beauty that{" "}
                <span className="text-rose-glow not-italic">stays</span> close
              </h2>
              <p className="text-lg leading-relaxed text-paper/65">
                A short, careful edit of formulas that feel finished — soft
                textures, quiet packaging, and care you can message anytime.
              </p>
              <Link href="/about" className="btn-ghost mt-2 inline-flex">
                Meet {SITE.owner.name.split(" ")[0]} →
              </Link>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-rose via-flame to-gold" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_45%)]" />
              <div className="absolute inset-0 flex items-end p-6">
                <p className="font-display text-3xl italic text-void/90 sm:text-4xl">
                  Hot rose · Gold · Glow
                </p>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
