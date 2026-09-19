# Relay Commerce — dropshipping storefront starter

Sell products sourced from Temu, Shein, Takealot, Makro and other retailers. Customers pay you;
each order lands in a fulfillment queue with the supplier order pre-filled; you place it and paste
the tracking number back. Supplier adapters are pluggable so any source with an official
API/affiliate feed can be automated later.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- Prisma + PostgreSQL
- Payments: PayFast (South Africa) or Stripe — swap in src/lib/payments
- Background jobs: simple DB-backed queue (src/worker)

## Quick start
1. cp .env.example .env and fill in DATABASE_URL + payment keys
2. npm install
3. npx prisma migrate dev
4. npm run dev  →  http://localhost:3000
5. Admin: /admin/import (add products by URL)  ·  /admin/fulfillment (order queue)

## How an order flows
1. Customer checks out → Order(status=PENDING_PAYMENT)
2. Payment webhook confirms → Order(status=PAID) + one FulfillmentJob per supplier
3. Worker runs each job: if the supplier adapter implements placeOrder (official API), it
   auto-places; otherwise the job is marked NEEDS_MANUAL and shows in /admin/fulfillment
4. You place the order on the supplier site, enter their order # + tracking → customer emailed

## Important before launch
- You are the seller of record. Returns, refunds and consumer-protection obligations (e.g. the
  South African CPA) are yours, not the supplier's. Budget for it in your margin.
- Temu/Shein ship from China: add customs/VAT and 2–4 week delivery to your pricing and product pages.
- Supplier prices and stock change constantly — run the price-sync job (src/worker/priceSync.ts)
  at least daily and set a minimum margin floor so you never sell at a loss.
- Do not build automated checkout bots for supplier sites. It breaks constantly and gets your
  buyer accounts banned with orders stuck inside them. Use official programmes where they exist.
