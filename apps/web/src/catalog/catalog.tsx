// The live catalog (prices, what's on sale, what takes orders), from /api/catalog.
// Until it loads, or if the API can't be reached (local `npm run dev`, tests, an
// outage), the site shows the built-in content from src/data, so it never breaks.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, formatPeso, type Catalog, type Product } from '../../shared/catalog';
import { seedProducts } from '../../shared/seed';
import { menu as menuGroups, addOns as staticAddOns, type MenuGroup } from '../data/menu';
import { shirts as staticShirts, type Shirt } from '../data/shirts';

export const fallbackCatalog: Catalog = {
  products: seedProducts(),
  ordering: DEFAULT_SETTINGS.ordering,
  deliveryReady: false,
};

const CatalogContext = createContext<Catalog>(fallbackCatalog);

function isCatalog(x: unknown): x is Catalog {
  return typeof x === 'object' && x !== null && Array.isArray((x as Catalog).products) && 'ordering' in x;
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog>(fallbackCatalog);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/catalog', { signal: ctrl.signal, headers: { accept: 'application/json' } })
      .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? r.json() : null))
      .then((data: unknown) => {
        if (isCatalog(data)) setCatalog(data);
      })
      .catch(() => {
        // Keep the built-in content.
      });
    return () => ctrl.abort();
  }, []);
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Catalog {
  return useContext(CatalogContext);
}

const icedDelta = (p: Product) =>
  p.options.find((g) => g.id === 'temperature')?.values.find((v) => v.id === 'iced')?.delta ?? 0;

/** The coffee menu in the shape the menu components use, in the wall-menu groups. */
export function menuFrom(products: Product[]): MenuGroup[] {
  return menuGroups
    .map((g) => ({
      ...g,
      drinks: products
        .filter((p) => p.kind === 'coffee' && p.category === g.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          kind: p.detail,
          description: p.description,
          hot: p.price === null ? undefined : formatPeso(p.price),
          iced: p.price === null ? undefined : formatPeso(p.price + icedDelta(p)),
          house: p.featured,
        })),
    }))
    .filter((g) => g.drinks.length > 0);
}

/** Add-ons with their prices, from the first drink that has the add-on group. */
export function addOnsFrom(products: Product[]): { name: string; price?: string }[] {
  const group = products.find((p) => p.kind === 'coffee')?.options.find((g) => g.id === 'add-ons');
  if (!group) return staticAddOns;
  return group.values.map((v) => ({ name: v.label, price: v.delta > 0 ? `+${formatPeso(v.delta)}` : undefined }));
}

/** The shirts, with live prices; built-in photos and alt text are kept for the original five. */
export function shirtsFrom(products: Product[]): (Shirt & { id: string })[] {
  return products
    .filter((p) => p.kind === 'shirt')
    .map((p) => {
      const known = staticShirts.find((s) => s.name === p.name);
      const colours = p.options.find((g) => g.id === 'colour')?.values.map((v) => v.label) ?? known?.colours ?? [];
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        colours,
        price: p.price === null ? undefined : formatPeso(p.price),
        photo:
          known && (!p.photoUrl || p.photoUrl === known.photo.src)
            ? known.photo
            : { src: p.photoUrl, alt: `${p.name} t-shirt`, brief: p.name, ratio: known?.photo.ratio ?? '1 / 1' },
      };
    });
}
