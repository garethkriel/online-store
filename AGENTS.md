# Relay Commerce — Base44 Dev Environment

## Project overview
Next.js 14 App Router + TypeScript + Tailwind + Prisma/PostgreSQL dropshipping storefront.
Source lives under `src/` (app routes in `src/app/`, libs in `src/lib/`, worker in `src/worker/`).
The repo was imported as flat files at root; they were reorganized into the `src/` structure the imports expect.

## Running the app
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
- Web: http://localhost:3000 (Next.js dev server, hot-reload)
- PostgreSQL: compose service `postgres` (user/pass/db: `relay`)
- Schema sync: `npx prisma db push` runs automatically on container startup

## Key pages
- `/` — storefront (lists active products)
- `/p/[id]` — product detail + add to cart
- `/cart` — cart + checkout (PayFast redirect)
- `/order/[id]` — order status
- `/admin/import` — import product by URL (needs `x-admin-password` header = `ADMIN_PASSWORD`)
- `/admin/fulfillment` — manual fulfillment queue

## External credentials (optional for boot)
- `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE` — needed for checkout to work
- `RESEND_API_KEY` — needed for transactional emails (logs to console without it)
- `ADMIN_PASSWORD` — defaults to `change-me`; set a real one before launch

Without PayFast/Resend keys the app boots and browses fine; only checkout and email are affected.

## Worker (not in compose)
The background worker (`npm run worker`) and price-sync (`npm run price-sync`) are one-off/long-running
scripts not needed for the storefront to render. Run them manually if testing fulfillment.
