// Orders, paid straight to Kuha Ko's GCash or QR Ph:
//   checkout → pending_payment (stock held HOLD_MINUTES; the order page shows where to pay)
//   customer sends the reference → awaiting_confirmation (stock stays held)
//   shop confirms in the admin → paid → preparing → out_for_delivery → delivered
//   shop can't find the payment → cancelled, stock back on sale
// Unpaid orders past their hold expire and their stock goes back on sale.
import { randomInt } from 'node:crypto';
import { db } from './db.js';
import { HttpError } from './http.js';
import { getSettings, rowToProduct } from './catalog.js';
import { roadDistance, type LatLng } from './distance.js';
import { sendPaymentToCheck, sendReceipt } from './email.js';
import { availablePaymentMethods, isOrderable, type DeliverySettings } from '../shared/catalog.js';
import { deliveryFee } from '../shared/delivery.js';
import {
  ORDER_STATUS_LABELS,
  normalizePhone,
  normalizeReference,
  priceLine,
  type OrderStatus,
  type OrderView,
  type PaymentMethod,
  type PricedLine,
} from '../shared/order.js';
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

/** Places an order and holds its stock. The customer then pays on the order page. */
export async function createOrder(req: CheckoutRequest): Promise<{ orderId: string }> {
  const sql = db();
  await releaseExpired();
  const settings = await getSettings();

  if (!availablePaymentMethods(settings.payment).includes(req.paymentMethod)) {
    throw new HttpError(409, 'That way to pay isn’t available right now. Please choose another.');
  }
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
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode();
    const id = crypto.randomUUID();
    try {
      await sql.transaction([
        sql`INSERT INTO orders (id, code, customer_name, customer_phone, customer_email, address, address_lat, address_lng, address_notes,
                                distance_m, subtotal, delivery_fee, total, payment_method, hold_expires_at)
            VALUES (${id}, ${code}, ${req.customer.name}, ${phone}, ${req.customer.email || null}, ${req.address.text},
                    ${req.address.lat}, ${req.address.lng}, ${req.address.notes}, ${q.distanceM}, ${subtotal}, ${q.fee}, ${total},
                    ${req.paymentMethod}, now() + make_interval(mins => ${HOLD_MINUTES}))`,
        ...lines.map(
          (l) => sql`INSERT INTO order_items (order_id, product_id, name, choices, unit_price, quantity, line_total)
                     VALUES (${id}, ${l.productId}, ${l.name}, ${JSON.stringify(l.labels)}::jsonb, ${l.unitPrice}, ${l.quantity}, ${l.unitPrice * l.quantity})`,
        ),
        sql`SELECT reserve_stock(${id})`,
      ]);
      return { orderId: id };
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
  throw new HttpError(500, 'Could not create the order. Please try again.');
}

/** The customer has paid and sends the reference number from their GCash or bank receipt. */
export async function submitReference(orderId: string, reference: string, siteUrl: string): Promise<void> {
  const ref = normalizeReference(reference);
  if (!ref) throw new HttpError(400, 'Check the reference number: it’s the letters and numbers on your payment receipt.');
  await releaseExpired();
  const sql = db();
  const rows = await sql`
    UPDATE orders SET status = 'awaiting_confirmation', payment_reference = ${ref}, reference_at = now(),
      hold_expires_at = NULL, updated_at = now()
    WHERE id = ${orderId} AND status = 'pending_payment'
    RETURNING id`;
  if (!rows[0]) {
    const [o] = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (!o) throw new HttpError(404, 'We can’t find that order.');
    if (o.status === 'expired') {
      throw new HttpError(409, 'This order wasn’t paid within 30 minutes, so the items went back on sale. If you already paid, message us with your reference number.');
    }
    throw new HttpError(409, 'We already have the payment details for this order.');
  }
  const view = await getOrderView(orderId);
  const [c] = await sql`SELECT customer_phone FROM orders WHERE id = ${orderId}`;
  if (view) await sendPaymentToCheck(view, c.customer_phone as string, siteUrl);
}

/** Expires unpaid orders past their hold and puts their stock back. */
export async function releaseExpired(): Promise<void> {
  const sql = db();
  const due = await sql`
    SELECT id FROM orders WHERE status = 'pending_payment' AND hold_expires_at < now()
    ORDER BY hold_expires_at LIMIT 50`;
  for (const o of due) await sql`SELECT release_order(${o.id as string}, 'expired')`;
}

/** The customer cancels before sending a payment reference. */
export async function cancelOrder(orderId: string): Promise<void> {
  const sql = db();
  const [o] = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
  if (!o) throw new HttpError(404, 'We can’t find that order.');
  if (o.status !== 'pending_payment') throw new HttpError(409, 'This order can’t be cancelled here. Please message us.');
  await sql`SELECT release_order(${orderId}, 'cancelled')`;
}

// ---- Admin -------------------------------------------------------------

export const ADMIN_ACTIONS = ['confirm', 'reject', 'preparing', 'out_for_delivery', 'delivered', 'cancel'] as const;
export type AdminAction = (typeof ADMIN_ACTIONS)[number];

/** Which statuses each action can move an order from. */
const FROM: Record<AdminAction, OrderStatus[]> = {
  confirm: ['awaiting_confirmation', 'pending_payment'],
  reject: ['awaiting_confirmation', 'pending_payment'],
  preparing: ['paid'],
  out_for_delivery: ['paid', 'preparing'],
  delivered: ['paid', 'preparing', 'out_for_delivery'],
  cancel: ['paid', 'preparing', 'out_for_delivery'],
};

export async function adminUpdateOrder(orderId: string, action: AdminAction, siteUrl: string): Promise<OrderView> {
  const sql = db();
  const [o] = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
  if (!o) throw new HttpError(404, 'That order no longer exists.');
  if (!FROM[action].includes(o.status as OrderStatus)) {
    throw new HttpError(409, `This order is “${ORDER_STATUS_LABELS[o.status as OrderStatus]}”, so it can’t be changed that way. Reload the orders.`);
  }
  if (action === 'reject') {
    // Payment not found: cancel and put the items back on sale.
    await sql`SELECT release_order(${orderId}, 'cancelled')`;
  } else if (action === 'confirm') {
    const rows = await sql`
      UPDATE orders SET status = 'paid', paid_at = now(), hold_expires_at = NULL, updated_at = now()
      WHERE id = ${orderId} AND status IN ('awaiting_confirmation', 'pending_payment') RETURNING id`;
    if (rows[0]) {
      const view = await getOrderView(orderId);
      const [c] = await sql`SELECT customer_email FROM orders WHERE id = ${orderId}`;
      if (view && c.customer_email) await sendReceipt(view, c.customer_email as string, siteUrl);
    }
  } else {
    // Delivery steps, or cancelling a paid order (refund by hand; stock is not put back
    // automatically because the item may already be packed or delivered).
    const next = action === 'cancel' ? 'cancelled' : action;
    await sql`UPDATE orders SET status = ${next}, updated_at = now() WHERE id = ${orderId} AND status = ANY(${FROM[action]})`;
  }
  const view = await getOrderView(orderId);
  if (!view) throw new HttpError(404, 'That order no longer exists.');
  return view;
}

export interface AdminOrder extends OrderView {
  customerPhone: string;
  customerEmail: string | null;
  distanceM: number;
  lat: number;
  lng: number;
  referenceAt: string | null;
}

/** Orders for the admin: the ones needing action first, then the latest. */
export async function listOrders(filter: 'open' | 'all'): Promise<AdminOrder[]> {
  await releaseExpired();
  const sql = db();
  const orders =
    filter === 'open'
      ? await sql`SELECT * FROM orders WHERE status IN ('pending_payment', 'awaiting_confirmation', 'paid', 'preparing', 'out_for_delivery')
                  ORDER BY CASE status WHEN 'awaiting_confirmation' THEN 0 WHEN 'paid' THEN 1 WHEN 'preparing' THEN 2
                                       WHEN 'out_for_delivery' THEN 3 ELSE 4 END, created_at DESC LIMIT 200`
      : await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`;
  if (orders.length === 0) return [];
  const items = await sql`SELECT * FROM order_items WHERE order_id = ANY(${orders.map((o) => o.id)}) ORDER BY id`;
  const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
  return orders.map((o) => ({
    ...toView(
      o,
      items.filter((i) => i.order_id === o.id),
      null,
    ),
    customerPhone: o.customer_phone as string,
    customerEmail: (o.customer_email as string | null) ?? null,
    distanceM: o.distance_m as number,
    lat: o.address_lat as number,
    lng: o.address_lng as number,
    referenceAt: iso(o.reference_at),
  }));
}

// ---- Views -------------------------------------------------------------

export async function getOrderView(orderId: string): Promise<OrderView | null> {
  const sql = db();
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return null;
  let [o] = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
  if (!o) return null;
  if (o.status === 'pending_payment' && new Date(o.hold_expires_at as string) < new Date()) {
    await releaseExpired();
    [o] = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
  }
  const items = await sql`SELECT * FROM order_items WHERE order_id = ${orderId} ORDER BY id`;
  const payTo = o.status === 'pending_payment' ? (await getSettings()).payment : null;
  return toView(o, items, payTo);
}

export function toView(o: Row, items: Row[], payTo: OrderView['payTo']): OrderView {
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
    paymentMethod: ((o.payment_method as string | null) ?? 'gcash') as PaymentMethod,
    paymentReference: (o.payment_reference as string | null) ?? null,
    payTo: pending && payTo ? { gcashName: payTo.gcashName, gcashNumber: payTo.gcashNumber, qrUrl: payTo.qrUrl } : null,
    holdExpiresAt: pending ? iso(o.hold_expires_at) : null,
  };
}
