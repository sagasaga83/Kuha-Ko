// PayMongo Checkout Sessions (https://docs.paymongo.com/reference/create-a-checkout)
// and webhook signatures. Test keys (sk_test_…) take test payments only.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { HttpError } from './http.js';

const API = 'https://api.paymongo.com/v1';

/** The e-wallets and QR Ph (GoTyme, MariBank and any bank app pay QR Ph). */
export const PAYMENT_METHODS = ['gcash', 'paymaya', 'qrph'] as const;

function secretKey(): string {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key || !/^sk_(test|live)_/.test(key)) throw new HttpError(503, 'Online payment isn’t set up yet.');
  return key;
}

export const isLiveMode = () => secretKey().startsWith('sk_live_');

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      authorization: `Basic ${Buffer.from(`${secretKey()}:`).toString('base64')}`,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => null)) as { errors?: { detail?: string; code?: string }[] } | null;
  if (!res.ok) {
    const detail = body?.errors?.map((e) => e.detail ?? e.code).join('; ') || res.statusText;
    throw new PayMongoError(res.status, detail);
  }
  return body as T;
}

export class PayMongoError extends Error {
  constructor(
    readonly status: number,
    detail: string,
  ) {
    super(`PayMongo ${status}: ${detail}`);
  }
}

export interface CheckoutSession {
  id: string;
  checkoutUrl: string;
  status: 'active' | 'expired' | string;
  /** The successful payment, if there is one. */
  paid: { id: string; amount: number; method: string | null } | null;
}

interface SessionResource {
  data: {
    id: string;
    attributes: {
      checkout_url: string;
      status: string;
      payment_method_used?: string | null;
      payments?: { id: string; attributes: { amount: number; status: string; source?: { type?: string } | null } }[];
    };
  };
}

function toSession(r: SessionResource['data']): CheckoutSession {
  const paid = r.attributes.payments?.find((p) => p.attributes.status === 'paid');
  return {
    id: r.id,
    checkoutUrl: r.attributes.checkout_url,
    status: r.attributes.status,
    paid: paid
      ? { id: paid.id, amount: paid.attributes.amount, method: paid.attributes.source?.type ?? r.attributes.payment_method_used ?? null }
      : null,
  };
}

export async function createCheckoutSession(input: {
  orderId: string;
  code: string;
  lines: { name: string; amount: number; quantity: number; description?: string }[];
  customer: { name: string; phone: string; email: string | null };
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutSession> {
  const body = {
    data: {
      attributes: {
        line_items: input.lines.map((l) => ({
          name: l.name.slice(0, 255),
          amount: l.amount,
          currency: 'PHP',
          quantity: l.quantity,
          ...(l.description ? { description: l.description.slice(0, 255) } : {}),
        })),
        payment_method_types: PAYMENT_METHODS,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        reference_number: input.orderId,
        description: `Kuha Ko order ${input.code}`,
        send_email_receipt: Boolean(input.customer.email),
        show_line_items: true,
        show_description: true,
        billing: {
          name: input.customer.name,
          phone: input.customer.phone,
          ...(input.customer.email ? { email: input.customer.email } : {}),
        },
        metadata: { order_id: input.orderId, order_code: input.code },
      },
    },
  };
  const r = await call<SessionResource>('/checkout_sessions', { method: 'POST', body: JSON.stringify(body) });
  return toSession(r.data);
}

export async function getCheckoutSession(id: string): Promise<CheckoutSession> {
  const r = await call<SessionResource>(`/checkout_sessions/${encodeURIComponent(id)}`);
  return toSession(r.data);
}

/**
 * Stops a session taking payment. Returns false when PayMongo refuses because the
 * session is paid or a payment is in progress (then the order must not be released).
 */
export async function expireCheckoutSession(id: string): Promise<boolean> {
  try {
    await call(`/checkout_sessions/${encodeURIComponent(id)}/expire`, { method: 'POST' });
    return true;
  } catch (err) {
    if (err instanceof PayMongoError && err.status === 400) {
      // Already expired is fine; paid or paying is not.
      const s = await getCheckoutSession(id);
      return s.status === 'expired' && !s.paid;
    }
    if (err instanceof PayMongoError && err.status === 404) return true;
    throw err;
  }
}

/**
 * Checks the Paymongo-Signature header: "t=<timestamp>,te=<test sig>,li=<live sig>",
 * where each signature is HMAC-SHA256(webhook secret, `${t}.${raw body}`).
 * Uses te for test keys and li for live keys.
 * (https://docs.paymongo.com/docs/developer-tools-webhook-setup-management#securing-a-webhook)
 */
export function verifyWebhookSignature(rawBody: string, header: string | null, secret: string, live: boolean): boolean {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const i = kv.indexOf('=');
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    }),
  );
  const t = parts.t;
  const given = live ? parts.li : parts.te;
  if (!t || !given || !/^\d+$/.test(t)) return false;
  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(given.toLowerCase(), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}
