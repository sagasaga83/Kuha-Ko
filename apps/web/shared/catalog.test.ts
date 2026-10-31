import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, formatPeso, isOrderable, parsePeso, slugify, type Product } from './catalog';
import { deliveryFee } from './delivery';
import { productInputSchema, settingsSchema } from './schema';
import { seedProducts } from './seed';

describe('money', () => {
  it('formats centavos as pesos', () => {
    expect(formatPeso(12000)).toBe('₱120');
    expect(formatPeso(125000)).toBe('₱1,250');
    expect(formatPeso(9950)).toBe('₱99.50');
    expect(formatPeso(0)).toBe('₱0');
  });

  it('reads what people type', () => {
    expect(parsePeso('120')).toBe(12000);
    expect(parsePeso('₱1,250')).toBe(125000);
    expect(parsePeso(' 99.5 ')).toBe(9950);
    expect(parsePeso('0.1')).toBe(10);
    expect(parsePeso('')).toBeNull();
    expect(parsePeso('12.345')).toBeNaN();
    expect(parsePeso('abc')).toBeNaN();
    expect(parsePeso('-5')).toBeNaN();
  });
});

describe('delivery fee', () => {
  const d = { radiusKm: 8, baseFee: 4900, baseKm: 3, perKm: 1000 };
  it('charges the base fee up to the base distance', () => {
    expect(deliveryFee(0, d)).toBe(4900);
    expect(deliveryFee(3000, d)).toBe(4900);
  });
  it('adds per km, rounding part of a km up', () => {
    expect(deliveryFee(3001, d)).toBe(5900);
    expect(deliveryFee(4000, d)).toBe(5900);
    expect(deliveryFee(7400, d)).toBe(9900);
  });
  it('refuses past the delivery area and bad distances', () => {
    expect(deliveryFee(8000, d)).toBe(4900 + 5 * 1000);
    expect(deliveryFee(8001, d)).toBeNull();
    expect(deliveryFee(-1, d)).toBeNull();
    expect(deliveryFee(Number.NaN, d)).toBeNull();
  });
});

describe('the catalog', () => {
  it('starts with the current menu and shirts, valid and with unique ids', () => {
    const products = seedProducts();
    expect(products.filter((p) => p.kind === 'coffee')).toHaveLength(11);
    expect(products.filter((p) => p.kind === 'shirt')).toHaveLength(5);
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    for (const p of products) expect(productInputSchema.safeParse(p).success).toBe(true);
    expect(products.find((p) => p.id === 'the-kuha')?.featured).toBe(true);
  });

  it('only lets priced, shown, in-stock items of an open kind be ordered', () => {
    const base = seedProducts().find((p) => p.kind === 'shirt') as Product;
    const open = { ...DEFAULT_SETTINGS.ordering, shirt: true };
    expect(isOrderable({ ...base, price: 45000 }, open)).toBe(true);
    expect(isOrderable({ ...base, price: null }, open)).toBe(false);
    expect(isOrderable({ ...base, price: 45000 }, DEFAULT_SETTINGS.ordering)).toBe(false);
    expect(isOrderable({ ...base, price: 45000, active: false }, open)).toBe(false);
    expect(isOrderable({ ...base, price: 45000, stock: 0 }, open)).toBe(false);
  });

  it('rejects bad products and settings', () => {
    expect(productInputSchema.safeParse({ kind: 'thrift', name: 'Denim jacket', price: -1 }).success).toBe(false);
    expect(productInputSchema.safeParse({ kind: 'hat', name: 'Cap' }).success).toBe(false);
    expect(productInputSchema.safeParse({ kind: 'thrift', name: 'Denim jacket', price: 12.5 }).success).toBe(false);
    expect(settingsSchema.safeParse(DEFAULT_SETTINGS).success).toBe(true);
    expect(settingsSchema.safeParse({ ...DEFAULT_SETTINGS, delivery: { ...DEFAULT_SETTINGS.delivery, radiusKm: 0 } }).success).toBe(false);
  });

  it('makes URL-safe ids', () => {
    expect(slugify('What-a-Steal Spanish Latte')).toBe('what-a-steal-spanish-latte');
    expect(slugify('Café Ñino')).toBe('cafe-nino');
    expect(slugify('  ')).toBe('');
  });
});
