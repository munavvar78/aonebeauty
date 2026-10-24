"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatInr } from "@/domain/money";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, totalPaise, clear } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    occasionLabel: string;
    discountPaise: number;
    payablePaise: number;
  } | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-6 py-10">
        <h1 className="text-4xl">Checkout</h1>
        <p className="text-espresso-muted">Your bag is empty.</p>
        <Link href="/shop" className="label-nav hover:text-blush">
          Continue shopping
        </Link>
      </div>
    );
  }

  const payable = appliedCoupon?.payablePaise ?? totalPaise;

  async function applyCoupon() {
    setCouponMessage(null);
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: couponInput,
        subtotalPaise: totalPaise,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setAppliedCoupon(null);
      setCouponMessage(data.error ?? "Invalid coupon");
      return;
    }
    setAppliedCoupon({
      code: data.code,
      occasionLabel: data.occasionLabel,
      discountPaise: data.discountPaise,
      payablePaise: data.payablePaise,
    });
    setCouponMessage(`${data.occasionLabel} applied`);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);

    const form = new FormData(event.currentTarget);
    const checkout = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      pincode: String(form.get("pincode") ?? ""),
    };

    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          checkout,
          couponCode: appliedCoupon?.code || couponInput || undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.errors) setFieldErrors(data.errors);
        setError(data.error ?? "Could not start checkout");
        setPending(false);
        return;
      }

      if (data.mode === "demo") {
        setError(
          "Online payments are being set up. Please message us on WhatsApp to place this order.",
        );
        setPending(false);
        return;
      }

      if (!window.Razorpay) {
        setError("Payment is still loading. Please try again in a moment.");
        setPending(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amountPaise,
        currency: data.currency,
        name: "Aone Beauty",
        description: "Order payment",
        order_id: data.razorpayOrderId,
        prefill: {
          name: data.customer.name,
          email: data.customer.email,
          contact: data.customer.contact,
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              localOrderId: data.localOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verify.json();
          if (!verify.ok) {
            setError(verifyData.error ?? "Payment verification failed");
            setPending(false);
            return;
          }
          clear();
          router.push(`/order/${data.localOrderId}?status=${verifyData.status}`);
        },
      });

      rzp.open();
      setPending(false);
    } catch {
      setError("Something went wrong starting checkout");
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="label-nav">Checkout</p>
            <h1 className="text-4xl">Guest details</h1>
          </div>
          <form onSubmit={onSubmit} className="surface-card space-y-4 p-6">
            {(
              [
                ["name", "Full name", "text"],
                ["phone", "Mobile (10 digits)", "tel"],
                ["email", "Email (optional)", "email"],
                ["address", "Address", "text"],
                ["city", "City", "text"],
                ["state", "State", "text"],
                ["pincode", "Pincode", "text"],
              ] as const
            ).map(([name, label, type]) => (
              <label key={name} className="block space-y-1 text-sm">
                <span className="label-nav">{label}</span>
                <input
                  name={name}
                  type={type}
                  className="field"
                  required={name !== "email"}
                />
                {fieldErrors[name] && (
                  <span className="text-xs text-blush">{fieldErrors[name]}</span>
                )}
              </label>
            ))}
            {error && (
              <p className="text-sm text-blush" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-espresso px-6 py-3 text-sm text-ivory disabled:opacity-60"
            >
              {pending ? "Starting payment…" : `Pay ${formatInr(payable)}`}
            </button>
          </form>
        </div>

        <aside className="surface-card h-fit space-y-4 p-6">
          <h2 className="font-display text-2xl">Order summary</h2>
          <ul className="space-y-3 text-sm">
            {cart.lines.map((line) => (
              <li key={line.productId} className="flex justify-between gap-4">
                <span>
                  {line.name} × {line.quantity}
                </span>
                <span>{formatInr(line.unitPricePaise * line.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-line pt-4">
            <p className="label-nav">Coupon code</p>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="WELCOME10"
                className="field min-w-0 flex-1 font-mono text-sm"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="rounded-full border border-line px-4 py-2 text-sm hover:border-blush"
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <p className="text-xs text-espresso-muted">{couponMessage}</p>
            )}
            <Link href="/offers" className="text-xs text-blush hover:underline">
              See occasion offers
            </Link>
          </div>

          <div className="space-y-1 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatInr(totalPaise)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-blush">
                <span>Discount ({appliedCoupon.code})</span>
                <span>−{formatInr(appliedCoupon.discountPaise)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-lg">
              <span>Total</span>
              <span className="font-display">{formatInr(payable)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
