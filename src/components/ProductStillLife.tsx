type ProductStillLifeProps = {
  name: string;
  accentFrom: string;
  accentTo: string;
  className?: string;
};

export function ProductStillLife({
  name,
  accentFrom,
  accentTo,
  className = "",
}: ProductStillLifeProps) {
  return (
    <div
      className={`relative aspect-[4/5] overflow-hidden rounded-2xl ${className}`}
      style={{
        background: `linear-gradient(155deg, ${accentFrom} 0%, ${accentTo} 100%)`,
      }}
      role="img"
      aria-label={name}
    >
      <svg
        viewBox="0 0 240 300"
        className="absolute inset-0 h-full w-full opacity-90"
        aria-hidden
      >
        <ellipse cx="120" cy="250" rx="70" ry="14" fill="rgba(42,33,28,0.12)" />
        <rect
          x="88"
          y="90"
          width="64"
          height="130"
          rx="18"
          fill="rgba(251,247,242,0.55)"
          stroke="rgba(42,33,28,0.18)"
        />
        <rect
          x="102"
          y="70"
          width="36"
          height="28"
          rx="6"
          fill="rgba(42,33,28,0.22)"
        />
        <circle cx="120" cy="150" r="18" fill="rgba(251,247,242,0.35)" />
        <path
          d="M40 60 C70 20, 100 40, 120 30"
          fill="none"
          stroke="rgba(251,247,242,0.45)"
          strokeWidth="2"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/45 to-transparent p-4 pt-16">
        <p className="font-display text-sm text-paper">{name}</p>
      </div>
    </div>
  );
}
