import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductMedia } from "@/components/ProductMedia";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { isPurchasable, stockLabelText } from "@/domain/inventory";
import { findProductBySlug, listProducts } from "@/lib/catalog";
import { SITE, whatsappUrl } from "@/data/site";
import { ProductPrice } from "@/components/ProductPrice";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await listProducts("all");
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await findProductBySlug(slug);
  if (!product) notFound();

  const purchasable = isPurchasable(product.quantity);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductMedia
          name={product.name}
          accentFrom={product.accentFrom}
          accentTo={product.accentTo}
          imageUrl={product.imageUrl}
          className="surface-card"
          priority
        />
        <div className="space-y-6 lg:pt-4">
          <div className="space-y-3">
            <p className="label-nav">{product.category}</p>
            <h1 className="text-4xl sm:text-5xl">{product.name}</h1>
            <ProductPrice
              pricePaise={product.pricePaise}
              compareAtPricePaise={product.compareAtPricePaise}
              size="lg"
              tone="dark"
            />
            <p
              className={`text-sm ${
                product.quantity <= product.lowStockThreshold &&
                product.quantity > 0
                  ? "text-blush"
                  : "text-gold"
              }`}
            >
              {stockLabelText(product.quantity, product.lowStockThreshold)}
            </p>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-espresso-muted">
            {product.description}
          </p>
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              unitPricePaise: product.pricePaise,
              availableQuantity: product.quantity,
            }}
            disabled={!purchasable}
          />
          <a
            href={whatsappUrl(
              `Hi ${SITE.owner.name}, I'm interested in ${product.name} from ${SITE.brand}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-espresso-muted underline-offset-4 hover:text-blush hover:underline"
          >
            Ask on WhatsApp
          </a>
          <div>
            <Link href="/shop" className="inline-block label-nav hover:text-blush">
              ← Back to shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
