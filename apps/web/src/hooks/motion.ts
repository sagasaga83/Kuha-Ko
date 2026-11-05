import { useEffect, useState, type RefObject } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/** Scroll position facts for the header: past the top, and the last direction. */
export function useScrollState() {
  const [state, setState] = useState({ scrolled: false, goingDown: false });
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - last;
        setState((s) => {
          const goingDown = Math.abs(delta) < 6 ? s.goingDown : delta > 0 && y > 240;
          const scrolled = y > 8;
          return s.scrolled === scrolled && s.goingDown === goingDown ? s : { scrolled, goingDown };
        });
        last = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return state;
}

/** True once the element has been on screen (and stays true while it is). */
export function useInView<T extends Element>(ref: RefObject<T>, rootMargin = '0px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
