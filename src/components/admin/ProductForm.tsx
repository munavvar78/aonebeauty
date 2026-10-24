"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { paiseToRupees, rupeesToPaise } from "@/domain/money";

type ProductFormValues = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  pricePaise: number;
  compareAtPricePaise?: number | null;
  quantity?: number;
  lowStockThreshold: number;
  featured: boolean;
  isActive: boolean;
  accentFrom: string;
  accentTo: string;
};

export function ProductForm({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: ProductFormValues;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      const pricePaise = rupeesToPaise(
        Number(form.get("priceRupees")),
        "price",
      );
      const compareRaw = String(form.get("compareAtRupees") ?? "").trim();
      const compareAtPricePaise =
        compareRaw === ""
          ? null
          : rupeesToPaise(Number(compareRaw), "MRP");

      const payload = {
        id: product?.id,
        slug: String(form.get("slug")),
        name: String(form.get("name")),
        description: String(form.get("description")),
        category: String(form.get("category")),
        pricePaise,
        compareAtPricePaise,
        quantity: Number(form.get("quantity") ?? 0),
        lowStockThreshold: Number(form.get("lowStockThreshold")),
        featured: form.get("featured") === "on",
        isActive: form.get("isActive") === "on",
        accentFrom: String(form.get("accentFrom")),
        accentTo: String(form.get("accentTo")),
      };

      const response = await fetch("/api/admin/products", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Save failed");
        setPending(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid amount");
      setPending(false);
    }
  }

  const priceDefault =
    product?.pricePaise != null ? String(paiseToRupees(product.pricePaise)) : "";
  const mrpDefault =
    product?.compareAtPricePaise != null
      ? String(paiseToRupees(product.compareAtPricePaise))
      : "";

  return (
    <form onSubmit={onSubmit} className="surface-card space-y-4 p-6">
      {(
        [
          ["name", "Name", "text", product?.name ?? ""],
          ["slug", "Slug", "text", product?.slug ?? ""],
          ["description", "Description", "text", product?.description ?? ""],
          ["priceRupees", "Price (₹)", "number", priceDefault],
          ["compareAtRupees", "MRP / original (₹, optional)", "number", mrpDefault],
          [
            "lowStockThreshold",
            "Low stock threshold",
            "number",
            String(product?.lowStockThreshold ?? 5),
          ],
          ["accentFrom", "Accent from", "text", product?.accentFrom ?? "#f3d6cf"],
          ["accentTo", "Accent to", "text", product?.accentTo ?? "#c97b7b"],
        ] as const
      ).map(([name, label, type, defaultValue]) => (
        <label key={name} className="block space-y-1 text-sm">
          <span className="label-nav">{label}</span>
          <input
            name={name}
            type={type}
            defaultValue={defaultValue}
            min={type === "number" ? 0 : undefined}
            step={name === "priceRupees" || name === "compareAtRupees" ? "0.01" : undefined}
            required={name !== "description" && name !== "compareAtRupees"}
            className="field"
          />
        </label>
      ))}

      {mode === "create" && (
        <label className="block space-y-1 text-sm">
          <span className="label-nav">Initial quantity</span>
          <input
            name="quantity"
            type="number"
            min={0}
            defaultValue={0}
            className="field"
          />
        </label>
      )}

      <label className="block space-y-1 text-sm">
        <span className="label-nav">Category</span>
        <select
          name="category"
          defaultValue={product?.category ?? "skin"}
          className="field"
        >
          <option value="skin">Skin</option>
          <option value="makeup">Makeup</option>
          <option value="body">Body</option>
          <option value="fragrance">Fragrance</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input name="featured" type="checkbox" defaultChecked={product?.featured} />
        Featured
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={product?.isActive ?? true}
        />
        Active on storefront
      </label>

      {error && <p className="text-sm text-blush">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-espresso px-6 py-3 text-sm text-ivory disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}
