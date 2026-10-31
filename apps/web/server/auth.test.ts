import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkPassword, isAdmin, makeSession, sessionCookie, verifySession } from './auth';

const env = { ...process.env };
beforeEach(() => {
  process.env.ADMIN_PASSWORD = 'correct horse battery';
  process.env.ADMIN_SESSION_SECRET = 'x'.repeat(40);
});
afterEach(() => {
  process.env = { ...env };
});

describe('admin sign-in', () => {
  it('checks the password', () => {
    expect(checkPassword('correct horse battery')).toBe(true);
    expect(checkPassword('correct horse batter')).toBe(false);
    expect(checkPassword('')).toBe(false);
  });

  it('refuses to work with a missing or short password or secret', () => {
    process.env.ADMIN_PASSWORD = 'short';
    expect(() => checkPassword('short')).toThrow(/ADMIN_PASSWORD/);
    process.env.ADMIN_SESSION_SECRET = 'too short';
    expect(() => makeSession()).toThrow(/ADMIN_SESSION_SECRET/);
  });

  it('accepts its own sessions until they expire', () => {
    const now = Date.now();
    const s = makeSession(now);
    expect(verifySession(s, now)).toBe(true);
    expect(verifySession(s, now + 15 * 24 * 3600 * 1000)).toBe(false);
  });

  it('rejects tampered, foreign and empty sessions', () => {
    const s = makeSession();
    const [exp, sig] = s.split('.');
    expect(verifySession(`${Number(exp) + 999999}.${sig}`)).toBe(false);
    expect(verifySession(`${exp}.${sig.slice(0, -2)}xx`)).toBe(false);
    expect(verifySession(undefined)).toBe(false);
    expect(verifySession('nonsense')).toBe(false);
    process.env.ADMIN_SESSION_SECRET = 'y'.repeat(40);
    expect(verifySession(s)).toBe(false);
  });

  it('reads the session from the cookie header', () => {
    const req = new Request('https://kuhako.test/api/admin/login', { method: 'POST' });
    const cookie = sessionCookie(req);
    expect(cookie).toMatch(/HttpOnly; SameSite=Strict; Secure$/);
    const pair = cookie.split(';')[0];
    expect(isAdmin(new Request('https://kuhako.test/api/admin/products', { headers: { cookie: `a=1; ${pair}` } }))).toBe(true);
    expect(isAdmin(new Request('https://kuhako.test/api/admin/products'))).toBe(false);
  });
});
