import type { ClientSession } from "mongodb";
import { getDb } from "@/lib/mongo";
import type { AppliedPaymentDoc } from "./types";

export async function findAppliedPayment(
  paymentId: string,
  session?: ClientSession,
): Promise<AppliedPaymentDoc | null> {
  const db = await getDb();
  return db
    .collection<AppliedPaymentDoc>("applied_payments")
    .findOne({ paymentId }, { session });
}

export async function upsertAppliedPayment(
  paymentId: string,
  orderId: string,
  session?: ClientSession,
): Promise<void> {
  const db = await getDb();
  await db.collection<AppliedPaymentDoc>("applied_payments").updateOne(
    { paymentId },
    {
      $setOnInsert: {
        paymentId,
        orderId,
        appliedAt: new Date(),
      },
    },
    { upsert: true, session },
  );
}
