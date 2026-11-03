// What hangs on the thrift rack: the real pieces for sale (added in the admin) once
// there are any, and until then the sample pieces from src/data/photos.ts.
import { formatPeso, type Product } from '../shared/catalog';
import { useCatalog } from './catalog/catalog';
import { photos, type PhotoSlot } from './data/photos';

export interface RackItem {
  key: string;
  slot: PhotoSlot;
  /** The real piece, when it's one; samples have none and can't be opened. */
  product?: Product;
  /** The tag's second line: "M · ₱450", "Sold", or "One of one" on a sample. */
  note: string;
  sold?: boolean;
}

/** The size from a thrift piece's detail line: "M · chest 54 cm · length 64 cm" → "M". */
export function sizeOf(detail: string): string | null {
  const first = detail.split('·')[0]?.trim() ?? '';
  const size = first.replace(/^size\s+/i, '');
  return size && size.length <= 6 ? size : null;
}

/** The detail line as a list: "M · chest 54 cm" → ["Size M", "Chest 54 cm"]. */
export function measurementsOf(detail: string): string[] {
  const parts = detail
    .split('·')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.map((p, i) =>
    i === 0 && !/\d/.test(p) && p.length <= 11 ? `Size ${p.replace(/^size\s+/i, '')}` : p.charAt(0).toUpperCase() + p.slice(1),
  );
}

/**
 * Photos that are already cut out (PNG or WebP, usually with a transparent background)
 * hang straight on the wooden hanger; anything else shows as a framed photo on the rack.
 */
const isCutout = (url: string) => /\.(png|webp)(\?|$)/i.test(url);

export function rackItemsFrom(products: Product[]): RackItem[] {
  const pieces = products.filter((p) => p.kind === 'thrift');
  if (pieces.length === 0) {
    return photos.rack.map((slot, i) => ({ key: slot.src ?? `sample-${i}`, slot, note: 'One of one' }));
  }
  // Sold pieces stay up for a while (proof that things go fast), after the ones still for sale.
  const sorted = [...pieces].sort((a, b) => Number(a.stock === 0) - Number(b.stock === 0));
  return sorted.map((p) => {
    const sold = p.stock === 0;
    const size = sizeOf(p.detail);
    const price = p.price === null ? 'Price soon' : formatPeso(p.price);
    return {
      key: p.id,
      product: p,
      sold,
      note: sold ? 'Sold' : size ? `${size} · ${price}` : price,
      // No photo yet: a "photo coming soon" card hangs in its place.
      slot: {
        src: p.photoUrl,
        alt: p.name,
        brief: p.name,
        ratio: '3 / 4',
        cutout: p.photoUrl ? isCutout(p.photoUrl) : false,
      },
    };
  });
}

export function useRackItems(): RackItem[] {
  return rackItemsFrom(useCatalog().products);
}
