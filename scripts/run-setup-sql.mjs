/**
 * Runs supabase/setup_all.sql against your remote Supabase Postgres.
 *
 * 1. Supabase → Project Settings → Database → Connection string → URI
 * 2. Copy into .env.local as DATABASE_URL=postgresql://postgres:...@db....supabase.co:5432/postgres
 * 3. npm run db:setup
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

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

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!databaseUrl) {
  console.error(`
Missing DATABASE_URL.

Add this to .env.local (from Supabase → Project Settings → Database → URI):

  DATABASE_URL=postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-....pooler.supabase.com:5432/postgres

Then run: npm run db:setup
`);
  process.exit(1);
}

const sqlPath = resolve(root, "supabase", "setup_all.sql");
const sql = readFileSync(sqlPath, "utf8");

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  console.log("Connecting to Supabase Postgres…");
  await client.connect();
  console.log(`Running ${sqlPath}…`);
  await client.query(sql);
  console.log("Done. Open Supabase → Table Editor to see products, coupons, orders, etc.");
} catch (error) {
  console.error("SQL failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
