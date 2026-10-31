# Kuha Ko · website

The website for Kuha Ko, a coffee bar and thrift boutique under one roof in Iloilo City. *Kape ko. Kuha ko.*

Built as a Turborepo monorepo with React, following the Kuha Ko brand guidelines (`docs/brand-guidelines.md`).

```
apps/
  web/            the website (Vite + React + TypeScript)
packages/
  tokens/         colours, fonts, spacing and radii from the brand guidelines → CSS variables
  ui/             brand components: wordmark, stamp, hang tag, menu item, claim banner…
  tsconfig/       shared TypeScript settings
```

## Run it

You need Node.js 20 or newer.

```bash
npm install
npm run dev        # open http://localhost:5173
```

Other commands: `npm run build` (production build in `apps/web/dist`), `npm run typecheck`, `npm test`.

## Update the content

- **Shop details** (address, hours, Facebook and Instagram links): `apps/web/src/data/site.ts`
- **Drinks and prices**: `apps/web/src/data/menu.ts`. Add a price like `hot: '₱120'`; drinks without one show "Price at opening".
- **Brand colours and fonts**: `packages/tokens/src/tokens.json`

## Publish it

`npm run build` produces a static site in `apps/web/dist` that any static host can serve (Netlify, Vercel, Cloudflare Pages or GitHub Pages). On Vercel or Netlify, set the build command to `npm run build` and the output folder to `apps/web/dist`.

## Work on it with Claude Code

Open this folder in a terminal and run `claude`. `CLAUDE.md` gives Claude the project's structure and brand rules.
