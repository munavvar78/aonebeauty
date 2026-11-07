# Aone Beauty

Aesthetic beauty e-commerce storefront (Next.js) with guest checkout, admin stock control, MongoDB Atlas, Auth.js, AWS S3 images, and Razorpay.

## Quick start

```bash
cp .env.example .env.local
# fill MONGODB_URI, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, Razorpay keys
npm install
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin).

Without `MONGODB_URI` the shop falls back to the Phase 1 seed catalog. Checkout stays demo-mode until Mongo + Razorpay are configured.

## Stack

Next.js App Router · TypeScript · Tailwind · MongoDB Atlas · Auth.js · AWS S3 · Razorpay · Vitest · Docker / ECR / App Runner · GitHub Actions

See [PROJECT.md](PROJECT.md) for rules and [DEPLOY.md](DEPLOY.md) for AWS production setup.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm test` | Vitest |
| `npm run build` | Production build (`standalone`) |
| `npm run db:seed` | Indexes + products + coupons + admin user |
