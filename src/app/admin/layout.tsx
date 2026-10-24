import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="label-nav">Private</p>
          <h1 className="font-display text-3xl">Admin</h1>
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link href="/admin" className="label-nav hover:text-blush">
            Dashboard
          </Link>
          <Link href="/admin/products" className="label-nav hover:text-blush">
            Products
          </Link>
          <Link href="/admin/orders" className="label-nav hover:text-blush">
            Orders
          </Link>
          <Link href="/admin/coupons" className="label-nav hover:text-blush">
            Coupons
          </Link>
          <Link href="/" className="label-nav hover:text-blush">
            Storefront
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
