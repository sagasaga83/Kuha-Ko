import { describe, expect, it } from 'vitest';
import { addOnsFrom, menuFrom, shirtsFrom, fallbackCatalog } from './catalog';
import { menu } from '../data/menu';
import { shirts } from '../data/shirts';

const products = fallbackCatalog.products;

describe('catalog adapters', () => {
  it('rebuild the built-in menu and shirts from the catalog', () => {
    const built = menuFrom(products);
    expect(built.map((g) => g.id)).toEqual(menu.map((g) => g.id));
    expect(built.flatMap((g) => g.drinks.map((d) => d.name))).toEqual(menu.flatMap((g) => g.drinks.map((d) => d.name)));
    expect(shirtsFrom(products).map((s) => s.name)).toEqual(shirts.map((s) => s.name));
    expect(shirtsFrom(products)[0].photo).toBe(shirts[0].photo);
  });

  it('shows live prices, with the iced extra', () => {
    const priced = products.map((p) => (p.id === 'the-kuha' ? { ...p, price: 14000, options: p.options.map((g) => (g.id === 'temperature' ? { ...g, values: g.values.map((v) => (v.id === 'iced' ? { ...v, delta: 2000 } : v)) } : g)) } : p));
    const kuha = menuFrom(priced)[0].drinks.find((d) => d.name === 'The Kuha');
    expect(kuha?.hot).toBe('₱140');
    expect(kuha?.iced).toBe('₱160');
    expect(menuFrom(products)[0].drinks[0].hot).toBeUndefined();
  });

  it('drops hidden drinks and empty groups', () => {
    const onlyClassics = products.filter((p) => p.kind !== 'coffee' || p.category === 'classics');
    expect(menuFrom(onlyClassics).map((g) => g.id)).toEqual(['classics']);
  });

  it('shows add-on prices once set', () => {
    expect(addOnsFrom(products)[0].price).toBeUndefined();
    const priced = products.map((p) => ({ ...p, options: p.options.map((g) => (g.id === 'add-ons' ? { ...g, values: g.values.map((v) => ({ ...v, delta: 3000 })) } : g)) }));
    expect(addOnsFrom(priced)[0].price).toBe('+₱30');
  });
});
