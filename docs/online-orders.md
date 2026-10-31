# Online orders

Customers will order coffee, Kuha Ko shirts and selected thrift pieces on the website, for delivery within the Iloilo City area, and pay with GCash, Maya or QR Ph (which GoTyme, MariBank and any bank app can pay).

It is being built in three steps:

1. **Catalog and admin** (done): products, prices and stock live in a database, edited at `/admin`.
2. **Cart, checkout and payments** (next): cart, address with distance-based delivery fee, PayMongo payment, order emails.
3. **Orders and going live**: the orders screen, policy pages, and switching PayMongo to live.

## The admin page

Go to `/admin` on the site (for example `https://<your-domain>/admin`) and sign in with the shop password. It is not linked from the site and search engines are told to skip it. Works on a phone.

**Products**
- *Add a thrift piece* for each piece you want to sell online: photo, name, size and measurements, condition and any flaw, price. Stock starts at 1. When it sells offline, open it and tap *Mark as sold*.
- Drinks and shirts start from the current menu. Set a price to make an item orderable; an empty price shows "Price at opening".
- *Options* are the choices a customer picks: hot or iced, add-ons, colour, size. Each choice can add to the price (for example Iced +₱20, Oat milk +₱30).
- Untick *Show on the site* to take something off for now; *Delete* removes it for good.

**Settings**
- *Taking orders*: turn coffee, shirts and thrift on separately. Keep coffee off until opening day.
- *Delivery*: the shop's location (from Google Maps: long-press the shop, copy the two numbers), how far you deliver, and the fee: a base fee for the first few km, then an amount per km. The table under the fields shows what customers will pay.

Changes reach the website within a minute.

## Setup (one time)

Already done: the Neon database (`kuha-ko-db`) and Blob photo store (`kuha-ko-photos`) are connected to the Vercel project, and the tables and starting products are in the database.

Still to do, by someone on the Vercel team (`vercel` CLI, from the repo root):

```sh
vercel env add ADMIN_PASSWORD production       # the shop password: 12+ characters, a phrase is fine
vercel env add ADMIN_PASSWORD preview
openssl rand -base64 48 | vercel env add ADMIN_SESSION_SECRET production
openssl rand -base64 48 | vercel env add ADMIN_SESSION_SECRET preview
```

Then redeploy. Changing `ADMIN_SESSION_SECRET` later signs everyone out; changing the password doesn't.

## For developers

- Local, with the API: `vercel env pull` (repo root), then `vercel dev`. `npm run dev` runs the site alone, showing the built-in menu.
- Schema changes: add `apps/web/db/migrations/NNN_name.sql`, then `npm run db:migrate --workspace @kuhako/web`. Each file runs once, in one transaction.
- The database is in AWS us-east-1 and the functions run in `iad1` next to it (`apps/web/vercel.json`).
