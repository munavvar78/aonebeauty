import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { adjustProductStock } from "@/lib/inventory/service";
import type { StockAdjustment } from "@/domain/inventory";

type Body = {
  productId: string;
  kind: "add" | "remove" | "set";
  amount: number;
  note?: string;
};

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const body = (await request.json()) as Body;
  if (!body.productId || !body.kind || !Number.isInteger(body.amount)) {
    return NextResponse.json({ error: "Invalid stock payload" }, { status: 400 });
  }

  const adjustment: StockAdjustment = {
    kind: body.kind,
    amount: body.amount,
  };

  const result = await adjustProductStock({
    productId: body.productId,
    adjustment,
    note: body.note,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ quantity: result.quantity });
}
