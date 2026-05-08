# Royal Jersey BD

A premium luxury sports apparel e-commerce website for Royal Jersey BD — Bangladesh's finest custom jersey brand. Features dark luxury aesthetics with gold and crimson accents, inspired by Fabrilife's UX flow but with an elevated, cinematic feel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/royal-jersey-bd run dev` — run the frontend (port 22662)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod validators for server
- `lib/db/src/schema/products.ts` — all DB tables (categories, products, offers, cart, wishlist, orders)
- `artifacts/api-server/src/routes/` — all API route handlers
- `artifacts/royal-jersey-bd/src/` — React frontend

## Architecture decisions

- Cart and wishlist are session-based (no auth required) using `x-session-id` header
- Orval zod config uses `mode: "single"` with `workspace` pointing to `src/generated/` subfolder to avoid barrel export name conflicts with TypeScript types
- `lib/api-zod/src/index.ts` exports only from `./generated/api` (not types folder) to avoid duplicate name conflicts
- All product images use Unsplash URLs as seeded data placeholders — swap with real photos via admin

## Product

- Homepage with cinematic hero slider, flash sale banner, editions grid, fabric highlight section, masonry gallery
- Product listing with filter sidebar (category, edition, stock)
- Product detail with image gallery, size guide popup, sticky add-to-cart
- Cart side drawer with real-time item management
- Checkout with bKash, Nagad, Rocket, Card, and Cash on Delivery payment methods
- Wishlist with heart animations
- Floating WhatsApp support button
- Dark/Light mode toggle in hamburger menu

## User preferences

- Deep black theme with gold (#c9a84c) and crimson (#8b0000) accents chosen for luxury sportswear feel
- Do NOT use emojis in UI text
- Fabrilife-inspired UX flow

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change, then fix `lib/api-zod/src/index.ts` to only export from `./generated/api` (codegen may overwrite it)
- Session ID for cart/wishlist is sent via `x-session-id` header from the frontend custom-fetch
- Product images are Unsplash placeholders — replace with real CDN URLs in the database

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
