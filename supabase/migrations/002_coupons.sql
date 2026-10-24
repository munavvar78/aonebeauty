-- Coupons + order discount columns

create type public.coupon_discount_type as enum ('percent', 'flat');

create table public.coupons (
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
  created_at timestamptz not null default now(),
  constraint coupons_discount_shape check (
    (discount_type = 'percent' and percent_off is not null and amount_paise is null)
    or (discount_type = 'flat' and amount_paise is not null and percent_off is null)
  )
);

alter table public.orders
  add column if not exists coupon_code text,
  add column if not exists discount_paise integer not null default 0 check (discount_paise >= 0);

alter table public.coupons enable row level security;

create policy "Public can read active coupons"
  on public.coupons
  for select
  to anon, authenticated
  using (
    is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

insert into public.coupons (
  code, occasion_label, description, discount_type, percent_off, amount_paise, min_order_paise, is_active
) values
  ('WELCOME10', 'Welcome', '10% off your first soft ritual — min ₹500.', 'percent', 10, null, 50000, true),
  ('DIWALI15', 'Diwali', '15% off festive glow edits — min ₹999.', 'percent', 15, null, 99900, true),
  ('NEWYEAR200', 'New Year', 'Flat ₹200 off — min ₹1,499.', 'flat', null, 20000, 149900, true)
on conflict (code) do nothing;
