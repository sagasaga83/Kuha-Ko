# Online orders

Customers will order coffee, Kuha Ko shirts and selected thrift pieces on the website, for delivery within the Iloilo City area, and pay with GCash, Maya or QR Ph (which GoTyme, MariBank and any bank app can pay).

It is being built in three steps:

1. **Catalog and admin** (done): products, prices and stock live in a database, edited at `/admin`.
2. **Cart, checkout and payments** (done, test mode until the accounts below are set up): cart, address with distance-based delivery fee, PayMongo payment, order page, order emails.
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

## How an order works

1. The customer taps a drink, shirt or thrift piece (only items with a price, of a kind that's taking orders, show as orderable), picks options, and adds it to their order.
2. At checkout they give their name and mobile number, search for their place, and drag the pin to their door. The delivery fee is worked out from the road distance from the shop; places outside the delivery area are refused.
3. They pay on PayMongo's page with GCash, Maya or QR Ph (GoTyme, MariBank and any bank app scan QR Ph).
4. Their items are **held for 30 minutes** while they pay, so nobody else can buy the same thrift piece. Not paid in time: the order expires and the items go back on sale.
5. Once paid, the shop gets an email (and the customer a receipt, if they gave an email), and the customer's order page (`/order/…`) shows the progress.

If a payment arrives after the 30 minutes and the piece has since sold, the order is marked paid with a note to refund it in the PayMongo dashboard.

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

### Payments: PayMongo

1. Sign up at [paymongo.com](https://www.paymongo.com). **Test keys work straight away**; live payments need the business documents (DTI or SEC registration, BIR) and PayMongo's review.
2. Developers → API keys: copy the **secret key** (`sk_test_…` for now).
   `vercel env add PAYMONGO_SECRET_KEY production` (and `preview`).
3. Developers → Webhooks → add: URL `https://<your-domain>/api/paymongo-webhook`, event **checkout_session.payment.paid**. Copy its secret (`whsk_…`).
   `vercel env add PAYMONGO_WEBHOOK_SECRET production` (and `preview`).
4. Going live later: swap in the `sk_live_…` key and a live-mode webhook secret, then redeploy. Nothing else changes.

Even without the webhook, the order page checks PayMongo directly, so a paid order still shows as paid; the webhook makes it instant and sends the emails even if the customer closes the page.

### Maps: Google Cloud

In a Google Cloud project with billing on (the monthly free allowance covers a small shop):
1. Enable **Maps JavaScript API**, **Places API (New)** and **Routes API**.
2. Create a **browser key** restricted to your site's domains and those first two APIs: `vercel env add VITE_GOOGLE_MAPS_KEY production` (and `preview`).
3. Create a **server key** restricted to the Routes API: `vercel env add GOOGLE_ROUTES_KEY production` (and `preview`).
4. Create a **Map ID** (JavaScript, vector) for the draggable pin: `vercel env add VITE_GOOGLE_MAP_ID production`. Without one, Google's demo map ID is used.

Without the browser key, checkout falls back to "Use my current location" plus a typed address. Without the server key, the fee uses the straight-line distance × 1.35 (shown to the customer as "estimated").

### Order emails: Resend

Connected through the Vercel Marketplace as `kuha-ko-email` (free plan, Tokyo region), sending from **send.kuha-ko.com**: emails come from `orders@send.kuha-ko.com` (`RESEND_API_KEY`, `RESEND_EMAIL_DOMAIN`; set `EMAIL_FROM` to override).

1. Verify the domain: add these records where kuha-ko.com's DNS is managed, then press Verify in the Resend dashboard (open it from the Vercel integration page). Names are relative to kuha-ko.com.

   | Type | Name | Value |
   |---|---|---|
   | TXT | `resend._domainkey.send` | the DKIM key shown in Resend (starts `p=MIGfMA0…`) |
   | CNAME | `rsend.send` | `rsend-apne1.forge.rmta.net` |
   | CNAME | `send.send` | `send.forge.rmta.net` |

2. `vercel env add SHOP_EMAIL production`: where new-order emails go.

Until the domain is verified, Resend refuses to send; orders still go through and the failure is only logged.

## For developers

- Local, with the API: `vercel env pull` (repo root), then `vercel dev`. `npm run dev` runs the site alone, showing the built-in menu.
- Schema changes: add `apps/web/db/migrations/NNN_name.sql`, then `npm run db:migrate --workspace @kuhako/web`. Each file runs once, in one transaction.
- Order logic: `server/orders.ts`. Stock holds use the SQL functions `reserve_stock` and `release_order` (`db/migrations/002_orders.sql`), so two buyers can't get the same piece and stock is never returned twice.
- The database is in AWS us-east-1 and the functions run in `iad1` next to it (`apps/web/vercel.json`).
