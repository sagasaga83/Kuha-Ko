// Orders: quote → checkout (hold stock, PayMongo session) → paid (webhook or sync)
// → delivered. Unpaid orders hold their stock for HOLD_MINUTES, then are expired
// and the stock goes back on sale.
import { randomInt } from 'node:crypto';
import { db } from './db.js';
import { HttpError } from './http.js';
import { getSettings, rowToProduct } from './catalog.js';
import { roadDistance, type LatLng } from './distance.js';
import { sendOrderEmails } from './email.js';
import { createCheckoutSession, expireCheckoutSession, getCheckoutSession, PayMongoError, type CheckoutSession } from './paymongo.js';
import { formatPeso, isOrderable, type DeliverySettings } from '../shared/catalog.js';
import { deliveryFee } from '../shared/delivery.js';
import { normalizePhone, priceLine, type OrderStatus, type OrderView, type PricedLine } from '../shared/order.js';
import type { CheckoutRequest } from '../shared/schema.js';

export const HOLD_MINUTES = 30;

type Row = Record<string, unknown>;

export interface Quote {
  distanceM: number;
  fee: number;
  /** True when the distance is a straight-line estimate (no Routes API key). */
  estimated: boolean;
}

async function deliverySettings(): Promise<DeliverySettings & { origin: LatLng }> {
  const { delivery } = await getSettings();
  if (!delivery.origin) throw new HttpError(503, 'Delivery isn’t available yet. Check back soon.');
  return { ...delivery, origin: delivery.origin };
}

export async function quote(dest: LatLng): Promise<Quote> {
  const d = await deliverySettings();
  const dist = await roadDistance(d.origin, dest, d.radiusKm);
  if (!dist) throw new HttpError(422, 'We couldn’t find a road route to that spot. Try moving the pin.', { reason: 'no_route' });
  const fee = deliveryFee(dist.meters, d);
  if (fee === null) {
    throw new HttpError(422, `Sorry, that’s outside our delivery area: we deliver within ${d.radiusKm} km of the shop for now.`, {
      reason: 'outside_area',
      distanceM: dist.meters,
    });
  }
  return { distanceM: dist.meters, fee, estimated: dist.estimated };
}

/** KK-7QF3M: short enough to read out over the phone, no 0/O or 1/I. */
function newCode(): string {
  const abc = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  return `KK-${Array.from({ length: 5 }, () => abc[randomInt(abc.length)]).join('')}`;
}

