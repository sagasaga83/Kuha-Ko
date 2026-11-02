import { afterEach, describe, expect, it } from 'vitest';
import { customerIdFrom, requireCustomer, rowToProfile, summarize } from './customers';

const req = (headers: Record<string, string> = {}) => new Request('https://kuha-ko.example/api/checkout', { headers });

describe('customerIdFrom', () => {
  const saved = process.env.CLERK_SECRET_KEY;
  afterEach(() => {
    if (saved === undefined) delete process.env.CLERK_SECRET_KEY;
    else process.env.CLERK_SECRET_KEY = saved;
  });

  it('is a guest without a token', async () => {
    process.env.CLERK_SECRET_KEY = 'sk_test_x';
    expect(await customerIdFrom(req())).toBeNull();
  });

  it('is a guest when accounts are off, even with a token', async () => {
    delete process.env.CLERK_SECRET_KEY;
    expect(await customerIdFrom(req({ authorization: 'Bearer abc' }))).toBeNull();
  });

  it('treats a bad token as a guest instead of failing checkout', async () => {
    process.env.CLERK_SECRET_KEY = 'sk_test_x';
    expect(await customerIdFrom(req({ authorization: 'Bearer not-a-jwt' }))).toBeNull();
  });

  it('asks a guest to sign in on account endpoints', async () => {
    process.env.CLERK_SECRET_KEY = 'sk_test_x';
    await expect(requireCustomer(req())).rejects.toMatchObject({ status: 401 });
    delete process.env.CLERK_SECRET_KEY;
    await expect(requireCustomer(req())).rejects.toMatchObject({ status: 503 });
  });
});

describe('rowToProfile', () => {
  it('is blank for a customer who has saved nothing', () => {
    expect(rowToProfile(undefined)).toEqual({ name: '', phone: '', email: '', address: '', notes: '', pin: null });
  });

  it('maps a saved row, with the pin only when both coordinates are set', () => {
    const row = { name: 'Ana', phone: '+639171234567', email: 'a@b.ph', address: 'Iloilo', address_notes: 'Blue gate', address_lat: 10.7, address_lng: 122.56 };
    expect(rowToProfile(row)).toEqual({ name: 'Ana', phone: '+639171234567', email: 'a@b.ph', address: 'Iloilo', notes: 'Blue gate', pin: { lat: 10.7, lng: 122.56 } });
    expect(rowToProfile({ ...row, address_lng: null }).pin).toBeNull();
  });
});

describe('summarize', () => {
  it('lists items with quantities above one', () => {
    expect(summarize([{ name: 'Iced latte', quantity: 2 }, { name: 'Kuha Ko shirt', quantity: 1 }])).toBe('2 × Iced latte, Kuha Ko shirt');
  });
});
