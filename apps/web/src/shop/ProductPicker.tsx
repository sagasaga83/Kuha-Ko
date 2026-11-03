import { useState } from 'react';
import { formatPeso, type Product } from '../../shared/catalog';
import { MAX_QUANTITY, defaultChoices, priceLine, type CartLine } from '../../shared/order';
import { photos } from '../data/photos';
import { measurementsOf } from '../rack';

/** The product's photos: its own, or for a drink without one, its menu group's photo. */
function photosOf(product: Product): string[] {
  const own = [product.photoUrl, ...product.gallery].filter((u): u is string => Boolean(u));
  if (own.length) return own;
  const group = product.kind === 'coffee' ? photos.menu[product.category]?.src : null;
  return group ? [group] : [];
}

/** A big photo with thumbnails under it to switch between them. */
function Gallery({ urls, name, whole }: { urls: string[]; name: string; whole?: boolean }) {
  const [at, setAt] = useState(0);
  if (urls.length === 0) return null;
  return (
    <div className={`shop-gallery${whole ? ' shop-gallery--whole' : ''}`}>
      <img className="shop-picker__photo" src={urls[at]} alt={urls.length > 1 ? `${name}, photo ${at + 1} of ${urls.length}` : ''} />
      {urls.length > 1 ? (
        <ul className="shop-gallery__thumbs" aria-label="More photos">
          {urls.map((u, i) => (
            <li key={u}>
              <button
                type="button"
                className="shop-gallery__thumb"
                aria-pressed={i === at}
                aria-label={`Photo ${i + 1} of ${urls.length}`}
                onClick={() => setAt(i)}
              >
                <img src={u} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Stepper({ value, onChange, max, label }: { value: number; onChange: (n: number) => void; max: number; label: string }) {
  return (
    <div className="shop-stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="One fewer">
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="One more">
        +
      </button>
    </div>
  );
}

/** Choose options and quantity for one product, then add it to the cart. */
export function ProductPicker({ product, onAdd }: { product: Product; onAdd: (line: CartLine) => void }) {
  const [choices, setChoices] = useState(() => defaultChoices(product));
  const [quantity, setQuantity] = useState(1);
  const priced = priceLine(product, choices);
  const max = Math.min(MAX_QUANTITY, product.stock ?? MAX_QUANTITY);

  const pickOne = (groupId: string, valueId: string) => setChoices((c) => ({ ...c, [groupId]: [valueId] }));
  const toggle = (groupId: string, valueId: string, on: boolean) =>
    setChoices((c) => ({ ...c, [groupId]: on ? [...(c[groupId] ?? []), valueId] : (c[groupId] ?? []).filter((v) => v !== valueId) }));

  return (
    <form
      className="shop-picker"
      onSubmit={(e) => {
        e.preventDefault();
        if (!('error' in priced)) onAdd({ productId: product.id, quantity, choices });
      }}
    >
      {/* Thrift pieces show whole, never cropped: what you see is what you get. */}
      <Gallery urls={photosOf(product)} name={product.name} whole={product.kind === 'thrift'} />
      <div className="shop-picker__head">
        <h2 className="shop-picker__name">{product.name}</h2>
        {product.kind === 'thrift' ? <p className="shop-picker__tag">One of one</p> : null}
        {product.detail && product.kind !== 'thrift' ? <p className="shop-picker__detail">{product.detail}</p> : null}
        {product.description ? <p className="shop-picker__desc">{product.description}</p> : null}
        {product.detail && product.kind === 'thrift' ? (
          <ul className="shop-measure" aria-label="Size and measurements">
            {measurementsOf(product.detail).map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {product.options.map((g) => (
        <fieldset key={g.id} className="shop-options">
          <legend>
            {g.label}
            <span>{g.multi ? 'Optional' : 'Choose one'}</span>
          </legend>
          {g.values.map((v) => {
            const checked = (choices[g.id] ?? []).includes(v.id);
            return (
              <label key={v.id} className="shop-option">
                <input
                  type={g.multi ? 'checkbox' : 'radio'}
                  name={`${product.id}-${g.id}`}
                  checked={checked}
                  onChange={(e) => (g.multi ? toggle(g.id, v.id, e.target.checked) : pickOne(g.id, v.id))}
                />
                <span className="shop-option__label">{v.label}</span>
                {v.delta > 0 ? <span className="shop-option__price">+{formatPeso(v.delta)}</span> : null}
              </label>
            );
          })}
        </fieldset>
      ))}

      <div className="shop-picker__foot">
        {max > 1 ? <Stepper value={quantity} onChange={setQuantity} max={max} label="Quantity" /> : null}
        <button type="submit" className="kk-button kk-button--primary shop-picker__add" disabled={'error' in priced}>
          {'error' in priced ? priced.error : `Add to order · ${formatPeso(priced.unitPrice * quantity)}`}
        </button>
      </div>
    </form>
  );
}
