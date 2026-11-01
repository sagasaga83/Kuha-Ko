// Orders in the admin: confirm payments (find the reference in GCash or the bank
// app first), then move each order along to delivered. Refreshes every 30 seconds.
import { useCallback, useEffect, useState } from 'react';
import { formatPeso } from '../../shared/catalog';
import { ORDER_STATUS_LABELS } from '../../shared/order';
import { adminApi, guarded, type AdminOrder, type OrderAction } from './api';

const METHOD: Record<string, string> = { gcash: 'GCash', qrph: 'Maya (QR Ph)' };

/** The next step for an order, as buttons. */
function actionsFor(o: AdminOrder): { action: OrderAction; label: string; primary?: boolean; confirm?: string }[] {
  switch (o.status) {
    case 'awaiting_confirmation':
      return [
        { action: 'confirm', label: 'Mark as paid', primary: true },
        { action: 'reject', label: 'Payment not found', confirm: `Cancel ${o.code} and put its items back on sale?` },
      ];
    case 'pending_payment':
      return [{ action: 'confirm', label: 'Mark as paid', confirm: `${o.code} hasn’t sent a reference yet. Mark it paid anyway?` }];
    case 'paid':
      return [{ action: 'preparing', label: 'Preparing', primary: true }];
    case 'preparing':
      return [{ action: 'out_for_delivery', label: 'Out for delivery', primary: true }];
    case 'out_for_delivery':
      return [{ action: 'delivered', label: 'Delivered', primary: true }];
    default:
      return [];
  }
}

const time = (iso: string) => new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export function OrdersPanel({ onSignedOut }: { onSignedOut: () => void }) {
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(
    () =>
      guarded(() => adminApi.orders(filter), onSignedOut)
        .then((r) => {
          setOrders(r.orders);
          setError('');
        })
        .catch((e: Error) => setError(e.message)),
    [filter, onSignedOut],
  );

  useEffect(() => {
    load();
    const t = window.setInterval(load, 30000);
    return () => window.clearInterval(t);
  }, [load]);

  const act = async (o: AdminOrder, a: ReturnType<typeof actionsFor>[number]) => {
    if (a.confirm && !window.confirm(a.confirm)) return;
    setBusy(o.id);
    try {
      await guarded(() => adminApi.updateOrder(o.id, a.action), onSignedOut);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the order.');
    } finally {
      setBusy('');
    }
  };

  const toCheck = orders?.filter((o) => o.status === 'awaiting_confirmation').length ?? 0;

  return (
    <>
      <div className="adm-actions">
        <button type="button" className="adm-tabs__tab" aria-current={filter === 'open' ? 'page' : undefined} onClick={() => setFilter('open')}>
          Open
        </button>
        <button type="button" className="adm-tabs__tab" aria-current={filter === 'all' ? 'page' : undefined} onClick={() => setFilter('all')}>
          All
        </button>
        <button type="button" className="adm-link" onClick={load}>
          Refresh
        </button>
      </div>
      {toCheck > 0 ? (
        <p className="adm-alert" role="status">
          {toCheck} {toCheck === 1 ? 'payment' : 'payments'} to check
        </p>
      ) : null}
      {error ? (
        <p className="adm-error" role="alert">
          {error}
        </p>
      ) : null}
      {orders === null && !error ? <p className="adm-note">Loading orders…</p> : null}
      {orders?.length === 0 ? <p className="adm-note">{filter === 'open' ? 'No open orders.' : 'No orders yet.'}</p> : null}
      <ul className="adm-orders">
        {orders?.map((o) => (
          <li key={o.id} className="adm-order" data-status={o.status}>
            <div className="adm-order__head">
              <span className="adm-order__code">{o.code}</span>
              <span className="adm-order__status">{ORDER_STATUS_LABELS[o.status]}</span>
              <span className="adm-order__time">{time(o.createdAt)}</span>
            </div>

            {o.status === 'awaiting_confirmation' || o.status === 'pending_payment' ? (
              <dl className="adm-order__pay">
                <div>
                  <dt>{METHOD[o.paymentMethod] ?? o.paymentMethod}</dt>
                  <dd className="adm-order__amount">{formatPeso(o.total)}</dd>
                </div>
                <div>
                  <dt>Reference</dt>
                  <dd className="adm-order__ref">{o.paymentReference ?? 'Not sent yet'}</dd>
                </div>
                {o.holdExpiresAt ? (
                  <div>
                    <dt>Held until</dt>
                    <dd>{time(o.holdExpiresAt)}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
            {o.status === 'awaiting_confirmation' ? (
              <p className="adm-note">Find {formatPeso(o.total)} with this reference in your {METHOD[o.paymentMethod]} or bank app before marking it paid.</p>
            ) : null}

            <ul className="adm-order__items">
              {o.items.map((i, n) => (
                <li key={n}>
                  {i.quantity} × {i.name}
                  {i.choices.length ? <span> · {i.choices.map((c) => c.value).join(', ')}</span> : null}
                </li>
              ))}
            </ul>
            <p className="adm-order__totals">
              Items {formatPeso(o.subtotal)} · Delivery {formatPeso(o.deliveryFee)} ({(o.distanceM / 1000).toFixed(1)} km) ·{' '}
              <strong>{formatPeso(o.total)}</strong>
            </p>
            <p className="adm-order__who">
              <strong>{o.customerName}</strong> · <a href={`tel:${o.customerPhone}`}>{o.customerPhone.replace(/^\+63/, '0')}</a>
              <br />
              {o.address}
              {o.addressNotes ? <span className="adm-note"> · {o.addressNotes}</span> : null}
              <br />
              <a href={`https://www.google.com/maps/search/?api=1&query=${o.lat},${o.lng}`} target="_blank" rel="noreferrer">
                Open the pin in Google Maps
              </a>
            </p>

            <div className="adm-actions">
              {actionsFor(o).map((a) => (
                <button
                  key={a.action}
                  type="button"
                  className={`kk-button ${a.primary ? 'kk-button--primary' : 'kk-button--secondary'}`}
                  disabled={busy === o.id}
                  onClick={() => act(o, a)}
                >
                  {a.label}
                </button>
              ))}
              {['paid', 'preparing', 'out_for_delivery'].includes(o.status) ? (
                <button
                  type="button"
                  className="adm-link adm-link--danger"
                  disabled={busy === o.id}
                  onClick={() => act(o, { action: 'cancel', label: 'Cancel', confirm: `Cancel ${o.code}? Refund the customer yourself in GCash or your bank app.` })}
                >
                  Cancel order
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
