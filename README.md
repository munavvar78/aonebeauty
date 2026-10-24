# Aone Beauty

Aesthetic beauty storefront with guest checkout, admin stock control, and Razorpay (INR).

Read **[PROJECT.md](PROJECT.md)** first — it is the project constitution (rules, phases, and gates).

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
npm test
```

Without Supabase / Razorpay keys the shop runs on the Phase 1 seed catalog. Checkout validates the cart and shows a demo-mode message until keys are set.

## Stack

Next.js App Router · TypeScript · Tailwind CSS · Supabase · Razorpay · Vitest

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm test` | Unit tests (phase gate) |
| `npm run build` | Production build |
