import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatInr } from "@/domain/money";
import { CouponCreateForm } from "@/components/admin/CouponCreateForm";
import { CouponToggle } from "@/components/admin/CouponToggle";

export default async function AdminCouponsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/admin");

  const db = createServiceRoleClient();
  if (!db) {
    return (
      <p className="text-blush">
        Configure SUPABASE_SERVICE_ROLE_KEY and run migration 002_coupons.sql.
      </p>
    );
  }

  const { data: coupons, error } = await db
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl">Coupons</h2>
      </div>

      {error && (
        <p className="text-sm text-blush">
          {error.message}. Run supabase/migrations/002_coupons.sql in the SQL
          Editor.
        </p>
      )}

      <CouponCreateForm />

      <ul className="space-y-4">
        {(coupons ?? []).map((coupon) => (
          <li
            key={coupon.id}
            className="surface-card flex flex-wrap items-center justify-between gap-4 p-5"
          >
            <div>
              <p className="label-nav text-blush">{coupon.occasion_label}</p>
              <p className="font-mono text-lg">{coupon.code}</p>
              <p className="text-sm text-espresso-muted">
                {coupon.discount_type === "percent"
                  ? `${coupon.percent_off}% off`
                  : `${formatInr(coupon.amount_paise ?? 0)} off`}
                {" · "}
                min {formatInr(coupon.min_order_paise)}
                {coupon.is_active ? "" : " · inactive"}
              </p>
            </div>
            <CouponToggle id={coupon.id} isActive={coupon.is_active} />
          </li>
        ))}
      </ul>
    </div>
  );
}
