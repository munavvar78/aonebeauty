/**
 * Seeds MongoDB Atlas with products, coupons, indexes, and bootstrap admin.
 *
 * Requires in .env.local:
 *   MONGODB_URI=...
 *   ADMIN_EMAIL=admin@aonebeauty.in
 *   ADMIN_PASSWORD=change-me
 *
 * Optional: MONGODB_DB_NAME=aonebeauty
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = resolve(root, ".env.local");
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

let uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}

// Atlas expects TLS + retryWrites; append if the URI has no query string.
if (!uri.includes("?")) {
  uri = `${uri.replace(/\/$/, "")}/?retryWrites=true&w=majority`;
}

const dbName = process.env.MONGODB_DB_NAME || "aonebeauty";
const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "";

const client = new MongoClient(uri, {
  tls: true,
  // Windows + mongodb+srv often fails TLS over IPv6; prefer IPv4.
  family: 4,
  serverSelectionTimeoutMS: 20000,
  connectTimeoutMS: 20000,
});

try {
  console.log("Connecting to MongoDB…");
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log("Connected.");
  const db = client.db(dbName);

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
  console.log("Indexes ready.");

  const now = new Date();
  const products = [
    {
      slug: "gentle-face-wash",
      name: "Gentle Face Wash",
      description:
        "A soft daily face wash that cleans without stripping. Leaves skin calm, fresh, and ready for cream.",
      category: "skin",
      pricePaise: 17000,
      compareAtPricePaise: 29900,
      quantity: 50,
      lowStockThreshold: 5,
      featured: true,
      accentFrom: "#e8efe8",
      accentTo: "#8aa89a",
      isActive: true,
      imagePath: null,
    },
    {
      slug: "soft-day-cream",
      name: "Soft Day Cream",
      description:
        "A light everyday cream for soft, comfortable skin. Absorbs clean — perfect after your face wash.",
      category: "skin",
      pricePaise: 6000,
      compareAtPricePaise: null,
      quantity: 50,
      lowStockThreshold: 5,
      featured: true,
      accentFrom: "#f3d6cf",
      accentTo: "#c97b7b",
      isActive: true,
      imagePath: null,
    },
  ];

  for (const product of products) {
    await db.collection("products").updateOne(
      { slug: product.slug },
      {
        $set: {
          ...product,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }
  // Deactivate anything not in the real catalog
  await db.collection("products").updateMany(
    { slug: { $nin: products.map((p) => p.slug) } },
    { $set: { isActive: false, updatedAt: now } },
  );
  console.log("Products seeded.");

  const coupons = [
    {
      code: "WELCOME10",
      occasionLabel: "Welcome",
      description: "10% off your first soft ritual — min ₹500.",
      discountType: "percent",
      percentOff: 10,
      amountPaise: null,
      minOrderPaise: 50000,
      startsAt: null,
      endsAt: null,
      isActive: true,
    },
    {
      code: "DIWALI15",
      occasionLabel: "Diwali",
      description: "15% off festive glow edits — min ₹999.",
      discountType: "percent",
      percentOff: 15,
      amountPaise: null,
      minOrderPaise: 99900,
      startsAt: null,
      endsAt: null,
      isActive: true,
    },
    {
      code: "NEWYEAR200",
      occasionLabel: "New Year",
      description: "Flat ₹200 off — min ₹1,499.",
      discountType: "flat",
      percentOff: null,
      amountPaise: 20000,
      minOrderPaise: 149900,
      startsAt: null,
      endsAt: null,
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    await db.collection("coupons").updateOne(
      { code: coupon.code },
      {
        $set: coupon,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }
  console.log("Coupons seeded.");

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await db.collection("admins").updateOne(
      { email: adminEmail },
      {
        $set: { passwordHash },
        $setOnInsert: { email: adminEmail, createdAt: now },
      },
      { upsert: true },
    );
    console.log(`Admin ready: ${adminEmail}`);
  } else {
    console.warn(
      "Skipped admin seed — set ADMIN_EMAIL and ADMIN_PASSWORD to create login.",
    );
  }

  console.log("Done.");
} catch (error) {
  console.error("Seed failed:", error.message);
  if (/SSL|TLS|tlsv1|CERT|ECONN|ENOTFOUND|querySrv|timed out/i.test(String(error.message))) {
    console.error(`
TLS / network checklist:
1. Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0) for now
2. Atlas → Database → Connect → Drivers → copy the full mongodb+srv URI (include ?retryWrites=true&w=majority)
3. If the DB password has @ # % etc, URL-encode it in MONGODB_URI
4. Try again: npm run db:seed
`);
  }
  process.exitCode = 1;
} finally {
  await client.close().catch(() => {});
}
