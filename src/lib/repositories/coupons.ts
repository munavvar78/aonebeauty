import { ObjectId } from "mongodb";
import type { Coupon } from "@/domain/coupons";
import { normalizeCouponCode } from "@/domain/coupons";
import { getDb, isMongoConfigured } from "@/lib/mongo";
import type { CouponDoc } from "./types";

export function mapCouponDoc(doc: CouponDoc): Coupon {
  return {
    code: doc.code,
    occasionLabel: doc.occasionLabel,
    description: doc.description,
    discountType: doc.discountType,
    percentOff: doc.percentOff,
    amountPaise: doc.amountPaise,
    minOrderPaise: doc.minOrderPaise,
    startsAt: doc.startsAt,
    endsAt: doc.endsAt,
    isActive: doc.isActive,
  };
}

export async function listActiveCouponsDocs(): Promise<Coupon[]> {
  if (!isMongoConfigured()) return [];
  const db = await getDb();
  const docs = await db
    .collection<CouponDoc>("coupons")
    .find({ isActive: true })
    .sort({ occasionLabel: 1 })
    .toArray();
  return docs.map(mapCouponDoc);
}

export async function listAllCouponsAdmin(): Promise<CouponDoc[]> {
  if (!isMongoConfigured()) return [];
  const db = await getDb();
  return db
    .collection<CouponDoc>("coupons")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findCouponByCodeDoc(
  code: string,
): Promise<Coupon | null> {
  const normalized = normalizeCouponCode(code);
  if (!normalized || !isMongoConfigured()) return null;
  const db = await getDb();
  const doc = await db
    .collection<CouponDoc>("coupons")
    .findOne({ code: normalized });
  return doc ? mapCouponDoc(doc) : null;
}

export async function insertCoupon(
  input: Omit<CouponDoc, "_id" | "createdAt">,
): Promise<string> {
  const db = await getDb();
  const result = await db.collection<CouponDoc>("coupons").insertOne({
    ...input,
    createdAt: new Date(),
  } as CouponDoc);
  return result.insertedId.toHexString();
}

export async function setCouponActive(
  id: string,
  isActive: boolean,
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db
    .collection<CouponDoc>("coupons")
    .updateOne({ _id: new ObjectId(id) }, { $set: { isActive } });
  return result.matchedCount > 0;
}
