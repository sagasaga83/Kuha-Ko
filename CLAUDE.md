# Kuha Ko website

Kuha Ko is a coffee bar (Kuha Ko Coffee, the owner's) and a thrift boutique (Kuha Ko Thrift, the partner's) under one roof in Iloilo City, Philippines. Opening day is June 22, 2027; live selling on the thrift page starts November 2026. The name is Hiligaynon: *kuha* = take/get, *ko* = I/my, so "Kuha ko" = "I'll take it".

## Repo

Turborepo monorepo, npm workspaces, React 18 + Vite + TypeScript.

- `apps/web`: the website, one page per section: `/` (home), `/menu`, `/thrift`, `/live`, `/about` (the old `/visit` redirects there). Routing is `src/router.tsx` (no library; `Link` and `navigate`, old `/#menu` links are upgraded); `src/App.tsx` maps each path to its sections. New paths also need a rewrite in `apps/web/vercel.json`. Shop details live in `src/data/site.ts`; sections are in `src/components/`.
  Products and prices come from the database (Neon Postgres) through `GET /api/catalog` (`src/catalog/catalog.tsx`). `src/data/menu.ts` and `shirts.ts` are the seed and the fallback shown when the API can't be reached; edit live products in the admin page, not there.
  Backend: Vercel Functions in `api/` (Web `Request`/`Response` handlers), helpers in `server/`, code shared with the browser in `shared/` (`catalog.ts` types and helpers; `schema.ts` zod schemas, kept out of the customer bundle). Money is whole centavos everywhere. Server-side relative imports end in `.js`, in `shared/` too. The Hobby plan allows at most 12 functions per deployment and `api/` is at 12: add a method to an existing file rather than a new file.
  Ordering: `src/shop/` (cart in localStorage, product sheet, checkout; the thrift rack, `src/useRack.ts`, hangs the thrift products on their `rackPhotoUrl` cut-outs and a pick puts one straight in the cart), `src/order/` (the customer's `/order/:id` page), `server/orders.ts` (holds stock 30 minutes). No payment gateway: customers scan the shop's GCash QR or Maya QR Ph code and send the reference number; the shop confirms it in the admin's Orders tab. The server re-prices every order from the database.
  Customer accounts at `/account` (`src/account/`, optional; guests can still order): Clerk sign-in, saved checkout details and order history; the token goes to the API as `Authorization: Bearer`, checked in `server/customers.ts`.
  Shop admin at `/admin` (`src/admin/`, loaded only there): one shared password, signed httpOnly cookie scoped to `/api/admin`. Database schema in `db/migrations/`. How to run the shop: `docs/online-orders.md`.
  On phones (and when opened from the home screen, via `public/manifest.webmanifest`) it switches to an iOS-style tab layout (`src/app/`). `?app` forces that layout on a desktop; `?web` forces the full site on a phone. There are no store apps: the installable web app is the app. In the full site at 760px and under, the cart is a bar pinned to the bottom (`CartBar site` in `src/shop/Shop.tsx`), not a header button: the phone header only has room for the wordmark, the lamp and Explore.
  Motion: `src/motion.ts` holds the spring, momentum projection and rubber-band helpers; the sheet (`src/app/ui.tsx`) drags to dismiss with them and the rack (`src/useDragScroll.ts`) glides after a mouse push. Durations are tokens on `:root` in `src/styles/site.css` (`--duration-quick` 150ms … `--duration-very-slow` 500ms, picked by what the motion does: closes quicker than opens, hovers in quick and out softer) with the site's own `--ease-out`. No fade-in-on-scroll; the hero entrance, the rack's arrival and the name section's texts reveal (`NameStory.tsx`) and the Explore cards hanging on their rail (`PageLinks.tsx`, via `src/useScrollIn.ts`) are the only entrances (the last two replay on every scroll in), and the signature moments (splash, swinging hang tags, stamp, lamp) keep their own timing.
  Design context for Impeccable: `apps/web/PRODUCT.md` (users, positioning, what not to invent) and `apps/web/DESIGN.md` (the visual system, "The Tagged Rack", with its sidecar `.impeccable/design.json`). Update DESIGN.md when the system changes.
- `packages/tokens`: design tokens. `src/tokens.json` is the source (copied from the Kuha Ko design system); `npm run build` writes `dist/tokens.css` (CSS variables, light + dark) and a typed JS object. Never edit `dist/`.
- `packages/ui`: brand components (`Wordmark`, `Stamp`, `HangTag`, `MenuItem`, `ClaimBanner`, `SubBrandLabel`, `ButtonLink`, `Eyebrow`) and `styles.css`. Consumed as TypeScript source (no build step).
- `packages/tsconfig`: shared TypeScript configs.
- `docs/brand-guidelines.md`: the full brand guidelines. Read it before changing copy or visuals.
- `.claude/skills/`: project skills (apple-design, impeccable, transitions-dev, transitions-polish; versions in `skills-lock.json`. babysit, design-is, do, handoff, make-plan and what-the are copied from claude-mem 15.10.1's plugin and aren't in the lock file). Impeccable's engine binary is not committed: its launcher downloads and checksum-verifies it on first use. Its hooks (`.claude/settings.local.json`) run the design detector after edits; detector hits on brand-mandated choices (Courier labels in capitals, the italic hero line, hanger clip-paths) are false positives.

## Commands

- `npm install`, then `npm run dev` (site at http://localhost:5173; if another project holds that port, run `npx vite apps/web --port 5180` from the repo root)
- `npm run build`, `npm run typecheck`, `npm test` (all through turbo)
- With the API and admin: `vercel env pull` (repo root, writes `.env.local`), then `vercel dev`. Database: `npm run db:migrate --workspace @kuhako/web`, then `db:seed` (never overwrites existing rows)
- Shipping: work on a branch and push it; Vercel builds a preview at `https://kuha-ko-git-<branch>-kuha-ko.vercel.app`. Merging to `main` deploys production (https://kuha-ko-kuha-ko.vercel.app).
- Env vars: `DATABASE_URL` (Neon), `BLOB_READ_WRITE_TOKEN` (product photos), `ADMIN_PASSWORD` (12+ characters), `ADMIN_SESSION_SECRET` (32+ random characters); accounts: `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (from the Clerk integration); ordering: `VITE_GOOGLE_MAPS_KEY`, `VITE_GOOGLE_MAP_ID`, `GOOGLE_ROUTES_KEY`, `RESEND_API_KEY`, `SHOP_EMAIL`, `EMAIL_FROM`. Each one missing degrades gracefully; see `docs/online-orders.md`

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
