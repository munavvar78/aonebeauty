import { redirect } from "next/navigation";
import { formatInr } from "@/domain/money";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceRoleClient } from "@/lib/supabase/server";

export default async function AdminOrdersPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/admin");

  const db = createServiceRoleClient();
  if (!db) {
    return (
      <p className="text-blush">
        Configure SUPABASE_SERVICE_ROLE_KEY to view orders.
      </p>
    );
  }

  const { data: orders } = await db
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Orders</h2>
      {(orders ?? []).length === 0 ? (
        <p className="text-espresso-muted">No orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders!.map((order) => (
            <li key={order.id} className="surface-card space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-xl">{order.guest_name}</p>
                  <p className="text-sm text-espresso-muted">
                    {order.guest_phone}
                    {order.guest_email ? ` · ${order.guest_email}` : ""}
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
                Total {formatInr(order.total_paise)}
                {order.discount_paise
                  ? ` · discount ${formatInr(order.discount_paise)}`
                  : ""}
                {order.coupon_code ? ` · ${order.coupon_code}` : ""}
                {order.razorpay_payment_id
                  ? ` · ${order.razorpay_payment_id}`
                  : ""}
              </p>
              <ul className="text-sm text-espresso-muted">
                {(order.order_items as Array<{
                  id: string;
                  name: string;
                  quantity: number;
                }> | null)?.map((item) => (
                  <li key={item.id}>
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
