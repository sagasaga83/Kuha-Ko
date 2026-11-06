# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three groups, served equally (confirmed: no single priority before opening):

- **Live-selling buyers.** People in and around Iloilo City who follow the Kuha Ko Thrift lives on Facebook (from November 2026), check a piece's number, size and flaws, claim it by commenting KUHA KO! and the item number, and order thrift pieces or Kuha Ko shirts on the site.
- **Future regulars.** Locals getting to know the shop before it opens on June 22, 2027: reading the menu and the story behind the name, finding out when the next live is, and signing up to hear about it.
- **Coffee orderers.** Customers ordering drinks for delivery within the Iloilo City area. Coffee ordering stays switched off until opening day.

Behind the counter: the owner (Kuha Ko Coffee) and the partner (Kuha Ko Thrift) run the shop from the admin page at `/admin`, on their phones: confirming payments, moving orders along, adding thrift pieces.

## Product Purpose

The website for Kuha Ko, a coffee bar and a thrift boutique under one roof in Iloilo City, Philippines. Before opening it builds the shop's following and sells online; after opening it is also where people order drinks for delivery.

It does the work of: showing the menu and the racks, explaining the name, announcing live selling, taking orders for coffee, shirts and thrift pieces, and giving each customer an order page that follows their order from payment to delivery.

Success: buyers can find, claim and pay for a piece without confusion; locals know what Kuha Ko is and when it opens; orders reach the shop with the payment reference attached so the shop can confirm them quickly.

## Positioning

Confirmed:

- Coffee and pre-loved clothes under one roof: you browse the racks with a cup in hand.
- The drinks are named after the racks (The Kuha, Thrift-y Americano, Pre-Loved Cappuccino, Marked-Down Macchiato…).
- Honest tags: every pre-loved piece shows its size and measurements, and any flaw is shown in a close-up photo before anyone asks.
- Live selling where the first KUHA KO! comment gets the piece.
- The name itself: Hiligaynon *kuha* (take, get; also a photo you take) and *ko* (I, my). "Kuha ko" is what you say when you find the right piece or order your usual: "I'll take it."

## Operating Context

- Most visitors arrive on phones, many from Facebook. On phones and from the home screen the site switches to an iOS-style tab layout; it installs as a web app (there are no store apps).
- Live selling happens on the Kuha Ko Thrift Facebook page; the website supports it with item details, the schedule and online ordering.
- Payment is manual: customers scan the shop's GCash QR or Maya QR Ph code in their own app, then send the reference number. The shop checks it in GCash or Maya Business and marks the order paid in the admin. There is no payment gateway.
- Delivery only within the Iloilo City area, priced by road distance from the shop. Thrift pieces are held for 30 minutes while the customer pays.
- Optional customer accounts (saved checkout details, order history); guests can order without one.

## Capabilities and Constraints

- Pages: home, menu, thrift, live selling, about; cart and checkout in a sheet; order page at `/order/:id`; account at `/account`; admin at `/admin`.
- Products and prices come from the shop's database and are edited in the admin. An item with no price shows "Price at opening" and can't be ordered.
- Money is in whole pesos (₱150, no decimals for whole amounts).
- Undecided, shown as "coming soon" and never to be invented: prices, the shop's address, opening hours, the Facebook and Instagram links, and the live-selling dates. The @kuhako handle has not been checked for availability.
- Terms to use as written: KUHA KO! (the claim), Kuha of the Week, #KuhaKoFinds, The Kuha (the house latte), Kuha Ko Coffee, Kuha Ko Thrift.

## Brand Commitments

Binding, and recorded in full in `docs/brand-guidelines.md` (read it before changing copy or visuals); the rules that apply in code are summarised in the repository's `CLAUDE.md`.

- Name: **Kúha Ko** with the acute accent only in logo artwork; **Kuha Ko** everywhere else. Never Kuha ko, KuhaKo, Kuhà or Kuhá.
- Two sub-brands, each with its own accent: Kuha Ko Coffee and Kuha Ko Thrift. Use the sub-brand only where the two need telling apart.
- Voice: a friend behind the counter. Warm (write to "you"), local (English first, Hiligaynon or Taglish where it comes naturally), a little playful (one pun per post at most), and honest about what you're buying.
- Taglines: "Kape ko. Kuha ko." (main), "Something to sip, something to keep." (English), "Kuha na!" (call to grab a piece).
- No exclamation marks except in KUHA KO! and Kuha na!. No emoji on the site.
- Pronunciation line, shown on the menu footer and the About page: KOO-ha ko, /ˈku.haʔ ko/.

## Evidence on Hand

- Real: the five Kuha Ko shirt designs (`public/photos/shirts/`), the menu (drink names and descriptions in the database, seeded from `src/data/menu.ts`), the brand guidelines, the logo, stamp and hang-tag artwork in `packages/ui`.
- Temporary stand-ins, to be replaced before opening: the coffee photos (free Unsplash photos) and the rack pieces (free Pexels photos cut out). Each is marked with `stockSource` in `src/data/photos.ts`. The brand forbids stock and AI-made images of things the shop sells, so new work must not add more.
- Not yet existing, never to be fabricated: photos of the real shop, the owner and the partner (placeholders describe the shots wanted), customer reviews or testimonials, press, sales figures, prices, the address and hours.

## Product Principles

1. **Honest first.** Show what a piece really is (size, measurements, flaws) and what something really costs. Never claim what isn't decided yet.
2. **One roof, two shops.** Coffee and thrift belong together; tell them apart only where a customer needs to.
3. **The claim is the moment.** Finding the piece and saying "Kuha ko" is the heart of the shop; ordering and claiming should feel that quick.
4. **Local and personal.** Speak like the people who run the shop, to people in Iloilo, on the phones they actually use.
5. **Manual where it builds trust.** Payments are confirmed by a person; keep each step clear enough that nobody wonders whether their order went through.

## Accessibility & Inclusion

Text keeps 4.5:1 contrast in both the light and dark themes (a test in `packages/tokens` checks the main pairs). Visible keyboard focus everywhere. Motion is reduced under `prefers-reduced-motion`.
