// The shop admin at /admin: sign in, then manage products and shop settings.
// Loaded only on /admin, so customers never download it.
import { useEffect, useState, type FormEvent } from 'react';
import { Wordmark } from '@kuhako/ui';
import { adminApi, ApiError } from './api';
import { OrdersPanel } from './OrdersPanel';
import { ProductsPanel } from './ProductsPanel';
import { SettingsPanel } from './SettingsPanel';
import './admin.css';

type Tab = 'orders' | 'products' | 'settings';
const TAB_LABELS: Record<Tab, string> = { orders: 'Orders', products: 'Products', settings: 'Settings' };

export default function Admin() {
  const [state, setState] = useState<'checking' | 'out' | 'in' | 'offline'>('checking');
  const [tab, setTab] = useState<Tab>('orders');

  useEffect(() => {
    document.title = 'Shop admin · Kuha Ko';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    adminApi
      .session()
      .then((s) => setState(s.admin ? 'in' : 'out'))
      .catch(() => setState('offline'));
    return () => robots.remove();
  }, []);

  const signOut = async () => {
    await adminApi.logout().catch(() => undefined);
    setState('out');
  };

  return (
    <div className="adm">
      <header className="adm-top">
        <a href="/" className="adm-top__brand" aria-label="Kuha Ko home">
          <Wordmark size={26} />
        </a>
        <span className="adm-top__label">Shop admin</span>
        {state === 'in' ? (
          <button type="button" className="adm-link" onClick={signOut}>
            Sign out
          </button>
        ) : null}
      </header>

      {state === 'checking' ? <p className="adm-note">Loading…</p> : null}
      {state === 'offline' ? (
        <p className="adm-error" role="alert">
          The shop server can’t be reached. If you’re running the site locally, start it with <code>vercel dev</code>.
        </p>
      ) : null}
      {state === 'out' ? <SignIn onDone={() => setState('in')} /> : null}
      {state === 'in' ? (
        <>
          <nav className="adm-tabs" aria-label="Admin sections">
            {(['orders', 'products', 'settings'] as const).map((t) => (
              <button
                key={t}
                type="button"
                className="adm-tabs__tab"
                aria-current={tab === t ? 'page' : undefined}
                onClick={() => setTab(t)}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </nav>
          <main className="adm-main">
            {tab === 'orders' ? <OrdersPanel onSignedOut={() => setState('out')} /> : null}
            {tab === 'products' ? <ProductsPanel onSignedOut={() => setState('out')} /> : null}
            {tab === 'settings' ? <SettingsPanel onSignedOut={() => setState('out')} /> : null}
          </main>
        </>
      ) : null}
    </div>
  );
}

function SignIn({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminApi.login(password);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in. Check your connection.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="adm-card adm-signin" onSubmit={submit}>
      <h1 className="adm-h1">Sign in</h1>
      <label className="adm-field">
        <span>Password</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />
      </label>
      {error ? (
        <p className="adm-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="kk-button kk-button--primary" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
