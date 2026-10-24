import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, type ProductCategory } from "@/data/products";
import { listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ShopPageProps = {
  searchParams: Promise<{ category?: string }>;
};

function parseCategory(value: string | undefined): ProductCategory | "all" {
  const allowed = CATEGORIES.map((c) => c.id);
  if (value && allowed.includes(value as ProductCategory | "all")) {
    return value as ProductCategory | "all";
  }
  return "all";
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const category = parseCategory(params.category);
  const products = await listProducts(category);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <div className="space-y-3">
        <p className="label-nav text-gold">Shop</p>
        <h1 className="font-display text-5xl italic sm:text-6xl">Skin care</h1>
        <p className="max-w-xl text-paper/60">
          Two soft essentials — face wash and cream, priced for everyday.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((item) => {
          const href =
            item.id === "all" ? "/shop" : `/shop?category=${item.id}`;
          const active = category === item.id;
          return (
            <Link
              key={item.id}
              href={href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-rose text-white shadow-[0_10px_30px_-10px_rgba(255,61,110,0.7)]"
                  : "border border-white/15 bg-white/5 text-paper/70 hover:border-gold/50 hover:text-gold"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {products.length === 0 ? (
        <p className="text-paper/50">No products in this category yet.</p>
      ) : (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
