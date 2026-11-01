import { useEffect, useId, useRef, useState } from 'react';
import { prefersReducedMotion } from '../hooks/motion';
import { currentTheme, setTheme, type Theme } from '../theme';

/** How long into the pull the switch "clicks" and the theme changes. */
const CLICK_MS = 160;
/** Longest of the pull animations (the swing), so the class can be cleared. */
const PULL_MS = 1300;

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

/**
 * Switches the theme with a slow, even cross-fade where the browser supports view
 * transitions (and motion is allowed); otherwise it just switches. No reveal shapes
 * or quick changes, so nothing flashes (photosensitive epilepsy).
 */
function switchTheme(apply: () => void) {
  const doc = document as ViewTransitionDoc;
  if (!doc.startViewTransition || prefersReducedMotion()) {
    apply();
    return;
  }
  const root = document.documentElement;
  root.classList.add('lamp-vt');
  doc
    .startViewTransition(apply)
    .finished.catch(() => undefined)
    .finally(() => root.classList.remove('lamp-vt'));
}

/**
 * A vintage pendant lamp with a beaded pull chain: the theme switch.
 * Lamp on = dark mode (evening), lamp off = light mode.
 */
export function ThemeLamp({ className = '', onChange }: { className?: string; onChange?: (theme: Theme) => void }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [pulling, setPulling] = useState(false);
  const timers = useRef<number[]>([]);
  const id = useId().replace(/:/g, '');

  useEffect(() => {
    // Stay in step when the theme changes elsewhere (another switch, or the device setting).
    const sync = () => setThemeState(currentTheme());
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    mq?.addEventListener?.('change', sync);
    return () => {
      mo.disconnect();
      mq?.removeEventListener?.('change', sync);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const on = theme === 'dark';

  const pull = () => {
    const next: Theme = on ? 'light' : 'dark';
    const reduced = prefersReducedMotion();
    setPulling(false);
    // Restart the animation even on quick repeat pulls.
    requestAnimationFrame(() => setPulling(true));
    timers.current.forEach(clearTimeout);
    timers.current = [
      window.setTimeout(
        () =>
          switchTheme(() => {
            setTheme(next);
            setThemeState(next);
            onChange?.(next);
          }),
        reduced ? 0 : CLICK_MS,
      ),
      window.setTimeout(() => setPulling(false), PULL_MS),
    ];
  };

  return (
    <button
      type="button"
      className={`lamp${on ? ' is-on' : ''}${pulling ? ' is-pulling' : ''} ${className}`.trim()}
      onClick={pull}
      aria-pressed={on}
      aria-label={on ? 'Lamp on (dark mode). Pull the chain to turn it off.' : 'Lamp off (light mode). Pull the chain to turn it on.'}
      title={on ? 'Pull for light mode' : 'Pull for dark mode'}
    >
      <svg className="lamp__svg" viewBox="0 0 40 64" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0" className="lamp__glow-stop" stopOpacity="0.55" />
            <stop offset="1" className="lamp__glow-stop" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="lamp__glow-stop" stopOpacity="0.28" />
            <stop offset="1" className="lamp__glow-stop" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="lamp__swing">
          {/* light: the beam and the halo, shown when on */}
          <g className="lamp__light">
            <path d="M9 32 L0 64 H40 L31 32 Z" fill={`url(#${id}-beam)`} />
            <circle cx="20" cy="33" r="12" fill={`url(#${id}-glow)`} />
          </g>
          {/* cord from the ceiling and the brass fitting */}
          <path className="lamp__line" d="M20 0 V14" />
          <rect className="lamp__fitting" x="17" y="13.5" width="6" height="5.5" rx="0.6" />
          {/* bulb, half under the shade */}
          <circle className="lamp__bulb" cx="20" cy="33" r="4" />
          {/* enamel bell shade with a flared rim */}
          <path className="lamp__shade" d="M9 31.5 C9 23 13 19 20 19 C27 19 31 23 31 31.5 Z" />
          <path className="lamp__line" d="M6.5 31.5 H33.5" />
          {/* beaded pull chain and its knob */}
          <g className="lamp__chain">
            <path className="lamp__beads" d="M28 33 V49" />
            <path className="lamp__knob" d="M28 49.5 c1.6 0 2.4 1.4 2.4 2.6 a2.4 2.4 0 0 1 -4.8 0 c0 -1.2 .8 -2.6 2.4 -2.6 Z" />
          </g>
        </g>
      </svg>
    </button>
  );
}
