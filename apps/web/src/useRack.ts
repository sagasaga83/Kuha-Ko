// What hangs on the thrift rack (site and app) and what picking a piece does.
//
// The rack hangs the thrift pieces added in the admin page, each on its rack cut-out
// (or its ordinary photo until it has one), with its price typed on the tag. Picking one
// claims it: it goes straight into the cart and the KUHA KO! stamp lands on it; picking it
// again puts it back. A piece that can't be ordered right now opens its sheet instead, and
// a sold one can't be picked. Until the shop has added any pieces, the rack shows the
// display photos from photos.ts, which only look picked: nothing is reserved.
import { useState } from 'react';
import { formatPeso, type Product } from '../shared/catalog';
import { useCatalog } from './catalog/catalog';
import { useShop } from './shop/Shop';
import { photos, type PhotoSlot } from './data/photos';

export interface RackEntry {
  key: string;
  slot: PhotoSlot;
  tag: [string, string];
  picked: boolean;
  /** The stamp lands with a thunk (picked just now) rather than already being there. */
  fresh: boolean;
  onPick?: () => void;
  pickLabel?: string;
}

/**
 * A thrift piece as it hangs: its cut-out if it has one, else its photo on a card. A piece
 * using one of the display cut-outs from photos.ts keeps that cut-out's hanger fit.
 */
function slotFor(p: Product): PhotoSlot {
  const display = p.rackPhotoUrl ? photos.rack.find((s) => s.src === p.rackPhotoUrl) : undefined;
  return {
    src: p.rackPhotoUrl ?? p.photoUrl,
    alt: display?.alt ?? p.name,
    brief: p.name,
    ratio: display?.ratio ?? '3 / 4',
    cutout: Boolean(p.rackPhotoUrl),
    hanger: display?.hanger,
    middle: display?.middle,
  };
}

export function useRack(): RackEntry[] {
  const { products } = useCatalog();
  const shop = useShop();
  /** Display photos only: which one looks picked. */
  const [looked, setLooked] = useState<number | null>(null);
  const pieces = products.filter((p) => p.kind === 'thrift');

  if (pieces.length === 0) {
    return photos.rack.map((slot, i) => {
      const no = `No. ${String(i + 1).padStart(4, '0')}`;
      const picked = looked === i;
      return {
        key: slot.src ?? String(i),
        slot,
        tag: [no, 'One of one'],
        picked,
        fresh: true,
        onPick: () => setLooked(picked ? null : i),
        pickLabel: `${picked ? 'Put back' : 'Pick'} ${no}: ${slot.alt}`,
      };
    });
  }

  return pieces.map((p) => {
    const sold = p.stock === 0;
    const inCart = !sold && Boolean(shop?.inCart(p));
    const orderable = !sold && Boolean(shop?.canOrder(p));
    const tag: [string, string] = [sold ? 'Sold' : p.price === null ? 'Price soon' : formatPeso(p.price), 'One of one'];
    let onPick: (() => void) | undefined;
    let pickLabel: string | undefined;
    if (shop && inCart) {
      onPick = () => shop.release(p);
      pickLabel = `Put ${p.name} back (take it out of your cart)`;
    } else if (shop && orderable) {
      onPick = () => shop.claim(p);
      pickLabel = `Kuha ko: add ${p.name}, ${tag[0]}, to your cart`;
    } else if (shop && !sold) {
      onPick = () => shop.openProduct(p);
      pickLabel = `See ${p.name}`;
    }
    return {
      key: p.id,
      slot: slotFor(p),
      tag,
      picked: inCart,
      fresh: shop?.justAdded === p.id,
      onPick,
      pickLabel,
    };
  });
}
