import { describe, expect, it } from 'vitest';
import type { Product } from '../shared/catalog';
import { photos } from './data/photos';
import { measurementsOf, rackItemsFrom, sizeOf } from './rack';

const piece = (over: Partial<Product>): Product => ({
  id: 'p',
  kind: 'thrift',
  category: '',
  name: 'Piece',
  description: '',
  detail: '',
  photoUrl: null,
  gallery: [],
  price: null,
  options: [],
  stock: 1,
  active: true,
  featured: false,
  sort: 0,
  ...over,
});

describe('sizes and measurements from the detail line', () => {
  it('reads the size first', () => {
    expect(sizeOf('M · chest 54 cm · length 64 cm')).toBe('M');
    expect(sizeOf('Size XL')).toBe('XL');
    expect(sizeOf('chest 54 cm')).toBe(null);
    expect(sizeOf('')).toBe(null);
  });

  it('lists each measurement', () => {
    expect(measurementsOf('M · chest 54 cm · length 64 cm')).toEqual(['Size M', 'Chest 54 cm', 'Length 64 cm']);
    expect(measurementsOf('Size L')).toEqual(['Size L']);
    expect(measurementsOf('chest 50 cm')).toEqual(['Chest 50 cm']);
  });
});

describe('the rack', () => {
  it('shows the samples until there are real pieces', () => {
    const items = rackItemsFrom([]);
    expect(items).toHaveLength(photos.rack.length);
    expect(items.every((i) => !i.product && i.note === 'One of one')).toBe(true);
  });

  it('hangs real pieces with size and price, sold ones last', () => {
    const items = rackItemsFrom([
      piece({ id: 'sold', name: 'Blazer', stock: 0, price: 90000, photoUrl: 'https://x/blazer.jpg' }),
      piece({ id: 'jacket', name: 'Jacket', detail: 'M · chest 54 cm', price: 65000, photoUrl: 'https://x/jacket.png' }),
      piece({ id: 'tee', name: 'Tee' }),
    ]);
    expect(items.map((i) => [i.key, i.note])).toEqual([
      ['jacket', 'M · ₱650'],
      ['tee', 'Price soon'],
      ['sold', 'Sold'],
    ]);
    // A cut-out (PNG or WebP) hangs on the hanger; a JPEG is framed; no photo shows the placeholder.
    expect(items.map((i) => [i.slot.src, Boolean(i.slot.cutout)])).toEqual([
      ['https://x/jacket.png', true],
      [null, false],
      ['https://x/blazer.jpg', false],
    ]);
  });
});
