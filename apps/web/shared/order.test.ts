// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { Product } from './catalog';
import { defaultChoices, lineKey, normalizePhone, normalizeReference, priceLine } from './order';
import { seedProducts } from './seed';

const kuha: Product = {
  ...(seedProducts().find((p) => p.id === 'the-kuha') as Product),
  price: 14000,
  options: [
    { id: 'temperature', label: 'Hot or iced', multi: false, values: [{ id: 'hot', label: 'Hot', delta: 0 }, { id: 'iced', label: 'Iced', delta: 2000 }] },
    { id: 'add-ons', label: 'Add-ons', multi: true, values: [{ id: 'extra-shot', label: 'Extra shot', delta: 3000 }, { id: 'oat-milk', label: 'Oat milk', delta: 3500 }] },
  ],
};

describe('pricing a cart line', () => {
  it('adds the chosen options to the price', () => {
    expect(priceLine(kuha, { temperature: ['iced'], 'add-ons': ['extra-shot', 'oat-milk'] })).toEqual({
      unitPrice: 14000 + 2000 + 3000 + 3500,
      labels: [
        { group: 'Hot or iced', value: 'Iced' },
        { group: 'Add-ons', value: 'Extra shot' },
        { group: 'Add-ons', value: 'Oat milk' },
      ],
    });
  });
  it('counts a repeated add-on once', () => {
    expect(priceLine(kuha, { temperature: ['hot'], 'add-ons': ['extra-shot', 'extra-shot'] })).toMatchObject({ unitPrice: 17000 });
  });
  it('needs exactly one choice in pick-one groups', () => {
    expect(priceLine(kuha, { 'add-ons': [] })).toHaveProperty('error');
    expect(priceLine(kuha, { temperature: ['hot', 'iced'] })).toHaveProperty('error');
  });
  it('rejects choices that no longer exist, and unpriced products', () => {
    expect(priceLine(kuha, { temperature: ['lukewarm'] })).toHaveProperty('error');
    expect(priceLine(kuha, { temperature: ['hot'], size: ['xl'] })).toHaveProperty('error');
    expect(priceLine({ ...kuha, price: null }, defaultChoices(kuha))).toHaveProperty('error');
  });
  it('starts on the first pick-one choice and no add-ons', () => {
    expect(defaultChoices(kuha)).toEqual({ temperature: ['hot'], 'add-ons': [] });
    expect(priceLine(kuha, defaultChoices(kuha))).toMatchObject({ unitPrice: 14000 });
  });
  it('merges the same product with the same choices, in any order', () => {
    const a = lineKey({ productId: 'the-kuha', choices: { 'add-ons': ['oat-milk', 'extra-shot'], temperature: ['iced'] } });
    const b = lineKey({ productId: 'the-kuha', choices: { temperature: ['iced'], 'add-ons': ['extra-shot', 'oat-milk'] } });
    expect(a).toBe(b);
    expect(lineKey({ productId: 'the-kuha', choices: { temperature: ['hot'] } })).not.toBe(a);
  });
});

describe('phone numbers', () => {
  it('accepts Philippine mobile numbers in the usual forms', () => {
    for (const n of ['09171234567', '0917 123 4567', '+639171234567', '639171234567', '9171234567', '(0917) 123-4567']) {
      expect(normalizePhone(n)).toBe('+639171234567');
    }
  });
  it('rejects landlines and junk', () => {
    expect(normalizePhone('033 123 4567')).toBeNull();
    expect(normalizePhone('0917123456')).toBeNull();
    expect(normalizePhone('hello')).toBeNull();
  });
});

describe('payment reference numbers', () => {
  it('accepts GCash and bank references, ignoring spaces and dashes', () => {
    expect(normalizeReference('1012 345 678912')).toBe('1012345678912');
    expect(normalizeReference(' ab12-cd34-ef ')).toBe('AB12CD34EF');
  });
  it('rejects anything too short or with other characters', () => {
    expect(normalizeReference('12345')).toBeNull();
    expect(normalizeReference('')).toBeNull();
    expect(normalizeReference('ref#123456')).toBeNull();
  });
});
