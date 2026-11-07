import { redirect } from "next/navigation";
import { formatInr } from "@/domain/money";
import { requireAdmin } from "@/lib/auth/admin";
import { isMongoConfigured } from "@/lib/mongo";
import { listOrdersAdmin } from "@/lib/repositories/orders";

export default async function AdminOrdersPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/admin");

  if (!isMongoConfigured()) {
    return <p className="text-blush">Configure MONGODB_URI to view orders.</p>;
  }

  const orders = await listOrdersAdmin();

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Orders</h2>
      {orders.length === 0 ? (
        <p className="text-espresso-muted">No orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order._id.toHexString()}
              className="surface-card space-y-3 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-xl">{order.guestName}</p>
                  <p className="text-sm text-espresso-muted">
                    {order.guestPhone}
                    {order.guestEmail ? ` · ${order.guestEmail}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-ivory-deep px-3 py-1 text-xs uppercase tracking-[0.16em]">
                  {order.status}
                </span>
              </div>
              <p className="text-sm">
                {order.address}, {order.city}, {order.state} {order.pincode}
              </p>
              <p className="text-sm text-espresso-muted">
                Total {formatInr(order.totalPaise)}
                {order.discountPaise
                  ? ` · discount ${formatInr(order.discountPaise)}`
                  : ""}
                {order.couponCode ? ` · ${order.couponCode}` : ""}
                {order.razorpayPaymentId ? ` · ${order.razorpayPaymentId}` : ""}
              </p>
              <ul className="text-sm text-espresso-muted">
                {order.items.map((item, index) => (
                  <li key={`${item.productId}-${index}`}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
