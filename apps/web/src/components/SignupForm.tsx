import { useId, useState, type FormEvent } from 'react';

/** "Get the live schedule": an email sign-up, kept in the admin's Sign-ups tab. */
export function SignupForm({ source, title = 'Get the live schedule' }: { source: 'live' | 'footer'; title?: string }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const website = (new FormData(e.currentTarget).get('website') as string | null) ?? '';
    setState('sending');
    setMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ email, source, website }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setState('error');
        setMessage(data?.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setState('done');
    } catch {
      setState('error');
      setMessage('Check your connection and try again.');
    }
  };

  if (state === 'done') {
    return (
      <div className="signup" role="status">
        <p className="signup__title">You’re on the list.</p>
        <p className="signup__note">We’ll email you before each live. Nothing else.</p>
      </div>
    );
  }

  return (
    <form className="signup" onSubmit={submit} noValidate>
      <label className="signup__title" htmlFor={`${id}-email`}>
        {title}
      </label>
      <p className="signup__note" id={`${id}-note`}>
        We’ll email you before each live. Nothing else.
      </p>
      <div className="signup__row">
        <input
          id={`${id}-email`}
          className="signup__input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={`${id}-note${message ? ` ${id}-error` : ''}`}
          aria-invalid={state === 'error' || undefined}
        />
        <button type="submit" className="kk-button kk-button--primary signup__button" disabled={state === 'sending'}>
          {state === 'sending' ? 'Adding…' : 'Tell me'}
        </button>
      </div>
      {/* People never see this field; bots fill it in. */}
      <input className="signup__trap" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {message ? (
        <p className="signup__error" id={`${id}-error`} role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
