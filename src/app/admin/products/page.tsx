import Link from "next/link";
import { redirect } from "next/navigation";
import { formatInr } from "@/domain/money";
import { stockCountText } from "@/domain/inventory";
import { requireAdmin } from "@/lib/auth/admin";
import { isMongoConfigured } from "@/lib/mongo";
import { listAllProductsAdmin } from "@/lib/repositories/products";
import { StockAdjustForm } from "@/components/admin/StockAdjustForm";

export default async function AdminProductsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/admin");

  if (!isMongoConfigured()) {
    return (
      <p className="text-blush">Configure MONGODB_URI to manage products.</p>
    );
  }

  const products = await listAllProductsAdmin();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl">Products</h2>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-espresso px-4 py-2 text-sm text-ivory"
        >
          New product
        </Link>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <article
            key={product._id.toHexString()}
            className="surface-card space-y-4 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="label-nav">{product.category}</p>
                <h3 className="font-display text-xl">{product.name}</h3>
                <p className="text-sm text-espresso-muted">
                  {formatInr(product.pricePaise)} ·{" "}
                  {stockCountText(product.quantity, product.lowStockThreshold)}
                  {!product.isActive ? " · Inactive" : ""}
                </p>
              </div>
              <Link
                href={`/admin/products/${product._id.toHexString()}`}
                className="label-nav hover:text-blush"
              >
                Edit
              </Link>
            </div>
            <StockAdjustForm productId={product._id.toHexString()} />
          </article>
        ))}
      </div>
    </div>
  );
}
