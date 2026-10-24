"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { rupeesToPaise } from "@/domain/money";

export function CouponCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [type, setType] = useState<"percent" | "flat">("percent");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      const payload = {
        code: String(form.get("code")),
        occasionLabel: String(form.get("occasionLabel")),
        description: String(form.get("description")),
        discountType: type,
        percentOff: type === "percent" ? Number(form.get("percentOff")) : null,
        amountPaise:
          type === "flat"
            ? rupeesToPaise(Number(form.get("amountRupees")), "flat discount")
            : null,
        minOrderPaise: rupeesToPaise(
          Number(form.get("minOrderRupees") || 0),
          "min order",
        ),
        isActive: true,
      };

      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not create coupon");
        setPending(false);
        return;
      }
      event.currentTarget.reset();
      setPending(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid amount");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface-card grid gap-3 p-5 sm:grid-cols-2">
      <h3 className="font-display text-xl sm:col-span-2">New coupon</h3>
      <input
        name="code"
        required
        placeholder="CODE"
        className="field font-mono uppercase"
      />
      <input
        name="occasionLabel"
        required
        placeholder="Occasion (Diwali)"
        className="field"
      />
      <input
        name="description"
        placeholder="Description"
        className="field sm:col-span-2"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as "percent" | "flat")}
        className="field"
      >
        <option value="percent">Percent</option>
        <option value="flat">Flat (₹)</option>
      </select>
      {type === "percent" ? (
        <input
          name="percentOff"
          type="number"
          min={1}
          max={100}
          required
          placeholder="Percent"
          className="field"
        />
      ) : (
        <input
          name="amountRupees"
          type="number"
          min={1}
          step="0.01"
          required
          placeholder="Flat off (₹200)"
          className="field"
        />
      )}
      <input
        name="minOrderRupees"
        type="number"
        min={0}
        step="0.01"
        defaultValue={0}
        placeholder="Min order (₹)"
        className="field sm:col-span-2"
      />
      {error && <p className="text-sm text-blush sm:col-span-2">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-espresso px-4 py-2 text-sm text-ivory disabled:opacity-60 sm:col-span-2"
      >
        {pending ? "Saving…" : "Create coupon"}
      </button>
    </form>
  );
}
