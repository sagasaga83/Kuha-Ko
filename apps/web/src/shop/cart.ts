// The cart: saved in this browser (localStorage), priced from the live catalog.
// Prices shown here are for display; the server re-prices everything at checkout.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isOrderable, type Catalog, type Product } from '../../shared/catalog';
import { MAX_LINES, MAX_QUANTITY, lineKey, priceLine, type CartLine, type PricedLine } from '../../shared/order';

const KEY = 'kuhako-cart';
const LAST_ORDER = 'kuhako-last-order';

export interface CartEntry extends CartLine {
  key: string;
}

export interface ShownLine extends CartEntry {
  product: Product | null;
  priced: PricedLine | null;
  /** Why this line can't be ordered now, if it can't. */
  problem: string | null;
}

function read(): CartEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((l) => typeof l?.productId === 'string' && Number.isInteger(l?.quantity) && typeof l?.choices === 'object')
      .map((l) => ({ productId: l.productId, quantity: Math.min(MAX_QUANTITY, Math.max(1, l.quantity)), choices: l.choices, key: lineKey(l) }));
  } catch {
    return [];
  }
}

function write(lines: CartEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines.map(({ productId, quantity, choices }) => ({ productId, quantity, choices }))));
  } catch {
    // Storage blocked: the cart lasts for this visit only.
  }
}

/** Empties the saved cart (after an order is paid). */
export function clearStoredCart() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function rememberOrder(id: string) {
  try {
    localStorage.setItem(LAST_ORDER, id);
  } catch {
    // ignore
  }
}

export function lastOrderId(): string | null {
  try {
    return localStorage.getItem(LAST_ORDER);
  } catch {
    return null;
  }
}

/** Can this product be ordered online right now (priced, on sale, kind open, delivery set up)? */
export function canOrder(p: Product, catalog: Catalog): boolean {
  return catalog.deliveryReady && isOrderable(p, catalog.ordering);
}

export function useCart(catalog: Catalog) {
  const [lines, setLines] = useState<CartEntry[]>(read);

  // Keep tabs in step with each other.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === KEY && setLines(read());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((fn: (cur: CartEntry[]) => CartEntry[]) => {
    setLines((cur) => {
      const next = fn(cur);
      write(next);
      return next;
    });
  }, []);

  const add = useCallback(
    (line: CartLine) =>
      update((cur) => {
        const key = lineKey(line);
        const existing = cur.find((l) => l.key === key);
        if (existing) {
          return cur.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + line.quantity) } : l));
        }
        if (cur.length >= MAX_LINES) return cur;
        return [...cur, { ...line, key }];
      }),
    [update],
  );
  const setQuantity = useCallback(
    (key: string, quantity: number) =>
      update((cur) =>
        quantity <= 0 ? cur.filter((l) => l.key !== key) : cur.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QUANTITY, quantity) } : l)),
      ),
    [update],
  );
  const remove = useCallback((key: string) => update((cur) => cur.filter((l) => l.key !== key)), [update]);
  const clear = useCallback(() => update(() => []), [update]);

  const shown: ShownLine[] = useMemo(
    () =>
      lines.map((l) => {
        const product = catalog.products.find((p) => p.id === l.productId) ?? null;
        if (!product) return { ...l, product, priced: null, problem: 'No longer available' };
        const priced = priceLine(product, l.choices);
        if ('error' in priced) return { ...l, product, priced: null, problem: priced.error };
        if (product.stock === 0) return { ...l, product, priced, problem: 'Just sold out' };
        if (!canOrder(product, catalog)) return { ...l, product, priced, problem: 'Can’t be ordered right now' };
        if (product.stock !== null && l.quantity > product.stock) return { ...l, product, priced, problem: `Only ${product.stock} left` };
        return { ...l, product, priced, problem: null };
      }),
    [lines, catalog],
  );

  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = shown.reduce((s, l) => s + (l.priced && !l.problem ? l.priced.unitPrice * l.quantity : 0), 0);
  const ready = shown.length > 0 && shown.every((l) => !l.problem);

  return { lines: shown, count, subtotal, ready, add, setQuantity, remove, clear };
}

export type Cart = ReturnType<typeof useCart>;
