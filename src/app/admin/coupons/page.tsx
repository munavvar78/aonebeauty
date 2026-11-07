import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { isMongoConfigured } from "@/lib/mongo";
import { listAllCouponsAdmin } from "@/lib/repositories/coupons";
import { formatInr } from "@/domain/money";
import { CouponCreateForm } from "@/components/admin/CouponCreateForm";
import { CouponToggle } from "@/components/admin/CouponToggle";

export default async function AdminCouponsPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/admin");

  if (!isMongoConfigured()) {
    return (
      <p className="text-blush">Configure MONGODB_URI to manage coupons.</p>
    );
  }

  const coupons = await listAllCouponsAdmin();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl">Coupons</h2>
      </div>

      <CouponCreateForm />

      <ul className="space-y-4">
        {coupons.map((coupon) => (
          <li
            key={coupon._id.toHexString()}
            className="surface-card flex flex-wrap items-center justify-between gap-4 p-5"
          >
            <div>
              <p className="label-nav text-blush">{coupon.occasionLabel}</p>
              <p className="font-mono text-lg">{coupon.code}</p>
              <p className="text-sm text-espresso-muted">
                {coupon.discountType === "percent"
                  ? `${coupon.percentOff}% off`
                  : `${formatInr(coupon.amountPaise ?? 0)} off`}
                {" · "}
                min {formatInr(coupon.minOrderPaise)}
                {coupon.isActive ? "" : " · inactive"}
              </p>
            </div>
            <CouponToggle
              id={coupon._id.toHexString()}
              isActive={coupon.isActive}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
