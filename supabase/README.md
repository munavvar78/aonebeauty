# Supabase setup

## Fastest: run SQL from your laptop

1. Supabase → **Project Settings** → **Database** → **Connection string** → **URI**
2. Paste into [`.env.local`](../.env.local):

```env
DATABASE_URL=postgresql://postgres.[ref]:[YOUR-DB-PASSWORD]@....supabase.com:5432/postgres
```

(Use the database password you set when creating the project.)

3. From the project root:

```bash
npm install
npm run db:setup
```

That runs [`setup_all.sql`](setup_all.sql) on your live Supabase project. Then open **Table Editor** to confirm.

## Alternative: paste in SQL Editor

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project  
2. Go to **SQL Editor** → **New query**  
3. Open [`setup_all.sql`](setup_all.sql) in this folder  
4. Copy everything → paste → click **Run**  
5. Open **Table Editor** — you should see:

| Table | Purpose |
| --- | --- |
| `products` | Shop catalog + stock |
| `coupons` | Occasion offer codes |
| `orders` | Guest checkouts |
| `order_items` | Lines on each order |
| `stock_movements` | Stock history (admin) |
| `applied_payments` | Payment idempotency |

Sample products and coupons are inserted automatically.

## Individual migration files

- `migrations/001_init.sql` — products / orders / stock  
- `migrations/002_coupons.sql` — coupons + order discount columns  
- `seed.sql` — products only  

Prefer **`setup_all.sql`** unless you already ran the older files.
