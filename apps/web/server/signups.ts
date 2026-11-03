// People who asked to hear about the next live selling. The shop emails them by
// hand for now (the admin's Sign-ups tab copies the list); nothing is sent automatically.
import { db } from './db.js';

export interface Signup {
  email: string;
  source: string;
  createdAt: string;
}

/** Adds an email to the list. Signing up twice is fine: the first date is kept. */
export async function addSignup(email: string, source: string): Promise<void> {
  await db()`INSERT INTO signups (email, source) VALUES (${email}, ${source}) ON CONFLICT (email) DO NOTHING`;
}

export async function listSignups(): Promise<Signup[]> {
  const rows = await db()`SELECT email, source, created_at FROM signups ORDER BY created_at DESC`;
  return rows.map((r) => ({
    email: r.email as string,
    source: r.source as string,
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

export async function removeSignup(email: string): Promise<void> {
  await db()`DELETE FROM signups WHERE email = ${email}`;
}
