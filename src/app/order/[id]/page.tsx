import Link from "next/link";
import { SITE, whatsappUrl } from "@/data/site";

type OrderPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function OrderStatusPage({
  params,
  searchParams,
}: OrderPageProps) {
  const { id } = await params;
  const { status } = await searchParams;

  const title =
    status === "paid"
      ? "Thank you"
      : status === "paid_out_of_stock"
        ? "We're sorting this out"
        : status === "failed"
          ? "Payment didn't go through"
          : "Order update";

  const body =
    status === "paid"
      ? "Your order is confirmed. We'll pack it shortly."
      : status === "paid_out_of_stock"
        ? `Your payment went through, but an item just sold out. ${SITE.owner.name} will contact you on WhatsApp to refund or help.`
        : status === "failed"
          ? "Nothing was charged. You can try again from your bag."
          : "You can continue shopping anytime.";

  return (
    <div className="mx-auto max-w-lg space-y-6 px-6 py-16 text-center">
      <p className="label-nav">Order</p>
      <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>
      <p className="text-ink-soft">{body}</p>
      <p className="text-xs text-ink-soft/70">Order ref · {id.slice(0, 8)}</p>
      {status === "paid_out_of_stock" && (
        <a
          href={whatsappUrl(
            `Hi ${SITE.owner.name}, I need help with order ${id.slice(0, 8)}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block label-nav text-jade hover:text-rose"
        >
          Message on WhatsApp
        </a>
      )}
      <div>
        <Link href="/shop" className="inline-block label-nav hover:text-rose">
          Back to shop
        </Link>
      </div>
    </div>
  );
}
