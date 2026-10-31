import { useEffect, useRef, useState, type FormEvent } from 'react';
import { formatPeso } from '../../shared/catalog';
import { normalizePhone } from '../../shared/order';
import { AddressPicker, type Pin } from './AddressPicker';
import { rememberOrder, type Cart } from './cart';

const DETAILS = 'kuhako-checkout';

interface Details {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  pin: Pin | null;
}

function readDetails(): Details {
  const blank = { name: '', phone: '', email: '', address: '', notes: '', pin: null };
  try {
    return { ...blank, ...JSON.parse(localStorage.getItem(DETAILS) ?? '{}') };
  } catch {
    return blank;
  }
}

type QuoteState =
  | { state: 'none' }
  | { state: 'loading' }
  | { state: 'ok'; fee: number; distanceM: number; estimated: boolean }
  | { state: 'error'; message: string };

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(body) });
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : null;
  return { ok: res.ok, status: res.status, data };
}

export function Checkout({ cart, onBack }: { cart: Cart; onBack: () => void }) {
  const [d, setD] = useState<Details>(readDetails);
  const [quote, setQuote] = useState<QuoteState>({ state: 'none' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const quoteSeq = useRef(0);

  // Remember details on this device for next time (not the pin: people order from different places).
  useEffect(() => {
    try {
      localStorage.setItem(DETAILS, JSON.stringify({ name: d.name, phone: d.phone, email: d.email, address: d.address, notes: d.notes, pin: d.pin }));
    } catch {
      // ignore
    }
  }, [d]);

  useEffect(() => {
    if (!d.pin) return;
    const seq = ++quoteSeq.current;
    setQuote({ state: 'loading' });
    postJson('/api/quote', d.pin)
      .then((r) => {
        if (seq !== quoteSeq.current) return; // a newer pin is being quoted
        if (r.ok) setQuote({ state: 'ok', ...r.data });
        else setQuote({ state: 'error', message: r.data?.error ?? 'We couldn’t work out the delivery fee.' });
      })
      .catch(() => seq === quoteSeq.current && setQuote({ state: 'error', message: 'Check your connection and try again.' }));
  }, [d.pin]);

  const set = (patch: Partial<Details>) => setD((cur) => ({ ...cur, ...patch }));
  const fee = quote.state === 'ok' ? quote.fee : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!cart.ready) return setError('Please fix the items marked in your order first.');
    if (d.name.trim().length < 2) return setError('Add your name.');
    if (!normalizePhone(d.phone)) return setError('Check your mobile number: it should look like 0917 123 4567.');
    if (!d.pin) return setError('Set your delivery spot on the map, or use your current location.');
    if (d.address.trim().length < 5) return setError('Add your delivery address.');
    if (quote.state !== 'ok') return setError(quote.state === 'error' ? quote.message : 'Wait a moment while we work out the delivery fee.');
    setBusy(true);
    try {
      const r = await postJson('/api/checkout', {
        items: cart.lines.map(({ productId, quantity, choices }) => ({ productId, quantity, choices })),
        customer: { name: d.name, phone: d.phone, email: d.email },
        address: { text: d.address, lat: d.pin.lat, lng: d.pin.lng, notes: d.notes },
      });
      if (!r.ok) {
        setError(r.data?.error ?? 'Something went wrong. Please try again.');
        setBusy(false);
        return;
      }
      rememberOrder(r.data.orderId);
      window.location.assign(r.data.checkoutUrl);
    } catch {
      setError('Check your connection and try again.');
      setBusy(false);
    }
  };

  return (
    <form className="shop-checkout" onSubmit={submit} noValidate>
      <button type="button" className="shop-link" onClick={onBack}>
        ← Back to your order
      </button>

      <h3 className="shop-h">Your details</h3>
      <label className="shop-field">
        <span>Name</span>
        <input value={d.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" maxLength={80} />
      </label>
      <label className="shop-field">
        <span>Mobile number</span>
        <input
          value={d.phone}
          onChange={(e) => set({ phone: e.target.value })}
          autoComplete="tel"
          inputMode="tel"
          placeholder="0917 123 4567"
          maxLength={20}
        />
        <small>The rider calls this number when they arrive.</small>
      </label>
      <label className="shop-field">
        <span>Email (optional)</span>
        <input
          type="email"
          value={d.email}
          onChange={(e) => set({ email: e.target.value })}
          autoComplete="email"
          inputMode="email"
          maxLength={120}
        />
        <small>For your receipt.</small>
      </label>

      <h3 className="shop-h">Deliver to</h3>
      <p className="shop-note">We deliver around Iloilo City.</p>
      <AddressPicker address={d.address} onAddress={(address) => set({ address })} pin={d.pin} onPin={(pin) => set({ pin })} />
      <label className="shop-field">
        <span>Notes for the rider (optional)</span>
        <input
          value={d.notes}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder="Landmark, gate colour, floor"
          maxLength={300}
        />
      </label>

      <dl className="shop-totals">
        <div>
          <dt>Items</dt>
          <dd>{formatPeso(cart.subtotal)}</dd>
        </div>
        <div>
          <dt>
            Delivery
            {quote.state === 'ok' ? <small>{(quote.distanceM / 1000).toFixed(1)} km{quote.estimated ? ', estimated' : ''}</small> : null}
          </dt>
          <dd>
            {quote.state === 'ok'
              ? formatPeso(quote.fee)
              : quote.state === 'loading'
                ? 'Working it out…'
                : quote.state === 'error'
                  ? '—'
                  : 'Set your spot'}
          </dd>
        </div>
        <div className="shop-totals__total">
          <dt>Total</dt>
          <dd>{fee === null ? '—' : formatPeso(cart.subtotal + fee)}</dd>
        </div>
      </dl>
      {quote.state === 'error' ? (
        <p className="shop-error" role="alert">
          {quote.message}
        </p>
      ) : null}
      {error ? (
        <p className="shop-error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="kk-button kk-button--primary shop-pay" disabled={busy}>
        {busy ? 'Opening payment…' : fee === null ? 'Continue to payment' : `Pay ${formatPeso(cart.subtotal + fee)}`}
      </button>
      <p className="shop-note shop-center">Pay with GCash, Maya or QR Ph (GoTyme, MariBank and any bank app) on PayMongo’s secure page.</p>
    </form>
  );
}
