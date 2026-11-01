// Pricing a cart line, shared by the cart (to show totals) and the server (to
// charge). The server always re-prices from the database; the browser's numbers
// are only for display. Also: payment options, order statuses, the order view.
import type { Product } from './catalog';

/** One line in the cart: a product, how many, and the chosen option values per group. */
export interface CartLine {
  productId: string;
  quantity: number;
  /** groupId → chosen value ids. Pick-one groups have exactly one. */
  choices: Record<string, string[]>;
}

export interface PricedLine {
  unitPrice: number;
  /** What was picked, for receipts: [{ group: 'Size', value: 'M' }] */
  labels: { group: string; value: string }[];
}

/**
 * Ways to pay, in the order shown at checkout. Customers pay Kuha Ko directly,
 * then send the reference number; the shop confirms it in the admin.
 */
export const PAYMENT_OPTIONS = [
  { id: 'gcash', label: 'GCash', note: 'Scan our GCash QR in the GCash app' },
  { id: 'qrph', label: 'Maya or any bank app', note: 'Scan our QR Ph code with Maya, GCash, GoTyme, MariBank or any bank app' },
] as const;
export type PaymentMethod = (typeof PAYMENT_OPTIONS)[number]['id'];
export const PAYMENT_METHOD_IDS = PAYMENT_OPTIONS.map((o) => o.id) as [PaymentMethod, ...PaymentMethod[]];

export const MAX_QUANTITY = 20;
export const MAX_LINES = 30;

/** Prices a line, or returns why it can't be ordered as chosen. */
export function priceLine(product: Product, choices: CartLine['choices']): PricedLine | { error: string } {
  if (product.price === null) return { error: `${product.name} doesn’t have a price yet.` };
  let unitPrice = product.price;
  const labels: PricedLine['labels'] = [];
  for (const [groupId] of Object.entries(choices)) {
    if (!product.options.some((g) => g.id === groupId)) return { error: `${product.name}: that option is no longer available.` };
  }
  for (const group of product.options) {
    const picked = [...new Set(choices[group.id] ?? [])];
    if (!group.multi && picked.length !== 1) return { error: `${product.name}: choose a ${group.label.toLowerCase()}.` };
    for (const id of picked) {
      const value = group.values.find((v) => v.id === id);
      if (!value) return { error: `${product.name}: that ${group.label.toLowerCase()} is no longer available.` };
      unitPrice += value.delta;
      labels.push({ group: group.label, value: value.label });
    }
  }
  return { unitPrice, labels };
}

/** Pick-one groups start on their first choice; pick-any groups start empty. */
export function defaultChoices(product: Product): CartLine['choices'] {
  return Object.fromEntries(product.options.map((g) => [g.id, g.multi ? [] : [g.values[0].id]]));
}

/** Same product with the same choices → same cart line (quantities add up). */
export function lineKey(line: Pick<CartLine, 'productId' | 'choices'>): string {
  const parts = Object.keys(line.choices)
    .sort()
    .map((g) => `${g}=${[...line.choices[g]].sort().join('+')}`);
  return `${line.productId}|${parts.join('|')}`;
}

/** Philippine mobile number → +639XXXXXXXXX, or null if it isn't one. */
export function normalizePhone(text: string): string | null {
  const digits = text.replace(/[\s\-().]/g, '');
  const m = digits.match(/^(?:\+?63|0)?(9\d{9})$/);
  return m ? `+63${m[1]}` : null;
}

export const ORDER_STATUS_LABELS = {
  pending_payment: 'Waiting for payment',
  awaiting_confirmation: 'Checking your payment',
  paid: 'Paid',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  expired: 'Not paid in time',
} as const;
export type OrderStatus = keyof typeof ORDER_STATUS_LABELS;

/** What GET /api/order returns to the customer. */
export interface OrderView {
  id: string;
  code: string;
  status: OrderStatus;
  createdAt: string;
  paidAt: string | null;
  customerName: string;
  address: string;
  addressNotes: string;
  items: { name: string; choices: PricedLine['labels']; quantity: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  /** The reference number the customer sent, once they have. */
  paymentReference: string | null;
  /** While waiting for payment: where to send it, and until when the items are held. */
  payTo: PayTo | null;
  holdExpiresAt: string | null;
}

/** Where to send the money, shown on the order page while it's unpaid. */
export interface PayTo {
  gcashQrUrl: string | null;
  qrUrl: string | null;
}

/** GCash and bank reference numbers: letters and digits, spaces and dashes ignored. */
export function normalizeReference(text: string): string | null {
  const clean = text.replace(/[\s-]/g, '').toUpperCase();
  return /^[A-Z0-9]{6,30}$/.test(clean) ? clean : null;
}
