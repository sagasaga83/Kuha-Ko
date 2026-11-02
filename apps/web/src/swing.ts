// Things that hang (rack pieces, price tags) swing when a hand reaches them. The motion
// itself is CSS (`.is-swinging`); this restarts it so every touch gets a fresh swing.
import type { FocusEvent, PointerEvent } from 'react';

export function swing(el: Element | null) {
  if (!el) return;
  el.classList.remove('is-swinging');
  void (el as HTMLElement).offsetWidth; // restart the animation
  el.classList.add('is-swinging');
}

/** Spread on the element that hangs: hover, a tap or keyboard focus sets it swinging. */
export const swingOnTouch = {
  onPointerEnter: (e: PointerEvent<HTMLElement>) => swing(e.currentTarget),
  onPointerDown: (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') swing(e.currentTarget);
  },
  onFocus: (e: FocusEvent<HTMLElement>) => swing(e.currentTarget),
};
