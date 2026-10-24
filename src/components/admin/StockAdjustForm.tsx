"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function StockAdjustForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const kind = String(form.get("kind"));
    const amount = Number(form.get("amount"));
    const note = String(form.get("note") ?? "");

    const response = await fetch("/api/admin/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, kind, amount, note }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Stock update failed");
      setPending(false);
      return;
    }
    setMessage(`Quantity is now ${data.quantity}`);
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <label className="text-xs">
        <span className="label-nav block mb-1">Action</span>
        <select
          name="kind"
          className="field"
          defaultValue="add"
        >
          <option value="add">Add</option>
          <option value="remove">Remove</option>
          <option value="set">Set absolute</option>
        </select>
      </label>
      <label className="text-xs">
        <span className="label-nav block mb-1">Amount</span>
        <input
          name="amount"
          type="number"
          min={0}
          required
          className="field w-24"
        />
      </label>
      <label className="text-xs grow">
        <span className="label-nav block mb-1">Note</span>
        <input
          name="note"
          type="text"
          className="field min-w-[10rem]"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-blush px-4 py-2 text-sm text-ivory disabled:opacity-60"
      >
        Apply
      </button>
      {message && <p className="basis-full text-sm text-espresso-muted">{message}</p>}
    </form>
  );
}
