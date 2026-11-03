import type { RackItem } from '../rack';
import { useShop } from '../shop/Shop';
import { RackPiece } from './RackPiece';

/** One item on a rack: a real piece opens its sheet and is stamped KUHA KO! once it's in the cart. */
export function RackItemPiece({ item, no }: { item: RackItem; no: number }) {
  const shop = useShop();
  const p = item.product;
  const orderable = Boolean(p && shop?.canOrder(p));
  const inCart = Boolean(p && !item.sold && shop?.inCart(p));
  return (
    <RackPiece
      slot={item.slot}
      no={no}
      note={item.note}
      sold={item.sold}
      onOpen={orderable && p ? () => shop?.openProduct(p) : undefined}
      label={p ? `${p.name}, ${item.note}${inCart ? ', in your cart' : ''}` : undefined}
      claimed={inCart ? (shop?.justAdded === p?.id ? 'fresh' : true) : undefined}
    />
  );
}
