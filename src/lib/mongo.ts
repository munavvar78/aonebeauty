import { MongoClient, Db, type ClientSession } from "mongodb";

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export function getMongoDbName(): string {
  return process.env.MONGODB_DB_NAME?.trim() || "aonebeauty";
}

async function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!globalForMongo._mongoClientPromise) {
    const normalized = uri.includes("?")
      ? uri
      : `${uri.replace(/\/$/, "")}/?retryWrites=true&w=majority`;
    const client = new MongoClient(normalized, {
      tls: true,
      family: 4,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
    });
    globalForMongo._mongoClientPromise = client.connect();
  }

  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(getMongoDbName());
}

export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const client = await getClient();
  const session = client.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function ensureIndexes(): Promise<void> {
  if (!isMongoConfigured()) return;
  const db = await getDb();
  await Promise.all([
    db.collection("products").createIndex({ slug: 1 }, { unique: true }),
    db.collection("coupons").createIndex({ code: 1 }, { unique: true }),
    db
      .collection("applied_payments")
      .createIndex({ paymentId: 1 }, { unique: true }),
    db.collection("orders").createIndex({ razorpayOrderId: 1 }, { sparse: true }),
    db.collection("admins").createIndex({ email: 1 }, { unique: true }),
    db.collection("stock_movements").createIndex({ productId: 1 }),
  ]);
}
