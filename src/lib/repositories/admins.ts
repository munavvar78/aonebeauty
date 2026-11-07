import { getDb, isMongoConfigured } from "@/lib/mongo";
import type { AdminDoc } from "./types";

export async function findAdminByEmail(
  email: string,
): Promise<AdminDoc | null> {
  if (!isMongoConfigured()) return null;
  const db = await getDb();
  return db
    .collection<AdminDoc>("admins")
    .findOne({ email: email.trim().toLowerCase() });
}

export async function upsertAdmin(
  email: string,
  passwordHash: string,
): Promise<void> {
  const db = await getDb();
  const normalized = email.trim().toLowerCase();
  await db.collection<AdminDoc>("admins").updateOne(
    { email: normalized },
    {
      $set: { passwordHash },
      $setOnInsert: { email: normalized, createdAt: new Date() },
    },
    { upsert: true },
  );
}
