# Aone Beauty — Project Constitution

This file is the single source of truth for scope, rules, structure, and phase gates.
No feature work starts until this document exists. A phase does not begin until the previous phase’s `npm test` is green and its definition of done is met.

## Purpose

Aone Beauty is a small, aesthetic beauty e-commerce storefront with:

- Guest checkout (no customer accounts)
- Private admin login for product and stock management
- Integer-paise pricing in INR
- Razorpay (test mode first) as the only payment provider
- Quantity that can never go below zero
- Occasion coupons (display + apply at checkout, discount in paise)
- WhatsApp contact FAB for the owner (not a checkout replacement)
- Product images via AWS S3 on the storefront

## Non-goals (all phases)

- Customer accounts or order history for guests
- WhatsApp-only checkout (Razorpay remains primary payment)
- A second payment gateway (Stripe, PayU, etc.)
- Auto-apply best coupon, referral systems, shipping rate engines, GST invoices
- In-app refunds (flag `paid_out_of_stock` for a manual Razorpay refund)
- Product reviews
- Stock reservation cron jobs

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + design tokens |
| Data | MongoDB Atlas; Phase 1 seed fallback when `MONGODB_URI` missing |
| Auth | Auth.js (Credentials) + bcrypt admin in Mongo |
| Images | AWS S3 |
| Payments | Razorpay (INR, paise) |
| Tests | Vitest + Testing Library |
| Local | `next dev` |
| Host | Docker → Amazon ECR → ECS Fargate + ALB |
| CI/CD | GitHub Actions (`ci.yml`, `deploy.yml`) |

## Brand and visual rules

