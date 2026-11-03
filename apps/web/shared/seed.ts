// Turns the site's current content (src/data/menu.ts, shirts.ts) into catalog rows,
// so the database starts with exactly what the site shows today.
import { addOns, menu } from '../src/data/menu.js';
import { shirts } from '../src/data/shirts.js';
import { parsePeso, slugify, type OptionGroup, type Product } from './catalog.js';

/** Price strings like "₱120" → centavos; unset or unreadable → null. */
const peso = (s: string | undefined): number | null => {
  const v = s ? parsePeso(s) : null;
  return v === null || Number.isNaN(v) ? null : v;
};

/** Sizes the shirts are printed in. Change them per shirt in the admin page. */
export const SHIRT_SIZES = ['S', 'M', 'L', 'XL', '2XL'];

export function seedProducts(): Product[] {
  const addOnGroup: OptionGroup = {
    id: 'add-ons',
    label: 'Add-ons',
    multi: true,
    values: addOns.map((a) => ({ id: slugify(a.name).slice(0, 40), label: a.name, delta: peso(a.price) ?? 0 })),
  };

  const coffee = menu.flatMap((group) =>
    group.drinks.map((d, i): Product => {
      const hot = peso(d.hot);
      const iced = peso(d.iced);
      const base = hot ?? iced;
      return {
        id: slugify(d.name),
        kind: 'coffee',
        category: group.id,
        name: d.name,
        description: d.description,
        detail: d.kind,
        photoUrl: null,
        price: base,
        options: [
          {
            id: 'temperature',
            label: 'Hot or iced',
            multi: false,
            values: [
              { id: 'hot', label: 'Hot', delta: 0 },
              { id: 'iced', label: 'Iced', delta: hot !== null && iced !== null ? Math.max(0, iced - hot) : 0 },
            ],
          },
          addOnGroup,
        ],
        stock: null,
        active: true,
        featured: Boolean(d.house),
        sort: i,
      };
    }),
  );

  const shirtRows = shirts.map(
    (s, i): Product => ({
      id: slugify(s.name),
      kind: 'shirt',
      category: 'shirts',
      name: s.name,
      description: s.description,
      detail: '',
      photoUrl: s.photo.src,
      price: peso(s.price),
      options: [
        {
          id: 'colour',
          label: 'Colour',
          multi: false,
          values: s.colours.map((c) => ({ id: slugify(c), label: c, delta: 0 })),
        },
        {
          id: 'size',
          label: 'Size',
          multi: false,
          values: SHIRT_SIZES.map((sz) => ({ id: sz.toLowerCase(), label: sz, delta: 0 })),
        },
      ],
      stock: null,
      active: true,
      featured: false,
      sort: i,
    }),
  );

  return [...coffee, ...shirtRows];
}
