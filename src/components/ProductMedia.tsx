import Image from "next/image";
import { ProductStillLife } from "./ProductStillLife";

type ProductMediaProps = {
  name: string;
  accentFrom: string;
  accentTo: string;
  imageUrl?: string | null;
  className?: string;
  priority?: boolean;
};

export function ProductMedia({
  name,
  accentFrom,
  accentTo,
  imageUrl,
  className = "",
  priority = false,
}: ProductMediaProps) {
  if (imageUrl) {
    return (
      <div
        className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-ivory-deep ${className}`}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
          priority={priority}
        />
      </div>
    );
  }

  return (
    <ProductStillLife
      name={name}
      accentFrom={accentFrom}
      accentTo={accentTo}
      className={className}
    />
  );
}