export async function createOrder(req: CheckoutRequest, siteUrl: string): Promise<{ orderId: string; checkoutUrl: string }> {
  const sql = db();
  await releaseExpired();
  const settings = await getSettings();

  const phone = normalizePhone(req.customer.phone);
  if (!phone) throw new HttpError(400, 'Check your mobile number: it should look like 0917 123 4567.');

  // Price everything from the database, never from the browser.
  const ids = [...new Set(req.items.map((i) => i.productId))];
  const products = new Map((await sql`SELECT * FROM products WHERE id = ANY(${ids})`).map((r) => [r.id as string, rowToProduct(r)]));
  const lines: (PricedLine & { productId: string; name: string; quantity: number })[] = [];
  for (const item of req.items) {
    const p = products.get(item.productId);
    if (p && p.active && p.stock === 0) {
      throw new HttpError(409, `Sorry, ${p.name} was just taken by someone else. Please remove it from your cart.`, { productId: p.id });
    }
    if (!p || !isOrderable(p, settings.ordering)) {
      throw new HttpError(409, `${p?.name ?? 'An item in your cart'} can’t be ordered right now. Please remove it and try again.`, {
        productId: item.productId,
      });
    }
    const priced = priceLine(p, item.choices);
    if ('error' in priced) throw new HttpError(409, priced.error, { productId: item.productId });
    lines.push({ ...priced, productId: p.id, name: p.name, quantity: item.quantity });
  }
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const q = await quote({ lat: req.address.lat, lng: req.address.lng });
  const total = subtotal + q.fee;

  // Create the order and hold its stock in one transaction.
  let orderId = '';
  let code = '';
  for (let attempt = 0; attempt < 5 && !orderId; attempt++) {
    code = newCode();
    const id = crypto.randomUUID();
    try {
      await sql.transaction([
        sql`INSERT INTO orders (id, code, customer_name, customer_phone, customer_email, address, address_lat, address_lng, address_notes,
                                distance_m, subtotal, delivery_fee, total, hold_expires_at)
            VALUES (${id}, ${code}, ${req.customer.name}, ${phone}, ${req.customer.email || null}, ${req.address.text},
                    ${req.address.lat}, ${req.address.lng}, ${req.address.notes}, ${q.distanceM}, ${subtotal}, ${q.fee}, ${total},
                    now() + make_interval(mins => ${HOLD_MINUTES}))`,
        ...lines.map(
          (l) => sql`INSERT INTO order_items (order_id, product_id, name, choices, unit_price, quantity, line_total)
                     VALUES (${id}, ${l.productId}, ${l.name}, ${JSON.stringify(l.labels)}::jsonb, ${l.unitPrice}, ${l.quantity}, ${l.unitPrice * l.quantity})`,
        ),
        sql`SELECT reserve_stock(${id})`,
      ]);
      orderId = id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      const taken = msg.match(/out_of_stock:([a-z0-9-]+)/);
      if (taken) {
        const name = products.get(taken[1])?.name ?? 'An item';
        throw new HttpError(409, `Sorry, ${name} was just taken by someone else. Please remove it from your cart.`, { productId: taken[1] });
      }
      if (!/orders_code_key/.test(msg)) throw err; // a code clash: try another code
    }
  }
  if (!orderId) throw new HttpError(500, 'Could not create the order. Please try again.');

  let session: CheckoutSession;
  try {
    session = await createCheckoutSession({
      orderId,
      code,
      lines: [
        ...lines.map((l) => ({
          name: l.name,
          amount: l.unitPrice,
          quantity: l.quantity,
          description: l.labels.map((x) => x.value).join(', ') || undefined,
        })),
        { name: 'Delivery', amount: q.fee, quantity: 1, description: `${(q.distanceM / 1000).toFixed(1)} km` },
      ],
      customer: { name: req.customer.name, phone, email: req.customer.email || null },
      successUrl: `${siteUrl}/order/${orderId}`,
      cancelUrl: `${siteUrl}/order/${orderId}?payment=cancelled`,
    });
  } catch (err) {
    await sql`SELECT release_order(${orderId}, 'cancelled')`;
    if (err instanceof HttpError) throw err;
    console.error(err);
    throw new HttpError(502, 'We couldn’t open the payment page. Your cart is saved; please try again.');
  }
  await sql`UPDATE orders SET checkout_session_id = ${session.id}, checkout_url = ${session.checkoutUrl}, updated_at = now() WHERE id = ${orderId}`;
  return { orderId, checkoutUrl: session.checkoutUrl };
}

/** Records a payment. Safe to call more than once (webhook retries, page syncs). */
export async function markPaid(orderId: string, payment: NonNullable<CheckoutSession['paid']>, siteUrl: string): Promise<void> {
  const sql = db();
  const [order] = await sql`SELECT id, status, total FROM orders WHERE id = ${orderId}`;
  if (!order) {
    console.error(`payment ${payment.id} for unknown order ${orderId}`);
    return;
  }
  const notes: string[] = [];
  if (payment.amount !== order.total) {
    notes.push(`Paid ${formatPeso(payment.amount)} but the order total is ${formatPeso(order.total as number)}. Check in PayMongo.`);
  }

  let changed = false;
  if (order.status === 'pending_payment') {
    const rows = await sql`
      UPDATE orders SET status = 'paid', paid_at = now(), payment_id = ${payment.id}, payment_method = ${payment.method},
        hold_expires_at = NULL, attention = ${notes.join(' ') || null}, updated_at = now()
      WHERE id = ${orderId} AND status = 'pending_payment' RETURNING id`;
    changed = rows.length > 0;
  } else if (order.status === 'expired' || order.status === 'cancelled') {
    // Paid after the hold was released: take the stock again if it's still there.
    try {
      await sql.transaction([
        sql`UPDATE orders SET status = 'paid', paid_at = now(), payment_id = ${payment.id}, payment_method = ${payment.method},
              attention = ${[...notes, 'Paid after the 30-minute hold ran out; the items were still available.'].join(' ')}, updated_at = now()
            WHERE id = ${orderId} AND status IN ('expired', 'cancelled')`,
        sql`SELECT reserve_stock(${orderId})`,
      ]);
    } catch {
      await sql`
        UPDATE orders SET status = 'paid', paid_at = now(), payment_id = ${payment.id}, payment_method = ${payment.method},
          attention = ${[...notes, 'Paid after the hold ran out, and an item had already sold. Contact the customer and refund in PayMongo.'].join(' ')},
          updated_at = now()
        WHERE id = ${orderId} AND status IN ('expired', 'cancelled')`;
    }
    changed = true;
  }

  if (changed) {
    const view = await getOrderView(orderId, { sync: false });
    const [c] = await sql`SELECT customer_phone, customer_email FROM orders WHERE id = ${orderId}`;
    if (view) await sendOrderEmails(view, { phone: c.customer_phone as string, email: (c.customer_email as string | null) ?? null }, siteUrl);
  }
}

