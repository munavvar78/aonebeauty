import { NextResponse } from "next/server";
import { applyRazorpayPayment } from "@/lib/payments/apply";
import { verifyPaymentSignature } from "@/lib/razorpay/client";

type Body = {
  localOrderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  if (
    !body.localOrderId ||
    !body.razorpayOrderId ||
    !body.razorpayPaymentId ||
    !body.razorpaySignature
  ) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  const signatureValid = verifyPaymentSignature({
    orderId: body.razorpayOrderId,
    paymentId: body.razorpayPaymentId,
    signature: body.razorpaySignature,
  });

  const result = await applyRazorpayPayment({
    localOrderId: body.localOrderId,
    razorpayOrderId: body.razorpayOrderId,
    paymentId: body.razorpayPaymentId,
    signatureValid,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ status: result.status });
}
