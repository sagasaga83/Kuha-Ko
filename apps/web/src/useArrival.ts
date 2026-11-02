// The first time a rack scrolls into view, its pieces arrive: 'waiting' until then,
// 'arriving' while their entrance animations play, 'arrived' once every piece has
// finished. Where the browser can't watch the scroll, or the reader prefers less motion,
// everything has simply arrived.
import { useEffect, useState, type RefObject } from 'react';

export type Arrival = 'waiting' | 'arriving' | 'arrived';

const canWait = () =>
  typeof IntersectionObserver !== 'undefined' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function useArrival(ref: RefObject<Element>, threshold = 0.25): Arrival {
  const [state, setState] = useState<Arrival>(() => (canWait() ? 'waiting' : 'arrived'));

  useEffect(() => {
    const el = ref.current;
    if (state !== 'waiting' || !el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState('arriving');
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, state, threshold]);

  useEffect(() => {
    const el = ref.current;
    if (state !== 'arriving' || !el) return;
    const finished = new Set<EventTarget>();
    const onEnd = (e: Event) => {
      if (e.target instanceof Element && e.target.parentElement === el) finished.add(e.target);
      if (finished.size >= el.children.length) setState('arrived');
    };
    el.addEventListener('animationend', onEnd);
    el.addEventListener('animationcancel', onEnd);
    return () => {
      el.removeEventListener('animationend', onEnd);
      el.removeEventListener('animationcancel', onEnd);
    };
  }, [ref, state]);

  return state;
}
