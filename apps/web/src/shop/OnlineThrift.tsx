// Thrift pieces for sale online (added in the admin page). Hidden until there are some.
import { formatPeso } from '../../shared/catalog';
import { useCatalog } from '../catalog/catalog';
import { useShop } from './Shop';
import { ClaimStamp } from './ClaimStamp';
import { swingOnTouch } from '../swing';

export function OnlineThrift({ variant }: { variant: 'app' | 'site' }) {
  const { products } = useCatalog();
  const shop = useShop();
  const pieces = products.filter((p) => p.kind === 'thrift');
  if (pieces.length === 0) return null;

  const list = (
    <ul className={`shop-pieces shop-pieces--${variant}`}>
      {pieces.map((p) => {
        const sold = p.stock === 0;
        const orderable = Boolean(shop?.canOrder(p));
        const claimed = !sold && Boolean(shop?.inCart(p));
        const body = (
          <>
            <span className="shop-pieces__photo">
              {p.photoUrl ? <img src={p.photoUrl} alt="" loading="lazy" /> : null}
              {claimed ? <ClaimStamp fresh={shop?.justAdded === p.id} /> : null}
            </span>
            {/* The price tag hangs off the photo's corner and swings with the card. */}
            <span className="shop-pieces__tag">{sold ? 'Sold' : p.price === null ? 'Price soon' : formatPeso(p.price)}</span>
            <span className="shop-pieces__name">{p.name}</span>
            {p.detail ? <span className="shop-pieces__detail">{p.detail}</span> : null}
            {claimed ? <span className="shop-pieces__claimed">In your cart</span> : null}
          </>
        );
        return (
          <li key={p.id} data-sold={sold || undefined} data-claimed={claimed || undefined}>
            {orderable ? (
              <button type="button" className="shop-pieces__card" onClick={() => shop?.openProduct(p)} {...swingOnTouch}>
                {body}
              </button>
            ) : (
              <div className="shop-pieces__card" {...swingOnTouch}>
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  if (variant === 'app') {
    return (
      <>
        <h2 className="app-section-title">Shop online</h2>
        {list}
      </>
    );
  }
  return (
    <section className="shop-online" aria-labelledby="shop-online-title">
      <header className="shirts__head">
        <h3 id="shop-online-title" className="shirts__title">
          Shop the rack online
        </h3>
        <p className="shirts__lede">One of each. Delivered around Iloilo City; first to pay gets it.</p>
      </header>
      {list}
    </section>
  );
}
