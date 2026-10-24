import { NextResponse } from "next/server";
import { applyCouponCode } from "@/lib/coupons";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    code?: string;
    subtotalPaise?: number;
  };

  if (!body.code || !Number.isInteger(body.subtotalPaise)) {
    return NextResponse.json({ error: "code and subtotalPaise required" }, { status: 400 });
  }

  const result = await applyCouponCode(body.code, body.subtotalPaise!);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
