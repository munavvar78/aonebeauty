import { SITE, mailtoOwner, whatsappUrl } from "@/data/site";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl space-y-8 px-6 py-10">
      <div className="space-y-3">
        <p className="label-nav">Contact</p>
        <h1 className="text-4xl sm:text-5xl">Say hello</h1>
        <p className="text-espresso-muted">
          Orders, restocks, and press — {SITE.owner.name} reads every note.
        </p>
      </div>
      <div className="surface-card space-y-6 p-8">
        <div>
          <p className="label-nav">Owner</p>
          <p className="mt-2 font-display text-2xl">{SITE.owner.name}</p>
        </div>
        <div>
          <p className="label-nav">Email</p>
          <a href={mailtoOwner()} className="mt-2 block text-lg hover:text-blush">
            {SITE.owner.email}
          </a>
        </div>
        <div>
          <p className="label-nav">WhatsApp</p>
          <a
            href={whatsappUrl(`Hi ${SITE.owner.name}, I'd like help with an order.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-lg hover:text-blush"
          >
            {SITE.owner.phoneDisplay}
          </a>
        </div>
        <div>
          <p className="label-nav">Hours</p>
          <p className="mt-2 text-espresso-muted">Mon–Sat, 10:00–18:00 IST</p>
        </div>
      </div>
    </div>
  );
}