/** Checks PayMongo directly, in case the webhook is late or not set up. */
async function syncPayment(orderId: string, sessionId: string, siteUrl: string): Promise<void> {
  try {
    const s = await getCheckoutSession(sessionId);
    if (s.paid) await markPaid(orderId, s.paid, siteUrl);
  } catch (err) {
    console.error('sync payment', err);
  }
}

/** Expires unpaid orders past their hold and puts their stock back. */
export async function releaseExpired(): Promise<void> {
  const sql = db();
  const due = await sql`
    SELECT id, checkout_session_id FROM orders
    WHERE status = 'pending_payment' AND hold_expires_at < now()
    ORDER BY hold_expires_at LIMIT 20`;
  for (const o of due) {
    try {
      const sessionId = o.checkout_session_id as string | null;
      if (sessionId && !(await expireCheckoutSession(sessionId))) continue; // paid or paying: leave it for the webhook
      await sql`SELECT release_order(${o.id as string}, 'expired')`;
    } catch (err) {
      console.error('release expired order', o.id, err);
    }
  }
}

/** The customer cancels an unpaid order from the order page. */
export async function cancelOrder(orderId: string): Promise<void> {
  const sql = db();
  const [o] = await sql`SELECT status, checkout_session_id FROM orders WHERE id = ${orderId}`;
  if (!o) throw new HttpError(404, 'We can’t find that order.');
  if (o.status !== 'pending_payment') throw new HttpError(409, 'This order can’t be cancelled here. Please message us.');
  if (o.checkout_session_id) {
    let ok = false;
    try {
      ok = await expireCheckoutSession(o.checkout_session_id as string);
    } catch (err) {
      if (!(err instanceof PayMongoError)) throw err;
    }
    if (!ok) throw new HttpError(409, 'A payment for this order is going through, so it can’t be cancelled. Please message us.');
  }
  await sql`SELECT release_order(${orderId}, 'cancelled')`;
}

export async function getOrderView(orderId: string, opts: { sync: boolean; siteUrl?: string }): Promise<OrderView | null> {
  const sql = db();
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return null;
  let [o] = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
  if (!o) return null;
  if (opts.sync && o.status === 'pending_payment' && o.checkout_session_id && opts.siteUrl) {
    await syncPayment(orderId, o.checkout_session_id as string, opts.siteUrl);
    if (new Date(o.hold_expires_at as string) < new Date()) await releaseExpired();
    [o] = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
  }
  const items = await sql`SELECT * FROM order_items WHERE order_id = ${orderId} ORDER BY id`;
  return toView(o, items);
}

export function toView(o: Row, items: Row[]): OrderView {
  const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
  const pending = o.status === 'pending_payment';
  return {
    id: o.id as string,
    code: o.code as string,
    status: o.status as OrderStatus,
    createdAt: iso(o.created_at) as string,
    paidAt: iso(o.paid_at),
    customerName: o.customer_name as string,
    address: o.address as string,
    addressNotes: o.address_notes as string,
    items: items.map((i) => ({
      name: i.name as string,
      choices: i.choices as OrderView['items'][number]['choices'],
      quantity: i.quantity as number,
      unitPrice: i.unit_price as number,
      lineTotal: i.line_total as number,
    })),
    subtotal: o.subtotal as number,
    deliveryFee: o.delivery_fee as number,
    total: o.total as number,
    checkoutUrl: pending ? ((o.checkout_url as string | null) ?? null) : null,
    holdExpiresAt: pending ? iso(o.hold_expires_at) : null,
  };
}
