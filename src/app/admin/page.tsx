import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { requireAdmin } from "@/lib/auth/admin";
import { stockLabel } from "@/domain/inventory";
import { isMongoConfigured } from "@/lib/mongo";
import { listAllProductsAdmin } from "@/lib/repositories/products";
import Link from "next/link";

export default async function AdminHomePage() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2">
          <p className="label-nav">Sign in</p>
          <h2 className="text-2xl">Admin access</h2>
          <p className="text-sm text-espresso-muted">
            Sign in as the email set in ADMIN_EMAIL. Seed an admin with{" "}
            <code>npm run db:seed</code> first.
          </p>
        </div>
        {!isMongoConfigured() && (
          <p className="rounded-xl border border-blush/40 bg-blush-soft/40 p-4 text-sm text-espresso">
            Set <code>MONGODB_URI</code> and <code>AUTH_SECRET</code> in{" "}
            <code>.env.local</code>, then restart the app.
          </p>
        )}
        <AdminLoginForm />
        {auth.error !== "Not signed in" && (
          <p className="text-sm text-blush" role="alert">
            {auth.error}
          </p>
        )}
      </div>
    );
  }

  const products = isMongoConfigured() ? await listAllProductsAdmin() : [];
  const low = products.filter(
    (p) =>
      p.isActive && stockLabel(p.quantity, p.lowStockThreshold) !== "in_stock",
  );

  return (
    <div className="space-y-8">
      <p className="text-espresso-muted">Signed in as {auth.user.email}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-5">
          <p className="label-nav">Products</p>
          <p className="mt-2 font-display text-3xl">{products.length}</p>
        </div>
        <div className="surface-card p-5">
          <p className="label-nav">Low / sold out</p>
          <p className="mt-2 font-display text-3xl">{low.length}</p>
        </div>
        <div className="surface-card p-5">
          <p className="label-nav">Quick links</p>
          <div className="mt-3 space-y-2 text-sm">
            <Link href="/admin/products" className="block hover:text-blush">
              Manage products
            </Link>
            <Link href="/admin/orders" className="block hover:text-blush">
              View orders
            </Link>
          </div>
        </div>
      </div>
      {low.length > 0 && (
        <div className="surface-card p-5">
          <h2 className="font-display text-xl">Needs attention</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {low.map((product) => (
              <li
                key={product._id.toHexString()}
                className="flex justify-between gap-4"
              >
                <span>{product.name}</span>
                <span className="text-blush">{product.quantity} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
