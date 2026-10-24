"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CouponToggle({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="rounded-full border border-line px-4 py-2 text-sm hover:border-blush disabled:opacity-60"
    >
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
