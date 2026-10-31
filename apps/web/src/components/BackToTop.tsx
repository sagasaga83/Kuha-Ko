import { useEffect, useState, type CSSProperties } from 'react';
import { prefersReducedMotion } from '../hooks/motion';

/** Appears after the first screen; its bottom edge fills as you read down the page. */
export function BackToTop() {
  const [state, setState] = useState({ shown: false, progress: 0 });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const shown = y > window.innerHeight * 0.9;
      const progress = max > 0 ? Math.min(1, y / max) : 0;
      setState((s) => (s.shown === shown && Math.abs(s.progress - progress) < 0.005 ? s : { shown, progress }));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    // Send keyboard focus back to the start of the page too.
    document.querySelector<HTMLElement>('.site-header__home')?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      className={`to-top${state.shown ? ' is-shown' : ''}`}
      onClick={goTop}
      tabIndex={state.shown ? 0 : -1}
      aria-hidden={!state.shown || undefined}
      style={{ '--p': state.progress } as CSSProperties}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
      Top
      <span className="visually-hidden">, back to the top of the page</span>
    </button>
  );
}
