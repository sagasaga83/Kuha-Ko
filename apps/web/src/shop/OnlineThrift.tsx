// Thrift pieces for sale online (added in the admin page). Hidden until there are some.
import { formatPeso } from '../../shared/catalog';
import { useCatalog } from '../catalog/catalog';
import { useShop } from './Shop';

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
        const body = (
          <>
            <span className="shop-pieces__photo">{p.photoUrl ? <img src={p.photoUrl} alt="" loading="lazy" /> : null}</span>
            <span className="shop-pieces__name">{p.name}</span>
            {p.detail ? <span className="shop-pieces__detail">{p.detail}</span> : null}
            <span className="shop-pieces__price">{sold ? 'Sold' : p.price === null ? 'Price soon' : formatPeso(p.price)}</span>
          </>
        );
        return (
          <li key={p.id} data-sold={sold || undefined}>
            {orderable ? (
              <button type="button" className="shop-pieces__card" onClick={() => shop?.openProduct(p)}>
                {body}
              </button>
            ) : (
              <div className="shop-pieces__card">{body}</div>
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
      <header className="shirts__head" data-reveal>
        <h3 id="shop-online-title" className="shirts__title">
          Shop the rack online
        </h3>
        <p className="shirts__lede">One of each. Delivered around Iloilo City; first to pay gets it.</p>
      </header>
      {list}
    </section>
  );
}
