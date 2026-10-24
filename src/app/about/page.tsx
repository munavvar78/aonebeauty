import { SITE, mailtoOwner, whatsappUrl } from "@/data/site";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10 px-6 py-10">
      <div className="space-y-3">
        <p className="label-nav">About</p>
        <h1 className="text-4xl sm:text-5xl">A small house for soft rituals</h1>
      </div>
      <div className="space-y-5 text-lg leading-relaxed text-espresso-muted">
        <p>
          {SITE.brand} began as a vanity edit — a handful of formulas that felt
          finished enough to share. We keep the range intentionally short so every
          bottle earns its place.
        </p>
        <p>
          Packaging is quiet. Photography is warm. What you see available on the
          shop is ready to ship.
        </p>
      </div>
      <div className="surface-card space-y-4 p-8">
        <p className="label-nav text-gold">The owner</p>
        <h2 className="font-display text-3xl">{SITE.owner.name}</h2>
        <p className="leading-relaxed text-espresso-muted">{SITE.owner.blurb}</p>
        <div className="flex flex-wrap gap-4 pt-2 text-sm">
          <a href={mailtoOwner()} className="hover:text-blush">
            {SITE.owner.email}
          </a>
          <a
            href={whatsappUrl(`Hi ${SITE.owner.name}, I found ${SITE.brand} online.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blush"
          >
            WhatsApp {SITE.owner.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}
