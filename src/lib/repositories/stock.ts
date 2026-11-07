import { ObjectId, type ClientSession } from "mongodb";
import { getDb } from "@/lib/mongo";
import type { StockMovementDoc } from "./types";

export async function insertStockMovement(
  input: {
    productId: string;
    delta: number;
    reason: StockMovementDoc["reason"];
    note?: string | null;
    orderId?: string | null;
  },
  session?: ClientSession,
): Promise<void> {
  const db = await getDb();
  await db.collection<StockMovementDoc>("stock_movements").insertOne(
    {
      productId: input.productId,
      delta: input.delta,
      reason: input.reason,
      note: input.note ?? null,
      orderId: input.orderId ?? null,
      createdAt: new Date(),
    } as StockMovementDoc,
    { session },
  );
}

export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}
