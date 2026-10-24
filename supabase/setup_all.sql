-- ============================================================
-- Aone Beauty — run this ONCE in Supabase → SQL Editor → Run
-- After it finishes, open Table Editor to see:
--   products, orders, order_items, stock_movements,
--   applied_payments, coupons
-- ============================================================

create extension if not exists "pgcrypto";

-- Enums (safe if they already exist)
do $$ begin
  create type public.product_category as enum ('skin', 'makeup', 'body', 'fragrance');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.stock_reason as enum ('restock', 'adjustment', 'sale', 'sale_reversal');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'paid', 'failed', 'paid_out_of_stock');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.coupon_discount_type as enum ('percent', 'flat');
exception when duplicate_object then null;
end $$;

-- Tables
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  category public.product_category not null,
  price_paise integer not null check (price_paise >= 0),
  compare_at_price_paise integer check (compare_at_price_paise is null or compare_at_price_paise >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  is_active boolean not null default true,
  featured boolean not null default false,
  image_path text,
  accent_from text default '#f3d6cf',
  accent_to text default '#c97b7b',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  status public.order_status not null default 'pending',
  guest_name text not null,
  guest_phone text not null,
  guest_email text,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  total_paise integer not null check (total_paise >= 0),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  coupon_code text,
  discount_paise integer not null default 0 check (discount_paise >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- In case orders existed from an older migration without coupon columns
alter table public.orders
  add column if not exists coupon_code text,
  add column if not exists discount_paise integer not null default 0;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  name text not null,
  unit_price_paise integer not null check (unit_price_paise >= 0),
  quantity integer not null check (quantity > 0)
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  delta integer not null,
  reason public.stock_reason not null,
  note text,
  order_id uuid references public.orders (id),
  created_at timestamptz not null default now()
);

create table if not exists public.applied_payments (
  payment_id text primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  applied_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  occasion_label text not null,
  description text not null default '',
  discount_type public.coupon_discount_type not null,
  percent_off integer check (percent_off is null or (percent_off >= 1 and percent_off <= 100)),
  amount_paise integer check (amount_paise is null or amount_paise > 0),
  min_order_paise integer not null default 0 check (min_order_paise >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.applied_payments enable row level security;
alter table public.coupons enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read active coupons" on public.coupons;
create policy "Public can read active coupons"
  on public.coupons
  for select
  to anon, authenticated
  using (
    is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

-- Storage bucket for product photos
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- MRP column for existing DBs
alter table public.products
  add column if not exists compare_at_price_paise integer
  check (compare_at_price_paise is null or compare_at_price_paise >= 0);

-- Real catalog: Face Wash (₹170 / MRP ₹299) + Cream (₹60)
update public.products
set is_active = false, updated_at = now()
where slug not in ('gentle-face-wash', 'soft-day-cream');

insert into public.products (
  slug, name, description, category, price_paise, compare_at_price_paise, quantity,
  low_stock_threshold, featured, accent_from, accent_to, is_active
) values
  (
    'gentle-face-wash',
    'Gentle Face Wash',
    'A soft daily face wash that cleans without stripping. Leaves skin calm, fresh, and ready for cream.',
    'skin',
    17000,
    29900,
    50,
    5,
    true,
    '#e8efe8',
    '#8aa89a',
    true
  ),
  (
    'soft-day-cream',
    'Soft Day Cream',
    'A light everyday cream for soft, comfortable skin. Absorbs clean — perfect after your face wash.',
    'skin',
    6000,
    null,
    50,
    5,
    true,
    '#f3d6cf',
    '#c97b7b',
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  price_paise = excluded.price_paise,
  compare_at_price_paise = excluded.compare_at_price_paise,
  featured = excluded.featured,
  is_active = true,
  updated_at = now();

-- Sample coupons
insert into public.coupons (
  code, occasion_label, description, discount_type, percent_off, amount_paise, min_order_paise, is_active
) values
  ('WELCOME10', 'Welcome', '10% off your first order — min ₹500.', 'percent', 10, null, 50000, true),
  ('DIWALI15', 'Diwali', '15% off festive picks — min ₹999.', 'percent', 15, null, 99900, true),
  ('NEWYEAR200', 'New Year', 'Flat ₹200 off — min ₹1,499.', 'flat', null, 20000, 149900, true)
on conflict (code) do nothing;
