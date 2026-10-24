-- Optional seed mirroring src/data/products.ts (run after 001_init.sql)

insert into public.products (
  slug, name, description, category, price_paise, quantity,
  low_stock_threshold, featured, accent_from, accent_to, is_active
) values
  ('rose-dew-serum', 'Rose Dew Serum', 'A feather-light rosehip serum that softens and brightens.', 'skin', 189900, 24, 5, true, '#f3d6cf', '#c97b7b', true),
  ('velvet-lip-balm', 'Velvet Lip Balm', 'Sheer pigment with shea and jojoba.', 'makeup', 69900, 4, 5, true, '#f0c4b8', '#b85c5c', true),
  ('silk-body-oil', 'Silk Body Oil', 'Squalane and sandalwood for after-bath rituals.', 'body', 149900, 18, 5, true, '#e8dcc8', '#a8906a', true),
  ('amber-nuit-perfume', 'Amber Nuit', 'Warm amber, soft musk, a whisper of bergamot.', 'fragrance', 299900, 0, 5, true, '#d9c4a8', '#6b4f3a', true),
  ('cloud-cleanser', 'Cloud Cleanser', 'Creamy gel cleanser that lifts SPF and pigment without stripping.', 'skin', 99900, 32, 5, false, '#e8efe8', '#8aa89a', true),
  ('soft-focus-blush', 'Soft Focus Blush', 'Buildable cream blush in a warm rose.', 'makeup', 129900, 11, 5, false, '#f5cfc9', '#d4847a', true),
  ('linen-hand-cream', 'Linen Hand Cream', 'Fast-absorbing cream with oat and ceramide.', 'body', 79900, 3, 5, false, '#efe6d8', '#b8a48a', true),
  ('petal-mist', 'Petal Mist', 'A fine rosewater mist to reset makeup and skin midday.', 'fragrance', 89900, 20, 5, false, '#f2dde0', '#c48a94', true);
