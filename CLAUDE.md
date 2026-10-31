# Kuha Ko website

Kuha Ko is a coffee bar (Kuha Ko Coffee, the owner's) and a thrift boutique (Kuha Ko Thrift, the partner's) under one roof in Iloilo City, Philippines. Opening day is June 22, 2027; live selling on the thrift page starts November 2026. The name is Hiligaynon: *kuha* = take/get, *ko* = I/my, so "Kuha ko" = "I'll take it".

## Repo

Turborepo monorepo, npm workspaces, React 18 + Vite + TypeScript.

- `apps/web`: the one-page website. Content lives in `src/data/site.ts` (shop details) and `src/data/menu.ts` (drinks); sections are in `src/components/`.
  On phones (and when opened from the home screen, via `public/manifest.webmanifest`) it switches to an iOS-style tab layout (`src/app/`). `?app` forces that layout on a desktop; `?web` forces the full site on a phone. There are no store apps: the installable web app is the app.
- `packages/tokens`: design tokens. `src/tokens.json` is the source (copied from the Kuha Ko design system); `npm run build` writes `dist/tokens.css` (CSS variables, light + dark) and a typed JS object. Never edit `dist/`.
- `packages/ui`: brand components (`Wordmark`, `Stamp`, `HangTag`, `MenuItem`, `ClaimBanner`, `SubBrandLabel`, `ButtonLink`, `Eyebrow`) and `styles.css`. Consumed as TypeScript source (no build step).
- `packages/tsconfig`: shared TypeScript configs.
- `docs/brand-guidelines.md`: the full brand guidelines. Read it before changing copy or visuals.

## Commands

- `npm install`, then `npm run dev` (site at http://localhost:5173)
- `npm run build`, `npm run typecheck`, `npm test` (all through turbo)

## Brand rules that matter in code

- Logo artwork only: **Kúha Ko** (acute accent on the u; bold "Kúha", light italic "Ko"). Everywhere else, including copy, alt text, metadata and drink names, write **Kuha Ko** with no accent. Never Kuha ko, KuhaKo, Kuhà, Kuhá.
- Live-selling claim word: **KUHA KO!** (capitals, one exclamation mark). Pronunciation line: KOO-ha ko, /ˈku.haʔ ko/.
- Colours only through token variables (`var(--espresso)`, `var(--rust)` …); never hard-code hex in components. `rust` = coffee accent, `sage-ink` = thrift accent, `mustard` only on `board`.
- Fonts: Fraunces (display), DM Sans (body), Courier Prime (labels, tags). Loaded from Google Fonts in `apps/web/index.html`.
- The page ground is `canvas` (white). Use `var(--safe-t|r|b|l)` for screen-edge insets, not `env()` directly.
- Square corners (`radius-sm`), hairlines instead of shadows, no emoji, sentence-case headings, capitals only for labels.
- Text must keep 4.5:1 contrast in both themes; `packages/tokens` has a test for the main pairs.

## Not decided yet (shown as "coming soon" on the site)

Prices, shop address, opening hours, Facebook and Instagram links. Fill them in `apps/web/src/data/site.ts` and `menu.ts`; leave a field `null`/unset to keep the "coming soon" or "Price at opening" text. The handle @kuhako has not been checked for availability.
