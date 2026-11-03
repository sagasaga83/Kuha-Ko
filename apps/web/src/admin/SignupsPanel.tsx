import { useEffect, useState } from 'react';
import { adminApi, guarded, type Signup } from './api';

const SOURCE: Record<string, string> = { live: 'Live page', footer: 'Footer' };

/** Everyone who asked to hear about the next live selling, to email by hand. */
export function SignupsPanel({ onSignedOut }: { onSignedOut: () => void }) {
  const [signups, setSignups] = useState<Signup[] | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const load = () =>
    guarded(() => adminApi.signups(), onSignedOut)
      .then((r) => setSignups(r.signups))
      .catch((e: Error) => setError(e.message));

  useEffect(() => {
    load(); // once, on open
  }, []);

  const copyAll = async () => {
    if (!signups?.length) return;
    try {
      await navigator.clipboard.writeText(signups.map((s) => s.email).join(', '));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy. Select the addresses below and copy them instead.');
    }
  };

  const remove = async (email: string) => {
    if (!window.confirm(`Take ${email} off the list?`)) return;
    try {
      await guarded(() => adminApi.removeSignup(email), onSignedOut);
      setSignups((cur) => cur?.filter((s) => s.email !== email) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove.');
    }
  };

  return (
    <section className="adm-card">
      <h2 className="adm-h2">
        Live schedule sign-ups {signups ? <span className="adm-count">{signups.length}</span> : null}
      </h2>
      <p className="adm-note">
        People who asked to hear before each live. Copy the list into the Bcc field of an email, so nobody sees the
        other addresses. Take someone off whenever they ask.
      </p>
      {error ? (
        <p className="adm-error" role="alert">
          {error}
        </p>
      ) : null}
      {signups === null && !error ? <p className="adm-note">Loading…</p> : null}
      {signups?.length === 0 ? <p className="adm-note">No sign-ups yet.</p> : null}
      {signups?.length ? (
        <>
          <div className="adm-actions">
            <button type="button" className="kk-button kk-button--secondary" onClick={copyAll}>
              {copied ? 'Copied' : 'Copy all addresses'}
            </button>
          </div>
          <ul className="adm-signups">
            {signups.map((s) => (
              <li key={s.email}>
                <span className="adm-signups__email">{s.email}</span>
                <span className="adm-signups__meta">
                  {SOURCE[s.source] ?? s.source} ·{' '}
                  {new Date(s.createdAt).toLocaleDateString('en-PH', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <button type="button" className="adm-link" onClick={() => remove(s.email)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
