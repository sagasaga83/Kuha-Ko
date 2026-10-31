// /order/:id: the customer's order, where PayMongo sends them back after paying.
// Checks every few seconds while payment is pending.
import { useCallback, useEffect, useState } from 'react';
import { Wordmark } from '@kuhako/ui';
import { formatPeso } from '../../shared/catalog';
import { ORDER_STATUS_LABELS, type OrderView } from '../../shared/order';
import { clearStoredCart, lastOrderId } from '../shop/cart';
import '../styles/shop.css';

const STEPS = ['paid', 'preparing', 'out_for_delivery', 'delivered'] as const;

export default function OrderPage({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const cancelled = new URLSearchParams(window.location.search).get('payment') === 'cancelled';

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/order?id=${encodeURIComponent(id)}`, { headers: { accept: 'application/json' } });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? 'We can’t find that order.');
      setOrder(data);
      setError('');
      return data as OrderView;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check your connection.');
      return null;
    }
  }, [id]);

  useEffect(() => {
    document.title = 'Your order · Kuha Ko';
    let stop = false;
    let tries = 0;
    const tick = async () => {
      const o = await load();
      tries++;
      // While waiting for payment, keep checking (quickly at first, then slower).
      if (!stop && o?.status === 'pending_payment') window.setTimeout(tick, tries < 20 ? 3000 : 15000);
      // Delivered orders don't change; others check now and then.
      else if (!stop && o && o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'expired') window.setTimeout(tick, 60000);
    };
    tick();
    return () => {
      stop = true;
    };
  }, [load]);

  useEffect(() => {
    if (order && order.status !== 'pending_payment' && order.status !== 'cancelled' && order.status !== 'expired' && lastOrderId() === order.id) {
      clearStoredCart();
    }
  }, [order]);

  const cancel = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/order?id=${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) setError(data?.error ?? 'Could not cancel.');
      else setOrder(data);
    } finally {
      setBusy(false);
    }
  };

  const minutesLeft = order?.holdExpiresAt ? Math.max(0, Math.round((Date.parse(order.holdExpiresAt) - Date.now()) / 60000)) : null;
  const stepIndex = order ? STEPS.indexOf(order.status as (typeof STEPS)[number]) : -1;

  return (
    <div className="order">
      <header className="order__top">
        <a href="/" aria-label="Kuha Ko home">
          <Wordmark size={30} />
        </a>
      </header>
      {!order && !error ? <p className="shop-note">Loading your order…</p> : null}
      {error && !order ? (
        <p className="shop-error" role="alert">
          {error}
        </p>
      ) : null}
      {order ? (
        <main>
          <p className="order__code">Order {order.code}</p>
          <h1 className="order__status" aria-live="polite">
            {order.status === 'paid' ? `Salamat, ${order.customerName.split(' ')[0]}! We’ve got your order.` : ORDER_STATUS_LABELS[order.status]}
          </h1>

          {order.status === 'pending_payment' ? (
            <div className="order__box">
              <p>
                {cancelled ? 'Payment wasn’t finished. ' : 'Checking your payment… '}
                {minutesLeft !== null ? `We’re holding your items for ${minutesLeft} more ${minutesLeft === 1 ? 'minute' : 'minutes'}.` : null}
              </p>
              <div className="order__actions">
                {order.checkoutUrl ? (
                  <a className="kk-button kk-button--primary" href={order.checkoutUrl}>
                    Pay now
                  </a>
                ) : null}
                <button type="button" className="shop-link" onClick={cancel} disabled={busy}>
                  {busy ? 'Cancelling…' : 'Cancel order'}
                </button>
              </div>
            </div>
          ) : null}
          {order.status === 'expired' ? (
            <p className="order__box">This order wasn’t paid within 30 minutes, so the items went back on sale. You can order again from the menu.</p>
          ) : null}
          {order.status === 'cancelled' ? <p className="order__box">This order was cancelled. Nothing was charged.</p> : null}

          {stepIndex >= 0 ? (
            <ol className="order__steps">
              {STEPS.map((s, i) => (
                <li key={s} data-done={i <= stepIndex || undefined} aria-current={i === stepIndex ? 'step' : undefined}>
                  {ORDER_STATUS_LABELS[s]}
                </li>
              ))}
            </ol>
          ) : null}

          <ul className="shop-lines">
            {order.items.map((i, n) => (
              <li key={n} className="shop-line">
                <div className="shop-line__main">
                  <p className="shop-line__name">
                    {i.quantity > 1 ? `${i.quantity} × ` : ''}
                    {i.name}
                  </p>
                  {i.choices.length ? <p className="shop-line__opts">{i.choices.map((c) => c.value).join(' · ')}</p> : null}
                </div>
                <span className="shop-line__price">{formatPeso(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="shop-totals">
            <div>
              <dt>Items</dt>
              <dd>{formatPeso(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{formatPeso(order.deliveryFee)}</dd>
            </div>
            <div className="shop-totals__total">
              <dt>{order.paidAt ? 'Paid' : 'Total'}</dt>
              <dd>{formatPeso(order.total)}</dd>
            </div>
          </dl>
          <h2 className="shop-h">Delivering to</h2>
          <p>
            {order.address}
            {order.addressNotes ? (
              <>
                <br />
                <span className="shop-note">{order.addressNotes}</span>
              </>
            ) : null}
          </p>
          <p className="shop-note">Keep this page: it’s the link to your order. Questions? Message Kuha Ko with your order number.</p>
          {error ? <p className="shop-error">{error}</p> : null}
          <a className="shop-link" href="/">
            ← Back to Kuha Ko
          </a>
        </main>
      ) : null}
    </div>
  );
}
