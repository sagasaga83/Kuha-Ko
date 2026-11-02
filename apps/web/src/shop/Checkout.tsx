import { useEffect, useRef, useState, type FormEvent } from 'react';
import { formatPeso } from '../../shared/catalog';
import { PAYMENT_OPTIONS, normalizePhone, type AccountView, type PaymentMethod } from '../../shared/order';
import { authHeaders, useAccount, type Account } from '../account/auth';
import { useCatalog } from '../catalog/catalog';
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
  paymentMethod: PaymentMethod;
}

function readDetails(): Details {
  const blank: Details = { name: '', phone: '', email: '', address: '', notes: '', pin: null, paymentMethod: 'gcash' };
  try {
    const saved = { ...blank, ...JSON.parse(localStorage.getItem(DETAILS) ?? '{}') };
    // A method we no longer offer falls back to the default.
    if (!PAYMENT_OPTIONS.some((o) => o.id === saved.paymentMethod)) saved.paymentMethod = blank.paymentMethod;
    return saved;
  } catch {
    return blank;
  }
}

type QuoteState =
  | { state: 'none' }
  | { state: 'loading' }
  | { state: 'ok'; fee: number; distanceM: number; estimated: boolean }
  | { state: 'error'; message: string };

async function postJson(url: string, body: unknown, account?: Account) {
  const headers = account ? await authHeaders(account) : { 'content-type': 'application/json', accept: 'application/json' };
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : null;
  return { ok: res.ok, status: res.status, data };
}

export function Checkout({ cart, onBack }: { cart: Cart; onBack: () => void }) {
  const { paymentMethods } = useCatalog();
  const options = PAYMENT_OPTIONS.filter((o) => paymentMethods.includes(o.id));
  const [d, setD] = useState<Details>(readDetails);
  // The remembered choice may not be offered any more.
  const method = options.some((o) => o.id === d.paymentMethod) ? d.paymentMethod : (options[0]?.id ?? d.paymentMethod);
  const [quote, setQuote] = useState<QuoteState>({ state: 'none' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const quoteSeq = useRef(0);
  const account = useAccount();

  // Signed in: fill in the details saved on the account (they win over this device's).
  useEffect(() => {
    if (account.status !== 'signed-in') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/account', { headers: await authHeaders(account, false) });
        if (!res.ok || cancelled) return;
        const { profile } = (await res.json()) as AccountView;
        const saved: Partial<Details> = {};
        if (profile.name) saved.name = profile.name;
        if (profile.phone) saved.phone = profile.phone.replace(/^\+63/, '0');
        if (profile.email || account.email) saved.email = profile.email || account.email;
        if (profile.address) saved.address = profile.address;
        if (profile.notes) saved.notes = profile.notes;
        if (profile.pin) saved.pin = profile.pin;
        if (!cancelled) setD((cur) => ({ ...cur, ...saved }));
      } catch {
        // Not fatal: they can type their details.
      }
    })();
    return () => {
      cancelled = true;
    };
    // Once per sign-in, not on every token refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.status]);

  // Remember details on this device for next time (not the pin: people order from different places).
  useEffect(() => {
    try {
      localStorage.setItem(DETAILS, JSON.stringify({ name: d.name, phone: d.phone, email: d.email, address: d.address, notes: d.notes, pin: d.pin, paymentMethod: d.paymentMethod }));
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
        paymentMethod: method,
      }, account);
      if (!r.ok) {
        setError(r.data?.error ?? 'Something went wrong. Please try again.');
        setBusy(false);
        return;
      }
      rememberOrder(r.data.orderId);
      window.location.assign(`/order/${r.data.orderId}`);
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
      {account.status === 'signed-in' ? (
        <p className="shop-note">Signed in. We’ll keep these details on your account for next time.</p>
      ) : account.status === 'signed-out' ? (
        <p className="shop-note">
          <a className="shop-link" href="/account">
            Sign in
          </a>{' '}
          to use your saved details and keep this order on your account. Or just carry on as a guest.
        </p>
      ) : null}
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

      <fieldset className="shop-pay-methods">
        <legend className="shop-h">Payment method</legend>
        {options.map((o) => (
          <label key={o.id} className="shop-pay-method">
            <input
              type="radio"
              name="payment-method"
              value={o.id}
              checked={method === o.id}
              onChange={() => set({ paymentMethod: o.id })}
            />
            <span className="shop-pay-method__text">
              <span className="shop-pay-method__label">{o.label}</span>
              {o.note ? <span className="shop-pay-method__note">{o.note}</span> : null}
            </span>
          </label>
        ))}
      </fieldset>

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
        {busy ? 'Placing your order…' : fee === null ? 'Place order' : `Place order · ${formatPeso(cart.subtotal + fee)}`}
      </button>
      <p className="shop-note shop-center">
        Next you’ll see how to pay. We hold your items for 30 minutes.
      </p>
    </form>
  );
}
