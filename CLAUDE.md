# Kuha Ko website

Kuha Ko is a coffee bar (Kuha Ko Coffee, the owner's) and a thrift boutique (Kuha Ko Thrift, the partner's) under one roof in Iloilo City, Philippines. Opening day is June 22, 2027; live selling on the thrift page starts November 2026. The name is Hiligaynon: *kuha* = take/get, *ko* = I/my, so "Kuha ko" = "I'll take it".

## Repo

Turborepo monorepo, npm workspaces, React 18 + Vite + TypeScript.

- `apps/web`: the one-page website. Shop details live in `src/data/site.ts`; sections are in `src/components/`.
  Products and prices come from the database (Neon Postgres) through `GET /api/catalog` (`src/catalog/catalog.tsx`). `src/data/menu.ts` and `shirts.ts` are the seed and the fallback shown when the API can't be reached; edit live products in the admin page, not there.
  Backend: Vercel Functions in `api/` (Web `Request`/`Response` handlers), helpers in `server/`, code shared with the browser in `shared/` (`catalog.ts` types and helpers; `schema.ts` zod schemas, kept out of the customer bundle). Money is whole centavos everywhere. Server-side relative imports end in `.js`.
  Ordering: `src/shop/` (cart in localStorage, product sheet, checkout), `src/order/` (the customer's `/order/:id` page), `server/orders.ts` (holds stock 30 minutes). No payment gateway: customers scan the shop's GCash QR or Maya QR Ph code and send the reference number; the shop confirms it in the admin's Orders tab. The server re-prices every order from the database.
  Shop admin at `/admin` (`src/admin/`, loaded only there): one shared password, signed httpOnly cookie scoped to `/api/admin`. Database schema in `db/migrations/`. How to run the shop: `docs/online-orders.md`.
  On phones (and when opened from the home screen, via `public/manifest.webmanifest`) it switches to an iOS-style tab layout (`src/app/`). `?app` forces that layout on a desktop; `?web` forces the full site on a phone. There are no store apps: the installable web app is the app.
- `packages/tokens`: design tokens. `src/tokens.json` is the source (copied from the Kuha Ko design system); `npm run build` writes `dist/tokens.css` (CSS variables, light + dark) and a typed JS object. Never edit `dist/`.
- `packages/ui`: brand components (`Wordmark`, `Stamp`, `HangTag`, `MenuItem`, `ClaimBanner`, `SubBrandLabel`, `ButtonLink`, `Eyebrow`) and `styles.css`. Consumed as TypeScript source (no build step).
- `packages/tsconfig`: shared TypeScript configs.
- `docs/brand-guidelines.md`: the full brand guidelines. Read it before changing copy or visuals.

## Commands

- `npm install`, then `npm run dev` (site at http://localhost:5173)
- `npm run build`, `npm run typecheck`, `npm test` (all through turbo)
- With the API and admin: `vercel env pull` (repo root, writes `.env.local`), then `vercel dev`. Database: `npm run db:migrate --workspace @kuhako/web`, then `db:seed` (never overwrites existing rows)
- Env vars: `DATABASE_URL` (Neon), `BLOB_READ_WRITE_TOKEN` (product photos), `ADMIN_PASSWORD` (12+ characters), `ADMIN_SESSION_SECRET` (32+ random characters); ordering: `VITE_GOOGLE_MAPS_KEY`, `VITE_GOOGLE_MAP_ID`, `GOOGLE_ROUTES_KEY`, `RESEND_API_KEY`, `SHOP_EMAIL`, `EMAIL_FROM`. Each one missing degrades gracefully; see `docs/online-orders.md`

## Brand rules that matter in code

- Logo artwork only: **Kúha Ko** (acute accent on the u; bold "Kúha", light italic "Ko"). Everywhere else, including copy, alt text, metadata and drink names, write **Kuha Ko** with no accent. Never Kuha ko, KuhaKo, Kuhà, Kuhá.
- Live-selling claim word: **KUHA KO!** (capitals, one exclamation mark). Pronunciation line: KOO-ha ko, /ˈku.haʔ ko/.
- Colours only through token variables (`var(--espresso)`, `var(--rust)` …); never hard-code hex in components. `rust` = coffee accent, `sage-ink` = thrift accent, `mustard` only on `board`.
- Fonts: Fraunces (display), DM Sans (body), Courier Prime (labels, tags). Loaded from Google Fonts in `apps/web/index.html`.
- The page ground is `canvas` (white). Use `var(--safe-t|r|b|l)` for screen-edge insets, not `env()` directly.
- Square corners (`radius-sm`), hairlines instead of shadows, no emoji, sentence-case headings, capitals only for labels.
- Text must keep 4.5:1 contrast in both themes; `packages/tokens` has a test for the main pairs.

## Not decided yet (shown as "coming soon" on the site)

Prices, shop address, opening hours, Facebook and Instagram links. Prices are set in the admin page (an empty price keeps "Price at opening" and the item can't be ordered); the rest in `apps/web/src/data/site.ts`, where `null` keeps the "coming soon" text. The handle @kuhako has not been checked for availability.
