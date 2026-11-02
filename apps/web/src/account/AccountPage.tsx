// /account: sign in (Clerk), then the customer's orders and the details we fill
// in for them at checkout. An account is optional: guests can still order.
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { SignIn, SignUp } from '@clerk/react';
import { Wordmark } from '@kuhako/ui';
import { formatPeso } from '../../shared/catalog';
import { ORDER_STATUS_LABELS, normalizePhone, type AccountView, type Profile } from '../../shared/order';
import { AddressPicker } from '../shop/AddressPicker';
import { authHeaders, useAccount } from './auth';
import '../styles/shop.css';

/** The sign-up form has its own page, so Clerk's links between steps always land on a real one. */
export const SIGN_UP_PATH = '/account/sign-up';
const isSignUpPage = () => window.location.pathname.replace(/\/+$/, '') === SIGN_UP_PATH;

const dateFormat = new Intl.DateTimeFormat('en-PH', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AccountPage() {
  const account = useAccount();

  useEffect(() => {
    document.title = account.status === 'signed-in' ? 'Your account · Kuha Ko' : isSignUpPage() ? 'Create an account · Kuha Ko' : 'Sign in · Kuha Ko';
  }, [account.status]);

  return (
    <div className="order account">
      <header className="order__top">
        <a href="/" aria-label="Kuha Ko home">
          <Wordmark size={30} />
        </a>
      </header>
      <main>
        {account.status === 'off' ? (
          <>
            <h1 className="order__status">Accounts are coming soon</h1>
            <p>You can still order as a guest: add something to your cart and check out.</p>
          </>
        ) : account.status === 'loading' ? (
          <p className="shop-note">Loading…</p>
        ) : account.status === 'signed-out' && isSignUpPage() ? (
          <>
            <h1 className="order__status">Create your Kuha Ko account</h1>
            <p className="account__lede">
              Keep your delivery details for next time and see all your orders in one place. You can always order as a guest instead.
            </p>
            <div className="account__signin">
              <SignUp routing="hash" signInUrl="/account" />
            </div>
          </>
        ) : account.status === 'signed-out' ? (
          <>
            <h1 className="order__status">Sign in to Kuha Ko</h1>
            <p className="account__lede">
              Keep your delivery details for next time and see all your orders in one place. You can always order as a guest instead.
            </p>
            <div className="account__signin">
              <SignIn routing="hash" signUpUrl={SIGN_UP_PATH} />
            </div>
          </>
        ) : (
          <SignedIn />
        )}
        <a className="shop-link" href="/">
          ← Back to Kuha Ko
        </a>
      </main>
    </div>
  );
}

function SignedIn() {
  const account = useAccount();
  const [view, setView] = useState<AccountView | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/account', { headers: await authHeaders(account, false) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? 'We couldn’t load your account.');
      setView(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check your connection and try again.');
    }
  }, [account]);

  useEffect(() => {
    load();
  }, [load]);

  const first = (view?.profile.name || account.name).split(' ')[0];

  return (
    <>
      <p className="order__code">Your account</p>
      <h1 className="order__status">{first ? `Hi, ${first}` : 'Hi there'}</h1>
      {error ? (
        <p className="shop-error" role="alert">
          {error}
        </p>
      ) : null}
      {!view && !error ? <p className="shop-note">Loading your orders…</p> : null}

      {view ? (
        <>
          <section aria-labelledby="orders-title">
            <h2 id="orders-title" className="shop-h">
              Your orders
            </h2>
            {view.orders.length === 0 ? (
              <p className="shop-note">No orders yet. Orders you place while signed in show up here.</p>
            ) : (
              <ul className="account__orders">
                {view.orders.map((o) => (
                  <li key={o.id}>
                    <a className="account__order" href={`/order/${o.id}`}>
                      <span className="account__order-head">
                        <span className="order__code">{o.code}</span>
                        <span className="account__order-status" data-status={o.status}>
                          {ORDER_STATUS_LABELS[o.status]}
                        </span>
                      </span>
                      <span className="account__order-summary">{o.summary}</span>
                      <span className="account__order-foot">
                        <span>{dateFormat.format(new Date(o.createdAt))}</span>
                        <span className="account__order-total">{formatPeso(o.total)}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <DetailsForm profile={view.profile} fallbackEmail={account.email} onSaved={setView} />
        </>
      ) : null}

      <button type="button" className="shop-link account__signout" onClick={() => account.signOut()}>
        Sign out
      </button>
    </>
  );
}

function DetailsForm({
  profile,
  fallbackEmail,
  onSaved,
}: {
  profile: Profile;
  fallbackEmail: string;
  onSaved: (view: AccountView) => void;
}) {
  const account = useAccount();
  const [p, setP] = useState<Profile>({ ...profile, email: profile.email || fallbackEmail });
  const [state, setState] = useState<{ busy: boolean; message: string; error: string }>({ busy: false, message: '', error: '' });
  const set = (patch: Partial<Profile>) => {
    setP((cur) => ({ ...cur, ...patch }));
    setState((s) => ({ ...s, message: '' }));
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (p.phone.trim() && !normalizePhone(p.phone)) {
      return setState({ busy: false, message: '', error: 'Check your mobile number: it should look like 0917 123 4567.' });
    }
    setState({ busy: true, message: '', error: '' });
    try {
      const res = await fetch('/api/account', { method: 'PUT', headers: await authHeaders(account), body: JSON.stringify(p) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? 'We couldn’t save your details.');
      onSaved(data);
      setState({ busy: false, message: 'Saved. We’ll fill these in when you check out.', error: '' });
    } catch (err) {
      setState({ busy: false, message: '', error: err instanceof Error ? err.message : 'Check your connection and try again.' });
    }
  };

  return (
    <form className="account__details" onSubmit={save} noValidate>
      <h2 className="shop-h">Checkout details</h2>
      <p className="shop-note">We fill these in when you check out, and update them each time you order.</p>
      <label className="shop-field">
        <span>Name</span>
        <input value={p.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" maxLength={80} />
      </label>
      <label className="shop-field">
        <span>Mobile number</span>
        <input
          value={p.phone}
          onChange={(e) => set({ phone: e.target.value })}
          autoComplete="tel"
          inputMode="tel"
          placeholder="0917 123 4567"
          maxLength={20}
        />
      </label>
      <label className="shop-field">
        <span>Email for receipts</span>
        <input
          type="email"
          value={p.email}
          onChange={(e) => set({ email: e.target.value })}
          autoComplete="email"
          inputMode="email"
          maxLength={120}
        />
      </label>
      <h3 className="shop-h">Deliver to</h3>
      <AddressPicker address={p.address} onAddress={(address) => set({ address })} pin={p.pin} onPin={(pin) => set({ pin })} />
      <label className="shop-field">
        <span>Notes for the rider (optional)</span>
        <input value={p.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Landmark, gate colour, floor" maxLength={300} />
      </label>
      {state.error ? (
        <p className="shop-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="shop-note" role="status">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="kk-button kk-button--primary" disabled={state.busy}>
        {state.busy ? 'Saving…' : 'Save details'}
      </button>
    </form>
  );
}
