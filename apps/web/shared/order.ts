// Pricing a cart line, shared by the cart (to show totals) and the server (to
// charge). The server always re-prices from the database; the browser's numbers
// are only for display.
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
  /** While waiting for payment: where to pay, and until when the items are held. */
  checkoutUrl: string | null;
  holdExpiresAt: string | null;
}
