# Online orders

Customers will order coffee, Kuha Ko shirts and selected thrift pieces on the website, for delivery within the Iloilo City area, and pay straight to Kuha Ko by scanning the shop's GCash QR or Maya QR Ph code (which Maya, GCash, GoTyme, MariBank and any bank app can pay). There is no payment gateway: the shop confirms each payment by hand in the admin.

It is being built in three steps:

1. **Catalog and admin** (done): products, prices and stock live in a database, edited at `/admin`.
2. **Cart, checkout and payments** (done): cart, address with distance-based delivery fee, payment to the shop's GCash or QR Ph, order page, the admin's Orders screen, order emails.
3. **Going live**: policy pages, real prices and photos, the shop's real location and payment details.

## The admin page

Go to `/admin` on the site (for example `https://<your-domain>/admin`) and sign in with the shop password. It is not linked from the site and search engines are told to skip it. Works on a phone.

**Orders** (opens first)
- *Payments to check* are at the top: the customer says they've paid and gives the reference number from their receipt. Find that amount and reference in your GCash or Maya Business app, then tap **Mark as paid** (the customer gets a receipt email if they gave one). Can't find it? **Payment not found** cancels the order and puts the items back on sale.
- Then move each paid order along: **Preparing**, **Out for delivery**, **Delivered**. The customer's order page follows along.
- Each order has the customer's number (tap to call) and a link to their pin in Google Maps for the rider.
- *Cancel order* on a paid order: refund the customer yourself in GCash or Maya Business.

**Products**
- *Add a thrift piece* for each piece you want to sell online: photo, name, size and measurements, condition and any flaw, price. Stock starts at 1. When it sells offline, open it and tap *Mark as sold*.
- Drinks and shirts start from the current menu. Set a price to make an item orderable; an empty price shows "Price at opening".
- *Options* are the choices a customer picks: hot or iced, add-ons, colour, size. Each choice can add to the price (for example Iced +₱20, Oat milk +₱30).
- Untick *Show on the site* to take something off for now; *Delete* removes it for good.

**Settings**
- *Payment*: your GCash QR (in GCash, tap Receive and save or screenshot it) and your Maya QR Ph code (screenshot your receive-payment QR from the Maya Business app; Maya Business Starter is enough). Upload each one. Customers only see the ways to pay you've set up; with none, nothing can be ordered.
- *Taking orders*: turn coffee, shirts and thrift on separately. Keep coffee off until opening day.
- *Delivery*: the shop's location (from Google Maps: long-press the shop, copy the two numbers), how far you deliver, and the fee: a base fee for the first few km, then an amount per km. The table under the fields shows what customers will pay.

Changes reach the website within a minute.

## How an order works

1. The customer taps a drink, shirt or thrift piece (only items with a price, of a kind that's taking orders, show as orderable), picks options, and adds it to their order.
2. At checkout they give their name and mobile number, search for their place, and drag the pin to their door. The delivery fee is worked out from the road distance from the shop; places outside the delivery area are refused.
3. They choose GCash or “Maya or any bank app” (QR Ph) and place the order. Their order page (`/order/…`) shows the exact amount and the QR code for the way they chose.
4. They pay in their app, then type the **reference number** from the receipt and tap *I've paid*. The shop gets an email: "Check payment".
5. Their items are **held for 30 minutes** until they send the reference, so nobody else can buy the same thrift piece. No reference in time: the order expires and the items go back on sale. Once a reference is sent, the items stay held until you confirm or reject it.
6. You confirm it under *Orders*, then move it along to delivered. The order page shows each step.

Customers can also **sign in** at `/account` (linked as *Sign in* in the site menu, at checkout, and on the app's Visit tab). It's optional: guest checkout works as before. Signed-in customers get their name, phone, email and delivery spot filled in at checkout (saved again each time they order, or edited on `/account`), and see all their orders there. These orders are marked as theirs in the database (`orders.customer_id`); the Orders tab in the admin works the same either way.

If someone pays but the order already expired, they're told to message you with the reference: check it, and refund or re-create the order by hand.

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

### Payments

Nothing to sign up for: upload your GCash QR and your Maya QR Ph code in `/admin` → Settings → Payment.

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

### Customer accounts: Clerk

Connected through the Vercel Marketplace as `kuha-ko-auth` (`CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`). Clerk shows the sign-in form and sends the sign-in emails itself, so it works before kuha-ko.com is set up. Without these keys the *Sign in* links are hidden and everyone checks out as a guest.

Open the Clerk dashboard from the Vercel integration page to choose how people sign in (email code, Google, Facebook) and to see who has signed up. It starts as a **development** instance: fine for testing (it shows a "Development mode" badge, and test emails like `ana+clerk_test@example.com` take the code `424242`), but before launch switch it to a **production** instance, which needs the site's own domain.

## For developers

- Local, with the API: `vercel env pull` (repo root), then `vercel dev`. `npm run dev` runs the site alone, showing the built-in menu.
- Schema changes: add `apps/web/db/migrations/NNN_name.sql`, then `npm run db:migrate --workspace @kuhako/web`. Each file runs once, in one transaction.
- Accounts: `src/account/` (`/account` signs in, `/account/sign-up` signs up: separate pages so Clerk’s links between steps always land on a real one; `auth.tsx` wraps Clerk so the rest of the site uses `useAccount()`), `api/account.ts`, `server/customers.ts`. The browser sends the Clerk session token as `Authorization: Bearer …`; a missing or bad token at checkout just means a guest order.
- Order logic: `server/orders.ts`. Stock holds use the SQL functions `reserve_stock` and `release_order` (`db/migrations/002_orders.sql`), so two buyers can't get the same piece and stock is never returned twice.
- The database is in AWS us-east-1 and the functions run in `iad1` next to it (`apps/web/vercel.json`).

Automatic card and Maya wallet payments (Maya Checkout, confirmed by webhook) need Maya Checkout API keys, which a Starter account doesn't have; add them once the account is upgraded.
