import Link from "next/link";
import { SITE, mailtoOwner, whatsappUrl } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-section relative overflow-hidden border-t border-white/10 bg-void text-paper">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-rose/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 sm:flex-row sm:justify-between">
        <div className="max-w-sm space-y-3">
          <p className="font-display text-4xl italic text-shimmer">{SITE.brand}</p>
          <p className="text-sm leading-relaxed text-paper/60">
            Quiet formulas, warm rituals, and skin that looks like itself — only
            softer.
          </p>
          <p className="pt-2 text-sm text-paper/50">
            Care of <span className="text-gold">{SITE.owner.name}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-12 text-sm text-paper/60">
          <div className="space-y-2">
            <p className="label-nav text-gold">Explore</p>
            <Link href="/shop" className="block hover:text-rose-glow">
              Shop
            </Link>
            <Link href="/offers" className="block hover:text-rose-glow">
              Offers
            </Link>
            <Link href="/about" className="block hover:text-rose-glow">
              About
            </Link>
            <Link href="/contact" className="block hover:text-rose-glow">
              Contact
            </Link>
          </div>
          <div className="space-y-2">
            <p className="label-nav text-gold">Reach us</p>
            <a href={mailtoOwner()} className="block hover:text-jade-soft">
              {SITE.owner.email}
            </a>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:text-jade-soft"
            >
              WhatsApp {SITE.owner.phoneDisplay}
            </a>
            <p>Secure online checkout</p>
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/10 px-6 py-4 text-center text-xs text-paper/40">
        © {new Date().getFullYear()} {SITE.brand}. Crafted by {SITE.owner.name}.
      </div>
    </footer>
  );
}
