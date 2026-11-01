import { useEffect, useState } from 'react';
import { Wordmark } from '@kuhako/ui';
import { site } from '../data/site';
import { prefersReducedMotion } from '../hooks/motion';

/** Shortest time the splash stays up, so the animation can finish. */
const MIN_MS = 1700;
/** Longest it waits for the fonts before leaving anyway. */
const MAX_MS = 3500;
/** Length of the exit (matches `.splash.is-leaving` in site.css). */
const EXIT_MS = 650;

/** Whether the splash should play: on every load, except under reduced motion. */
export function shouldShowSplash() {
  return !prefersReducedMotion();
}

/**
 * The opening screen: the wordmark, then "Kape ko. Kuha ko.", while a hairline fills.
 * The page renders underneath it; the hero's own entrance waits (`html.is-splashing`)
 * and plays as the splash lifts away. A tap, click or key press skips it.
 */
export function Splash() {
  const [phase, setPhase] = useState<'on' | 'leaving' | 'gone'>(() => (shouldShowSplash() ? 'on' : 'gone'));

  useEffect(() => {
    if (phase !== 'on') return;
    const root = document.documentElement;
    root.classList.add('is-splashing');

    let done = false;
    const leave = () => {
      if (done) return;
      done = true;
      root.classList.remove('is-splashing');
      setPhase('leaving');
    };
    const minWait = new Promise((r) => setTimeout(r, MIN_MS));
    const fonts = document.fonts?.ready ?? Promise.resolve();
    Promise.all([minWait, fonts]).then(leave);
    const cap = setTimeout(leave, MAX_MS);

    window.addEventListener('keydown', leave);
    return () => {
      clearTimeout(cap);
      window.removeEventListener('keydown', leave);
      root.classList.remove('is-splashing');
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const t = setTimeout(() => setPhase('gone'), EXIT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'gone') return null;

  return (
    <div
      className={`splash${phase === 'leaving' ? ' is-leaving' : ''}`}
      role="status"
      aria-label="Loading Kuha Ko"
      onClick={() => {
        document.documentElement.classList.remove('is-splashing');
        setPhase('leaving');
      }}
    >
      <div className="splash__inner" aria-hidden="true">
        <span className="splash__mask">
          <Wordmark className="splash__mark" style={{ fontSize: 'clamp(52px, 14vw, 88px)' }} />
        </span>
        <p className="splash__tagline">
          <span className="splash__mask">
            <span className="splash__line" style={{ animationDelay: '520ms' }}>
              Kape ko.
            </span>
          </span>{' '}
          <span className="splash__mask">
            <em className="splash__line" style={{ animationDelay: '700ms' }}>
              Kuha ko.
            </em>
          </span>
        </p>
        <span className="splash__bar" />
        <p className="label splash__label">Coffee &amp; thrift · {site.city}</p>
      </div>
    </div>
  );
}
