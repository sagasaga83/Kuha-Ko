// Customer accounts. Clerk signs customers in; the browser sends the Clerk session
// token as `Authorization: Bearer …` and we verify it here. What they fill in at
// checkout is kept in `customers`, and their orders are linked by customer_id.
import { verifyToken } from '@clerk/backend';
import { db } from './db.js';
import { HttpError } from './http.js';
import { releaseExpired } from './orders.js';
import type { AccountOrder, AccountView, OrderStatus, Profile } from '../shared/order.js';

/** Accounts are on once Clerk is connected (CLERK_SECRET_KEY, set by the Vercel Marketplace integration). */
export const accountsEnabled = () => Boolean(process.env.CLERK_SECRET_KEY);

/**
 * The signed-in customer's Clerk user id, or null for a guest. A token that is
 * present but invalid or expired is treated as a guest too: checkout must never
 * fail because a sign-in went stale.
 */
export async function customerIdFrom(request: Request): Promise<string | null> {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!token || !secretKey) return null;
  try {
    const claims = await verifyToken(token, {
      secretKey,
      // Only tokens made for this site (not another app on the same Clerk instance).
      authorizedParties: [new URL(request.url).origin],
    });
    return typeof claims.sub === 'string' ? claims.sub : null;
  } catch {
    return null;
  }
}

/** Like customerIdFrom, but a guest gets a 401. */
export async function requireCustomer(request: Request): Promise<string> {
  if (!accountsEnabled()) throw new HttpError(503, 'Accounts aren’t available right now.');
  const id = await customerIdFrom(request);
  if (!id) throw new HttpError(401, 'Please sign in again.');
  return id;
}

type Row = Record<string, unknown>;

export function rowToProfile(r: Row | undefined): Profile {
  const lat = r?.address_lat as number | null | undefined;
  const lng = r?.address_lng as number | null | undefined;
  return {
    name: (r?.name as string) ?? '',
    phone: (r?.phone as string) ?? '',
    email: (r?.email as string) ?? '',
    address: (r?.address as string) ?? '',
    notes: (r?.address_notes as string) ?? '',
    pin: lat != null && lng != null ? { lat, lng } : null,
  };
}

export async function saveProfile(customerId: string, p: Profile): Promise<Profile> {
  const [row] = await db()`
    INSERT INTO customers (id, name, phone, email, address, address_notes, address_lat, address_lng)
    VALUES (${customerId}, ${p.name}, ${p.phone}, ${p.email}, ${p.address}, ${p.notes}, ${p.pin?.lat ?? null}, ${p.pin?.lng ?? null})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, phone = EXCLUDED.phone, email = EXCLUDED.email, address = EXCLUDED.address,
      address_notes = EXCLUDED.address_notes, address_lat = EXCLUDED.address_lat, address_lng = EXCLUDED.address_lng,
      updated_at = now()
    RETURNING *`;
  return rowToProfile(row);
}

/** One line per order: "2 × Iced latte, Kuha Ko shirt". */
export function summarize(items: { name: string; quantity: number }[]): string {
  return items.map((i) => (i.quantity > 1 ? `${i.quantity} × ${i.name}` : i.name)).join(', ');
}

export async function getAccount(customerId: string): Promise<AccountView> {
  const sql = db();
  await releaseExpired();
  const [profileRow] = await sql`SELECT * FROM customers WHERE id = ${customerId}`;
  const orders = await sql`SELECT id, code, status, created_at, total FROM orders
                           WHERE customer_id = ${customerId} ORDER BY created_at DESC LIMIT 50`;
  const items = orders.length
    ? await sql`SELECT order_id, name, quantity FROM order_items WHERE order_id = ANY(${orders.map((o) => o.id)}) ORDER BY id`
    : [];
  return {
    profile: rowToProfile(profileRow),
    orders: orders.map(
      (o): AccountOrder => ({
        id: o.id as string,
        code: o.code as string,
        status: o.status as OrderStatus,
        createdAt: new Date(o.created_at as string).toISOString(),
        total: o.total as number,
        summary: summarize(
          items.filter((i) => i.order_id === o.id).map((i) => ({ name: i.name as string, quantity: i.quantity as number })),
        ),
      }),
    ),
  };
}
