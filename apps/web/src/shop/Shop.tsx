// Online ordering: the cart, the product sheet and the cart/checkout sheet, shared
// by the one-page site and the app layout. Components call useShop().
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { formatPeso, type Product } from '../../shared/catalog';
import { MAX_QUANTITY } from '../../shared/order';
import { useCatalog } from '../catalog/catalog';
import { Sheet } from '../app/ui';
import { canOrder, lastOrderId, useCart, type Cart } from './cart';
import { Checkout } from './Checkout';
import { ProductPicker, Stepper } from './ProductPicker';
import { BasketIcon } from './BasketIcon';

interface Shop {
  cart: Cart;
  canOrder: (p: Product) => boolean;
  openProduct: (p: Product) => void;
  openCart: () => void;
}

const ShopContext = createContext<Shop | null>(null);

/** null outside a ShopProvider (e.g. in tests that render a section alone): ordering UI hides. */
export function useShop(): Shop | null {
  return useContext(ShopContext);
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const catalog = useCatalog();
  const cart = useCart(catalog);
  const [product, setProduct] = useState<Product | null>(null);
  const [cartStep, setCartStep] = useState<'closed' | 'cart' | 'checkout'>('closed');
  const [added, setAdded] = useState('');

  const openProduct = useCallback((p: Product) => setProduct(p), []);
  const openCart = useCallback(() => setCartStep('cart'), []);
  const closeProduct = useCallback(() => setProduct(null), []);
  const closeCart = useCallback(() => setCartStep('closed'), []);

  const value = useMemo<Shop>(
    () => ({ cart, canOrder: (p) => canOrder(p, catalog), openProduct, openCart }),
    [cart, catalog, openProduct, openCart],
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
      <Sheet title={product?.name ?? ''} open={product !== null} onClose={closeProduct}>
        {product ? (
          <ProductPicker
            key={product.id}
            product={product}
            onAdd={(line) => {
              cart.add(line);
              setProduct(null);
              setAdded(`${product.name} added to your cart`);
              window.setTimeout(() => setAdded(''), 2500);
            }}
          />
        ) : null}
      </Sheet>
      <Sheet title={cartStep === 'checkout' ? 'Checkout' : 'Your cart'} open={cartStep !== 'closed'} onClose={closeCart}>
        {cartStep === 'cart' ? <CartView cart={cart} onCheckout={() => setCartStep('checkout')} /> : null}
        {cartStep === 'checkout' ? <Checkout cart={cart} onBack={() => setCartStep('cart')} /> : null}
      </Sheet>
      <p className={`shop-toast${added ? ' is-on' : ''}`} role="status" aria-live="polite">
        {added}
      </p>
    </ShopContext.Provider>
  );
}

function CartView({ cart, onCheckout }: { cart: Cart; onCheckout: () => void }) {
  const last = lastOrderId();
  if (cart.lines.length === 0) {
    return (
      <div className="shop-empty">
        <p>Nothing here yet. Tap a drink, a shirt or a thrift piece to add it.</p>
        {last ? (
          <a className="shop-link" href={`/order/${last}`}>
            See your last order
          </a>
        ) : null}
      </div>
    );
  }
  return (
    <div className="shop-cart">
      <ul className="shop-lines">
        {cart.lines.map((l) => (
          <li key={l.key} className="shop-line" data-problem={l.problem ? '' : undefined}>
            <div className="shop-line__main">
              <p className="shop-line__name">{l.product?.name ?? 'Removed item'}</p>
              {l.priced?.labels.length ? <p className="shop-line__opts">{l.priced.labels.map((x) => x.value).join(' · ')}</p> : null}
              {l.problem ? <p className="shop-line__problem">{l.problem}</p> : null}
            </div>
            <div className="shop-line__side">
              <span className="shop-line__price">{l.priced ? formatPeso(l.priced.unitPrice * l.quantity) : '—'}</span>
              {l.product && !l.problem && (l.product.stock ?? MAX_QUANTITY) > 1 ? (
                <Stepper
                  value={l.quantity}
                  onChange={(n) => cart.setQuantity(l.key, n)}
                  max={Math.min(MAX_QUANTITY, l.product.stock ?? MAX_QUANTITY)}
                  label={`Quantity of ${l.product.name}`}
                />
              ) : null}
              <button type="button" className="shop-link" onClick={() => cart.remove(l.key)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <dl className="shop-totals">
        <div className="shop-totals__total">
          <dt>Items</dt>
          <dd>{formatPeso(cart.subtotal)}</dd>
        </div>
      </dl>
      <p className="shop-note">Delivery fee is added at checkout, by distance.</p>
      <button type="button" className="kk-button kk-button--primary shop-pay" onClick={onCheckout} disabled={!cart.ready}>
        {cart.ready ? 'Checkout' : 'Remove the marked items to continue'}
      </button>
    </div>
  );
}

/** The bar above the tab bar in the app layout: shows while the cart has something in it. */
export function CartBar() {
  const shop = useShop();
  if (!shop || shop.cart.count === 0) return null;
  return (
    <button type="button" className="shop-cartbar" onClick={shop.openCart}>
      <span className="shop-cartbar__title">
        <BasketIcon /> View cart
      </span>
      <span className="shop-cartbar__meta">
        {shop.cart.count} {shop.cart.count === 1 ? 'item' : 'items'} · {formatPeso(shop.cart.subtotal)}
      </span>
    </button>
  );
}

/** The cart button in the site header. */
export function CartButton() {
  const shop = useShop();
  if (!shop || shop.cart.count === 0) return null;
  return (
    <button type="button" className="shop-cartbtn" onClick={shop.openCart}>
      <BasketIcon /> Cart <span className="shop-cartbtn__count">{shop.cart.count}</span>
    </button>
  );
}
