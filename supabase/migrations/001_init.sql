-- Aone Beauty Phase 2 schema

create extension if not exists "pgcrypto";

create type public.product_category as enum ('skin', 'makeup', 'body', 'fragrance');

create type public.stock_reason as enum ('restock', 'adjustment', 'sale', 'sale_reversal');

create type public.order_status as enum ('pending', 'paid', 'failed', 'paid_out_of_stock');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  category public.product_category not null,
  price_paise integer not null check (price_paise >= 0),
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

create table public.orders (
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  name text not null,
  unit_price_paise integer not null check (unit_price_paise >= 0),
  quantity integer not null check (quantity > 0)
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  delta integer not null,
  reason public.stock_reason not null,
  note text,
  order_id uuid references public.orders (id),
  created_at timestamptz not null default now()
);

create table public.applied_payments (
  payment_id text primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  applied_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.applied_payments enable row level security;

create policy "Public can read active products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

-- Writes go through the service role (bypasses RLS). No public insert/update.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');
