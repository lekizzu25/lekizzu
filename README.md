# POS SaaS — Small Business Operating System

A multi-tenant POS SaaS platform for small neighborhood businesses.
Built for baqalas, barbers, and tailors first.

---

## Architecture Overview

```
Frontend (Next.js 14) → Backend API (NestJS) → Database (Supabase/PostgreSQL)
        ↓                        ↓
    Vercel CDN              Railway hosting
                                 ↓
                    WhatsApp (Twilio) + Stripe
```

**Multi-tenancy:** Every DB record has a `shop_id`. The JWT guard automatically
injects `shop_id` into every request — zero chance of data leakage between tenants.

---

## Project Structure

```
pos-saas/
├── database/
│   └── schema.sql              ← Run this first in Supabase SQL editor
│
├── backend/                    ← NestJS API (port 4000)
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── common/
│       │   ├── supabase/       ← Shared Supabase client
│       │   ├── guards/         ← JwtAuthGuard, ModuleGuard
│       │   ├── decorators/     ← @CurrentUser(), @CurrentShop()
│       │   ├── filters/        ← Global error handler
│       │   └── interceptors/   ← Response transformer
│       └── modules/
│           ├── auth/           ← Login, register, onboarding
│           ├── shops/          ← Shop management
│           ├── pos/            ← Checkout, sales ✅
│           ├── inventory/      ← Products, stock
│           ├── customers/      ← CRM, credit, loyalty ✅
│           ├── appointments/   ← Barber bookings
│           ├── tailor-orders/  ← Tailor order tracking
│           ├── messaging/      ← WhatsApp automation ✅
│           ├── subscriptions/  ← Stripe billing
│           └── reports/        ← Analytics, daily summary ✅
│
└── frontend/                   ← Next.js 14 (port 3000)
    └── src/
        ├── types/index.ts      ← All TypeScript types ✅
        ├── lib/
        │   ├── api.ts          ← Typed API client ✅
        │   └── store.ts        ← Zustand (cart + app state) ✅
        ├── app/
        │   ├── auth/           ← Login, register pages
        │   └── dashboard/
        │       ├── pos/        ← POS screen
        │       ├── inventory/  ← Product management
        │       ├── customers/  ← Customer list
        │       ├── appointments/
        │       ├── orders/     ← Tailor orders
        │       └── reports/    ← Analytics
        └── components/
```

---

## Quick Start

### 1. Set up Supabase

1. Create project at https://supabase.com
2. Go to SQL Editor → paste contents of `database/schema.sql` → Run
3. Copy your project URL and keys

### 2. Backend

```bash
cd backend
cp ../.env.example .env
# Fill in your Supabase keys in .env
npm install
npm run start:dev
# API available at http://localhost:4000/api/v1
# Swagger docs at http://localhost:4000/api/docs
```

### 3. Frontend

```bash
cd frontend
cp ../.env.example .env.local
# Fill in NEXT_PUBLIC_ variables
npm install
npm run dev
# App at http://localhost:3000
```

---

## Key Design Decisions

### Why `shop_id` on every table?
Row-level multi-tenancy. The API injects `shop_id` from the JWT automatically.
Controllers never pass `shop_id` manually — it comes from `@CurrentShop()`.

### Why feature flags via `enabled_modules` JSON?
Avoids plan-per-table complexity. When a shop upgrades from Basic to Growth,
you just update their `enabled_modules` array. The `ModuleGuard` checks this
on every request.

### Why NestJS over Express?
Dependency injection makes testing and scaling easy. Guards, interceptors,
and decorators keep controllers thin. When you hire devs, NestJS patterns
are familiar and enforced.

### Why Zustand over Redux?
Simpler, less boilerplate. The cart store is all you need for POS state.

---

## Module → Plan Mapping

| Module        | Mobile | Basic | Growth | Pro |
|---------------|--------|-------|--------|-----|
| pos           | ✅     | ✅    | ✅     | ✅  |
| customers     | ✅     | ✅    | ✅     | ✅  |
| reports       | ✅     | ✅    | ✅     | ✅  |
| loyalty       | ❌     | ✅    | ✅     | ✅  |
| appointments  | ❌     | ✅    | ✅     | ✅  |
| tailor_orders | ❌     | ✅    | ✅     | ✅  |
| inventory     | ❌     | ❌    | ✅     | ✅  |
| credit        | ❌     | ❌    | ✅     | ✅  |
| whatsapp      | ❌     | ❌    | ✅     | ✅  |
| suppliers     | ❌     | ❌    | ❌     | ✅  |

---

## Build Order (12-Week MVP)

- **Week 1–2**: Auth + Shop onboarding + DB schema
- **Week 3–4**: Product catalog + Inventory management
- **Week 5–6**: POS checkout screen (most important!)
- **Week 7–8**: Customer profiles + Credit system
- **Week 9–10**: Reports + WhatsApp receipts
- **Week 11–12**: Barber appointments + Tailor orders

---

## Infra Cost (target: 400–800 SAR/mo)

| Service      | Cost           |
|--------------|----------------|
| Vercel       | Free (hobby)   |
| Supabase     | $25/mo (Pro)   |
| Railway      | ~$10/mo        |
| Twilio       | Pay per message|
| Stripe       | 2.9% per txn   |
| **Total**    | **~$35–50/mo** |

---

## Next Steps (for you)

1. **Run the schema** in Supabase SQL editor
2. **Build the auth flow** — shop signup → business type selection → onboarding
3. **Build the POS screen** — this is your core value, ship it first
4. **Onboard 3 real shops** for free — baqala, barber, tailor
5. **Charge first customer** at week 12

The system is designed so you can hand it to a developer with clear module
boundaries. Each module is self-contained with its own controller, service, and DTOs.
