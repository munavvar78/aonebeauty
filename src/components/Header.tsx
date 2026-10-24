import Link from "next/link";
import { BagLink } from "@/components/BagLink";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/offers", label: "Offers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className="group font-display text-2xl italic tracking-tight text-paper sm:text-[1.85rem]"
        >
          <span className="bg-gradient-to-r from-paper via-gold to-rose-glow bg-clip-text text-transparent">
            Aone Beauty
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center gap-5 sm:gap-7"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="label-nav relative text-paper/70 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-rose after:to-gold after:transition-transform after:duration-300 hover:text-gold hover:after:scale-x-100"
            >
              {link.label}
            </Link>
          ))}
          <BagLink />
        </nav>
      </div>
    </header>
  );
}
