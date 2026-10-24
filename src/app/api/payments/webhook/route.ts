import { NextResponse } from "next/server";
import { applyRazorpayPayment } from "@/lib/payments/apply";
import { verifyWebhookSignature } from "@/lib/razorpay/client";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          notes?: { local_order_id?: string };
        };
      };
      order?: {
        entity?: {
          id?: string;
          notes?: { local_order_id?: string };
        };
      };
    };
  };

  const payment = payload.payload?.payment?.entity;
  const razorpayOrderId =
    payment?.order_id ?? payload.payload?.order?.entity?.id;
  const paymentId = payment?.id;
  let localOrderId =
    payment?.notes?.local_order_id ??
    payload.payload?.order?.entity?.notes?.local_order_id;

  if (!localOrderId && razorpayOrderId) {
    const db = createServiceRoleClient();
    if (db) {
      const { data } = await db
        .from("orders")
        .select("id")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();
      localOrderId = data?.id;
    }
  }

  if (!localOrderId || !razorpayOrderId || !paymentId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const result = await applyRazorpayPayment({
    localOrderId,
    razorpayOrderId,
    paymentId,
    signatureValid: true,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ status: result.status });
}