- **Velvet spotlight** look: near-black void, hot rose (#ff3d6e), flame, gold, jade — high contrast, campaign energy (not beige template)
- Headings: **Playfair Display** (italic drama); UI text: **Syne**
- Full-bleed dark hero with spotlight beams + hue shift, neon-gradient marquee, light product band, scroll reveals
- Large product imagery, wide margins, small-label navigation
- Colors, type, and spacing come from the token set in `globals.css` / Tailwind theme
- Components must not invent one-off hex values outside the token aliases

## Strict rules (requirements)

1. **Money is integer paise.** No floats for prices or totals. Format INR only via the display helper in `src/domain/money.ts`.
2. **Stock changes only through the inventory module** (`src/domain/inventory.ts` and its server adapters). UI and routes must not set `quantity` directly.
3. **Quantity cannot drop below 0.** Sold-out products cannot be purchased.
4. **A Razorpay success screen is not proof of payment.** Stock drops only after server-side signature verification, once per payment id.
5. **Race on last unit:** the conditional update `quantity >= requested` decides the winner. The loser is stored as `paid_out_of_stock` for a manual refund. No reservation cron in this version.
6. **`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `AUTH_SECRET`, `MONGODB_URI`, and AWS keys never ship to the browser or git.** Only `.env.example` is committed.
7. **Admin pages require the allowlisted Auth.js user** (`ADMIN_EMAIL`). Guests never see them.
8. **Business rules live in `src/domain/`** and receive unit tests before the screen that depends on them.
9. **Do not start the next phase while the current phase’s tests fail.**

## Folder map

```
PROJECT.md                 # this constitution
.env.example               # env names only
src/
  app/                     # Next.js App Router pages and API routes
  components/              # UI components (tokens only)
  data/                    # Phase 1 seed catalog fallback
  domain/                  # pure business rules + *.test.ts
  lib/                     # mongo, repositories, razorpay, auth, s3
  styles/                  # global CSS / tokens
scripts/
  seed-mongo.mjs           # indexes + catalog + admin bootstrap
.github/workflows/         # CI + AWS deploy
Dockerfile                 # ECS / ECR image
DEPLOY.md                  # Atlas, S3, ECS Fargate, GHA secrets
```


### Domain modules

| File | Responsibility |
| --- | --- |
| `src/domain/money.ts` | Paise, INR formatting, line totals |
| `src/domain/inventory.ts` | Adjust stock, reject negative, low-stock / sold-out labels |
| `src/domain/cart.ts` | Add, cap to available quantity, totals |
| `src/domain/orders.ts` | Pending → paid, idempotent payment, out-of-stock-after-pay |
| `src/domain/checkout.ts` | Name, 10-digit Indian phone, address, pincode |
| `src/domain/admin.ts` | Admin email allowlist check |

Tests sit next to modules (`money.test.ts`). Run with `npm test`.

## Environment variables

Documented in `.env.example`. Never commit real values.

| Name | Where used | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin writes |
| `ADMIN_EMAIL` | Server | Allowlisted admin |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Browser + server | Public key id |
| `RAZORPAY_KEY_SECRET` | Server only | Never public |
| `RAZORPAY_WEBHOOK_SECRET` | Server only | Webhook HMAC |

---

## Phase 1 — Aesthetic storefront

### In scope

- App shell, design tokens, seed catalog (~8 products)
- Public pages: Home, Shop (category filter), Product detail, About, Contact
- Quantity display: “N left” / “Low stock” / “Sold out”; sold-out disables buy control
- Local SVG / CSS still-life product imagery (no fragile hotlinks)
- Domain: `money`, inventory labels; product slug lookup
- Vitest + first unit / component tests

### Out of scope

- Admin, cart persistence, Razorpay, Supabase

### Tasks

1. Scaffold Next.js + TypeScript + Tailwind + Vitest
2. Design tokens and layout (header, footer)
3. Seed products with `pricePaise` and `quantity`
4. Build five public pages
5. Write and pass Phase 1 tests

### Test list

- Paise → INR formatting
- Line totals in paise
- Sold-out and low-stock labels
- Product slug lookup
- Header / product card render states

### Definition of done

- [ ] `npm test` is green for Phase 1 tests
- [ ] Five public pages usable on desktop and mobile viewports
- [ ] Buy control disabled when sold out
- [ ] No admin / cart / payment code yet

**Gate:** Phase 2 starts only when the above checklist and `npm test` pass.

---

## Phase 2 — Quantity management and admin

### In scope

- Supabase tables: `products`, `stock_movements`, `orders`, `order_items` (orders unwired for UI)
- RLS: public read of active products; writes via service role after admin session check
- Admin at `/admin`: sign-in, product list, create/edit, image upload, stock add/remove/set absolute with movements, deactivate
- Storefront reads Supabase when env is set; seed remains fallback

### Out of scope

- Checkout UI, Razorpay, customer accounts

### Tasks

1. SQL migration and Storage bucket for product images
2. Admin auth (email must match `ADMIN_EMAIL`)
3. Inventory server adapters wrapping domain rules
4. Admin UI for products and stock
5. Storefront data source with seed fallback
6. Write and pass Phase 2 inventory / admin tests

### Test list

- Add stock, remove stock, reject negative
- Absolute set
- Low-stock threshold
- Sale decrement helper
- Admin email allowlist

### Definition of done

- [ ] Inventory and admin unit tests pass (`npm test`)
- [ ] Admin can change quantity; shop shows the new number when Supabase is configured
- [ ] Service role key never exposed to the browser

**Gate:** Phase 3 starts only when the above checklist and `npm test` pass.

---

## Phase 3 — Guest checkout and Razorpay

### In scope

- Browser cart; server revalidation at pay time
- Quantity selector capped by stock
- Guest checkout form: name, phone, optional email, address, city, state, 6-digit pincode
- Create Razorpay order + local `pending` order
- Verify signature on return handler and webhook; idempotent per payment id
- On verified pay: decrement stock + `sale` movement, or set `paid_out_of_stock`
- Admin order list: pending, paid, failed, paid_out_of_stock
- `.env.example` complete; deploy notes below

### Out of scope

- Live (non-test) Razorpay as a requirement for merge; use test keys for DoD
- In-app refunds, coupons, shipping calculators

### Tasks

1. Cart domain + UI
2. Checkout validation + pages
3. Razorpay create-order and verify routes
4. Webhook + idempotent payment application
5. Admin orders list
6. Phase 3 unit tests
7. Document Cloudflare Pages + webhook URL

### Test list

- Cart refuses quantity above stock
- Checkout field validation
- Order total in paise
- Pending → paid only with valid signature
- Repeat payment id does not double-decrement
- Insufficient stock → `paid_out_of_stock`

### Definition of done

- [ ] Phase 3 unit tests pass (`npm test`)
- [ ] With Razorpay **test** keys, a test payment marks the order paid and reduces quantity
- [ ] Secrets remain server-only

**Gate:** Project MVP complete when the above checklist and `npm test` pass.

---

## Deploy notes (Phase 3)

### Cloudflare Pages (OpenNext)

1. Push the repo to GitHub.
2. Build with the OpenNext Cloudflare adapter (`@opennextjs/cloudflare`) or the project’s documented `npm run pages:build` script once added.
3. Set all env vars in the Cloudflare Pages project settings (same names as `.env.example`).
4. Point a custom domain if desired; otherwise use the `*.pages.dev` URL.

### Razorpay webhook

1. In Razorpay Dashboard → Webhooks, add: `https://<your-domain>/api/payments/webhook`
2. Subscribe to payment capture / order paid events as implemented by the verify route.
3. Paste the webhook secret into `RAZORPAY_WEBHOOK_SECRET`.

### Local development

```bash
cp .env.example .env.local
# fill public keys + secrets for Supabase and Razorpay test mode
npm install
npm run dev
npm test
```

---

## Phase status

| Phase | Status |
| --- | --- |
| PROJECT.md | Complete |
| Phase 1 | Complete — storefront + domain tests green |
| Phase 2 | Complete — inventory domain, admin UI, Supabase schema |
| Phase 3 | Complete — cart, checkout, Razorpay routes, payment tests green |

Run `npm test` any time to re-check the phase gate (35+ unit tests).
