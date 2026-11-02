// /order/:id: the customer's order. While unpaid it shows where to send the money
// (Kuha Ko's GCash or QR Ph) and takes the reference number; then it follows the
// shop's confirmation and the delivery. Checks for updates every few seconds.
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Wordmark } from '@kuhako/ui';
import { formatPeso } from '../../shared/catalog';
import { ORDER_STATUS_LABELS, normalizeReference, type OrderView } from '../../shared/order';
import { clearStoredCart, lastOrderId } from '../shop/cart';
import '../styles/shop.css';

const STEPS = ['paid', 'preparing', 'out_for_delivery', 'delivered'] as const;
const FINAL = ['delivered', 'cancelled', 'expired'];

export default function OrderPage({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState('');
  const [, tick] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/order?id=${encodeURIComponent(id)}`, { headers: { accept: 'application/json' } });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? 'We can’t find that order.');
      setOrder(data);
      return data as OrderView;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check your connection.');
      return null;
    }
  }, [id]);

  useEffect(() => {
    document.title = 'Your order · Kuha Ko';
    let stop = false;
    const poll = async () => {
      const o = await load();
      if (stop || !o || FINAL.includes(o.status)) return;
      // Waiting on the shop: check often. Otherwise now and then.
      window.setTimeout(poll, o.status === 'awaiting_confirmation' ? 10000 : 30000);
    };
    poll();
    // Keep the "held for N minutes" line current.
    const t = window.setInterval(() => tick((n) => n + 1), 30000);
    return () => {
      stop = true;
      window.clearInterval(t);
    };
  }, [load]);

  useEffect(() => {
    if (order && !['pending_payment', 'cancelled', 'expired'].includes(order.status) && lastOrderId() === order.id) clearStoredCart();
  }, [order]);

  const post = async (body: unknown) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/order?id=${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) setError(data?.error ?? 'Something went wrong. Please try again.');
      else setOrder(data);
    } catch {
      setError('Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const sendReference = (e: FormEvent) => {
    e.preventDefault();
    if (!normalizeReference(reference)) {
      setError('Check the reference number: it’s the letters and numbers on your payment receipt.');
      return;
    }
    post({ action: 'reference', reference });
  };


  const minutesLeft = order?.holdExpiresAt ? Math.max(0, Math.ceil((Date.parse(order.holdExpiresAt) - Date.now()) / 60000)) : null;
  const stepIndex = order ? STEPS.indexOf(order.status as (typeof STEPS)[number]) : -1;
  const payTo = order?.payTo;
  const qr = order?.paymentMethod === 'gcash' ? payTo?.gcashQrUrl : payTo?.qrUrl;

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
            {order.status === 'pending_payment'
              ? `Pay ${formatPeso(order.total)} to finish your order`
              : order.status === 'paid'
                ? `Salamat, ${order.customerName.split(' ')[0]}. Payment received.`
                : ORDER_STATUS_LABELS[order.status]}
          </h1>

          {order.status === 'pending_payment' && payTo ? (
            <section className="order__pay" aria-labelledby="pay-title">
              <h2 id="pay-title" className="shop-h">
                {order.paymentMethod === 'gcash' ? 'Scan with GCash' : 'Scan to pay'}
              </h2>
              {qr ? (
                <>
                  <img className="order__qr" src={qr} alt={`Kuha Ko’s ${order.paymentMethod === 'gcash' ? 'GCash QR' : 'Maya QR Ph'} code. Pay ${formatPeso(order.total)}.`} />
                  <p className="shop-note">
                    {order.paymentMethod === 'gcash'
                      ? 'Open GCash, tap Scan QR (or save this code and upload it there), and pay '
                      : 'Open Maya, GCash, GoTyme, MariBank or your bank app, scan this code (or save it and upload it in the app), and pay '}
                    <strong>exactly {formatPeso(order.total)}</strong>.
                  </p>
                  <a className="shop-link" href={qr} download={`kuha-ko-qr-${order.code}.png`} target="_blank" rel="noreferrer">
                    Save QR
                  </a>
                </>
              ) : (
                <p className="shop-note">This way to pay isn’t available right now. Please message us, or cancel and order again.</p>
              )}
              <p className="shop-note">
                Add <strong>{order.code}</strong> in the message, if your app has one.
                {minutesLeft !== null ? ` We’re holding your items for ${minutesLeft} more ${minutesLeft === 1 ? 'minute' : 'minutes'}.` : ''}
              </p>

              <form className="order__ref" onSubmit={sendReference} noValidate>
                <label className="shop-field">
                  <span>Reference number from your receipt</span>
                  <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    inputMode="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                    placeholder="e.g. 1012 345 678912"
                    maxLength={60}
                  />
                  <small>After paying, your app shows a reference number (GCash: “Ref No.”). Type it here so we can find your payment.</small>
                </label>
                {error ? (
                  <p className="shop-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <button type="submit" className="kk-button kk-button--primary shop-pay" disabled={busy}>
                  {busy ? 'Sending…' : 'I’ve paid'}
                </button>
              </form>
              <button type="button" className="shop-link" onClick={() => post({ action: 'cancel' })} disabled={busy}>
                Cancel order
              </button>
            </section>
          ) : null}

          {order.status === 'awaiting_confirmation' ? (
            <p className="order__box">
              Thanks. We’re checking your payment (reference <strong>{order.paymentReference}</strong>). This page updates by itself once
              it’s confirmed, usually within a few minutes during shop hours.
            </p>
          ) : null}
          {order.status === 'expired' ? (
            <p className="order__box">
              This order wasn’t paid within 30 minutes, so the items went back on sale. If you already paid, message us with your reference
              number and order {order.code}.
            </p>
          ) : null}
          {order.status === 'cancelled' ? (
            <p className="order__box">This order was cancelled. If you paid for it, message us with order {order.code} and we’ll sort out a refund.</p>
          ) : null}

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
          {error && order.status !== 'pending_payment' ? <p className="shop-error">{error}</p> : null}
          <a className="shop-link" href="/">
            ← Back to Kuha Ko
          </a>
        </main>
      ) : null}
    </div>
  );
}
