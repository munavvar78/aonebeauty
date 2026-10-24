-- Add MRP / compare-at price, then set the real 2-product skin catalog

alter table public.products
  add column if not exists compare_at_price_paise integer
  check (compare_at_price_paise is null or compare_at_price_paise >= 0);

-- Hide old demo products
update public.products
set is_active = false, updated_at = now()
where slug not in ('gentle-face-wash', 'soft-day-cream');

-- Face wash: sell ₹170, MRP ₹299
insert into public.products (
  slug, name, description, category, price_paise, compare_at_price_paise,
  quantity, low_stock_threshold, featured, accent_from, accent_to, is_active
) values (
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
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  price_paise = excluded.price_paise,
  compare_at_price_paise = excluded.compare_at_price_paise,
  quantity = excluded.quantity,
  featured = excluded.featured,
  is_active = true,
  updated_at = now();

-- Cream: sell ₹60
insert into public.products (
  slug, name, description, category, price_paise, compare_at_price_paise,
  quantity, low_stock_threshold, featured, accent_from, accent_to, is_active
) values (
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
  quantity = excluded.quantity,
  featured = excluded.featured,
  is_active = true,
  updated_at = now();
