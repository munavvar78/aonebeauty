import { ObjectId, type ClientSession } from "mongodb";
import type { Product, ProductCategory } from "@/data/products";
import { getDb, isMongoConfigured } from "@/lib/mongo";
import { productImagePublicUrl } from "@/lib/storage";
import type { ProductDoc } from "./types";

export function mapProductDoc(doc: ProductDoc): Product {
  return {
    id: doc._id.toHexString(),
    slug: doc.slug,
    name: doc.name,
    description: doc.description,
    category: doc.category,
    pricePaise: doc.pricePaise,
    compareAtPricePaise: doc.compareAtPricePaise ?? null,
    quantity: doc.quantity,
    lowStockThreshold: doc.lowStockThreshold,
    featured: Boolean(doc.featured),
    accentFrom: doc.accentFrom ?? "#f3d6cf",
    accentTo: doc.accentTo ?? "#c97b7b",
    isActive: doc.isActive,
    imagePath: doc.imagePath,
    imageUrl: productImagePublicUrl(doc.imagePath),
  };
}

function toObjectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

export async function listActiveProducts(
  category: ProductCategory | "all" = "all",
): Promise<Product[]> {
  if (!isMongoConfigured()) return [];
  const db = await getDb();
  const filter: Record<string, unknown> = { isActive: true };
  if (category !== "all") filter.category = category;
  const docs = await db
    .collection<ProductDoc>("products")
    .find(filter)
    .sort({ name: 1 })
    .toArray();
  return docs.map(mapProductDoc);
}

export async function listFeaturedActiveProducts(): Promise<Product[]> {
  if (!isMongoConfigured()) return [];
  const db = await getDb();
  const docs = await db
    .collection<ProductDoc>("products")
    .find({ isActive: true, featured: true })
    .sort({ name: 1 })
    .toArray();
  return docs.map(mapProductDoc);
}

export async function findActiveProductBySlug(
  slug: string,
): Promise<Product | null> {
  if (!isMongoConfigured()) return null;
  const db = await getDb();
  const doc = await db
    .collection<ProductDoc>("products")
    .findOne({ slug, isActive: true });
  return doc ? mapProductDoc(doc) : null;
}

export async function findProductById(
  id: string,
): Promise<ProductDoc | null> {
  if (!isMongoConfigured()) return null;
  const oid = toObjectId(id);
  if (!oid) return null;
  const db = await getDb();
  return db.collection<ProductDoc>("products").findOne({ _id: oid });
}

export async function findProductBySlugAny(
  slug: string,
): Promise<ProductDoc | null> {
  if (!isMongoConfigured()) return null;
  const db = await getDb();
  return db.collection<ProductDoc>("products").findOne({ slug });
}

export async function listAllProductsAdmin(): Promise<ProductDoc[]> {
  if (!isMongoConfigured()) return [];
  const db = await getDb();
  return db
    .collection<ProductDoc>("products")
    .find({})
    .sort({ name: 1 })
    .toArray();
}

export async function getStockMap(
  productIds: string[],
): Promise<Record<string, number>> {
  if (!isMongoConfigured() || productIds.length === 0) return {};
  const oids = productIds
    .map(toObjectId)
    .filter((id): id is ObjectId => id !== null);
  if (oids.length === 0) return {};
  const db = await getDb();
  const docs = await db
    .collection<ProductDoc>("products")
    .find({ _id: { $in: oids } }, { projection: { quantity: 1 } })
    .toArray();
  return Object.fromEntries(
    docs.map((d) => [d._id.toHexString(), d.quantity]),
  );
}

export async function insertProduct(
  input: Omit<ProductDoc, "_id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const db = await getDb();
  const now = new Date();
  const result = await db.collection<ProductDoc>("products").insertOne({
    ...input,
    createdAt: now,
    updatedAt: now,
  } as ProductDoc);
  return result.insertedId.toHexString();
}

export async function updateProductFields(
  id: string,
  fields: Partial<
    Omit<ProductDoc, "_id" | "createdAt" | "quantity">
  > & { updatedAt: Date },
): Promise<boolean> {
  const oid = toObjectId(id);
  if (!oid) return false;
  const db = await getDb();
  const result = await db
    .collection<ProductDoc>("products")
    .updateOne({ _id: oid }, { $set: fields });
  return result.matchedCount > 0;
}

export async function setProductQuantityCas(
  id: string,
  expectedQuantity: number,
  nextQuantity: number,
  session?: ClientSession,
): Promise<boolean> {
  const oid = toObjectId(id);
  if (!oid) return false;
  const db = await getDb();
  const result = await db.collection<ProductDoc>("products").findOneAndUpdate(
    { _id: oid, quantity: expectedQuantity },
    { $set: { quantity: nextQuantity, updatedAt: new Date() } },
    { session, returnDocument: "after" },
  );
  return Boolean(result);
}

export async function decrementProductIfAvailable(
  id: string,
  amount: number,
  session?: ClientSession,
): Promise<{ ok: true; quantity: number } | { ok: false }> {
  const oid = toObjectId(id);
  if (!oid) return { ok: false };
  const db = await getDb();
  const result = await db.collection<ProductDoc>("products").findOneAndUpdate(
    { _id: oid, quantity: { $gte: amount } },
    {
      $inc: { quantity: -amount },
      $set: { updatedAt: new Date() },
    },
    { session, returnDocument: "after" },
  );
  if (!result) return { ok: false };
  return { ok: true, quantity: result.quantity };
}
