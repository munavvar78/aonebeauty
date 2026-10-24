export const SITE = {
  brand: "Aone Beauty",
  tagline: "Quiet formulas for soft rituals",
  owner: {
    name: "Soyab Popatiya",
    phoneDisplay: "9574340581",
    whatsappE164: "919574340581",
    email: "soyabpopatiya1832@gmail.com",
    blurb:
      "Soyab Popatiya tends Aone Beauty as a small skin-care house — honest stock, warm packaging, and care you can message anytime.",
  },
} as const;

export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${SITE.owner.whatsappE164}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function mailtoOwner(): string {
  return `mailto:${SITE.owner.email}`;
}
