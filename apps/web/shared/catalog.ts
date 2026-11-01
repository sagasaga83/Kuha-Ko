// The product catalog, shared by the site, the API and the admin page.
// Money is always whole centavos (₱120 = 12000), never floats.
// Validation schemas live in ./schema.ts, so the customer bundle doesn't carry zod.
import type { OrderingSettings, PaymentSettings, Product, Settings } from './schema';
import type { PaymentMethod } from './order';
export type { DeliverySettings, OptionGroup, OrderingSettings, PaymentSettings, Product, ProductInput, Settings } from './schema';

export const KINDS = ['coffee', 'shirt', 'thrift'] as const;
export type Kind = (typeof KINDS)[number];

export const KIND_LABELS: Record<Kind, string> = {
  coffee: 'Coffee',
  shirt: 'Shirts',
  thrift: 'Thrift pieces',
};

export const DEFAULT_SETTINGS: Settings = {
  delivery: { origin: null, radiusKm: 8, baseFee: 4900, baseKm: 3, perKm: 1000 },
  ordering: { coffee: false, shirt: false, thrift: false },
  payment: { gcashQrUrl: null, qrUrl: null },
};

/** What GET /api/catalog returns. */
export interface Catalog {
  products: Product[];
  ordering: OrderingSettings;
  /** True once the shop's location is set, so delivery fees can be worked out. */
  deliveryReady: boolean;
  /** Ways customers can pay right now: each one once its QR code is uploaded. */
  paymentMethods: PaymentMethod[];
}

export function availablePaymentMethods(p: PaymentSettings): PaymentMethod[] {
  const out: PaymentMethod[] = [];
  if (p.gcashQrUrl) out.push('gcash');
  if (p.qrUrl) out.push('qrph');
  return out;
}

/** ₱120, ₱1,250, ₱99.50 */
export function formatPeso(amount: number): string {
  const pesos = amount / 100;
  return `₱${pesos.toLocaleString('en-PH', {
    minimumFractionDigits: Number.isInteger(pesos) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** "₱120" or "120.50" typed in a form → centavos. Returns null for empty, NaN for junk. */
export function parsePeso(text: string): number | null {
  const clean = text.replace(/[₱,\s]/g, '');
  if (clean === '') return null;
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return Number.NaN;
  return Math.round(Number(clean) * 100);
}

/** A URL-safe id from a name: "The Kuha" → "the-kuha". */
export function slugify(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Can this product go in a cart right now? */
export function isOrderable(p: Product, ordering: OrderingSettings): boolean {
  return p.active && p.price !== null && ordering[p.kind] && (p.stock === null || p.stock > 0);
}
