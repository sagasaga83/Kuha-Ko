// Whether a block is on screen, for entrances that replay on every scroll in.
// 'static' where the scroll can't be watched or the reader prefers less motion (show
// everything, animate nothing); otherwise 'out' until the block is a little way inside
// the screen, 'in' while it's there, and back to 'out' only once it has left the screen
// entirely, so the reset happens out of sight. Waits for the opening splash to lift.
import { useEffect, useState, type RefObject } from 'react';
import { prefersReducedMotion } from './motion';

export type ScrollIn = 'static' | 'out' | 'in';

const canWatch = () => typeof IntersectionObserver !== 'undefined' && !prefersReducedMotion();

export function useScrollIn(ref: RefObject<Element>, enterMargin = '-15% 0px -12% 0px'): ScrollIn {
  const [state, setState] = useState<ScrollIn>(() => (canWatch() ? 'out' : 'static'));

  useEffect(() => {
    const el = ref.current;
    if (!el || state === 'static') return;
    const enter = new IntersectionObserver(([e]) => e?.isIntersecting && setState('in'), { rootMargin: enterMargin });
    const leave = new IntersectionObserver(([e]) => e && !e.isIntersecting && setState('out'));
    const html = document.documentElement;
    let wait: MutationObserver | undefined;
    const start = () => {
      enter.observe(el);
      leave.observe(el);
    };
    if (html.classList.contains('is-splashing')) {
      wait = new MutationObserver(() => {
        if (html.classList.contains('is-splashing')) return;
        wait?.disconnect();
        start();
      });
      wait.observe(html, { attributes: true, attributeFilter: ['class'] });
    } else start();
    return () => {
      enter.disconnect();
      leave.disconnect();
      wait?.disconnect();
    };
    // `state` is read only for the 'static' check, and it never changes to or from 'static'.
  }, [ref, enterMargin]);

  return state;
}
