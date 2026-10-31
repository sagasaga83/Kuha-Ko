// Admin sign-in: one shared password (ADMIN_PASSWORD) for the owner and partner.
// A correct password gets a signed, httpOnly cookie (HMAC with ADMIN_SESSION_SECRET)
// that only the /api/admin routes receive.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { HttpError } from './http.js';

const COOKIE = 'kk_admin';
const MAX_AGE_S = 14 * 24 * 60 * 60;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new HttpError(503, 'Admin sign-in is not set up yet (ADMIN_SESSION_SECRET).');
  return s;
}

const sign = (exp: number, key: string) => createHmac('sha256', key).update(`admin.${exp}`).digest('base64url');

/** Equal-time comparison, so response timing doesn't leak how much of a guess was right. */
function same(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(given: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || real.length < 12) throw new HttpError(503, 'Admin sign-in is not set up yet (ADMIN_PASSWORD).');
  return same(given, real);
}

export function makeSession(now = Date.now()): string {
  const exp = Math.floor(now / 1000) + MAX_AGE_S;
  return `${exp}.${sign(exp, secret())}`;
}

export function verifySession(value: string | undefined, now = Date.now()): boolean {
  if (!value) return false;
  const [expText, sig] = value.split('.');
  const exp = Number(expText);
  if (!Number.isInteger(exp) || !sig || exp < now / 1000) return false;
  return same(sig, sign(exp, secret()));
}

function cookieFlags(request: Request): string {
  // Secure everywhere except plain-http local dev.
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `Path=/api/admin; HttpOnly; SameSite=Strict${secure}`;
}

export function sessionCookie(request: Request): string {
  return `${COOKIE}=${makeSession()}; Max-Age=${MAX_AGE_S}; ${cookieFlags(request)}`;
}

export function clearCookie(request: Request): string {
  return `${COOKIE}=; Max-Age=0; ${cookieFlags(request)}`;
}

function readCookie(request: Request): string | undefined {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === COOKIE) return v.join('=');
  }
  return undefined;
}

export function isAdmin(request: Request): boolean {
  return verifySession(readCookie(request));
}

/** Throws 401 unless the request carries a valid admin session. */
export function requireAdmin(request: Request): void {
  if (!isAdmin(request)) throw new HttpError(401, 'Please sign in again.');
}
