// Drag a horizontal rail with the mouse, the way you'd push hangers along a rack.
// Touch and trackpads already scroll it; this only adds click-and-drag for a mouse.
// Let go mid-push and the rack keeps sliding, slowing like a real scroll; grab it again
// to stop it. A push that moved the rack isn't also a click on the piece under the mouse.
import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion, velocityTracker } from './motion';

/** Per-millisecond slowdown of a released push, the same rate as a normal scroll. */
const DECELERATION = 0.998;

export function useDragScroll(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    let moved = false;
    let glide = 0;
    const track = velocityTracker();

    const stopGlide = () => {
      cancelAnimationFrame(glide);
      glide = 0;
    };

    /** Keep moving at the release speed (px/s), decaying until it stops or hits an end. */
    const coast = (velocity: number) => {
      let v = -velocity / 1000; // px per ms, in scrollLeft's direction
      let last = performance.now();
      const step = (now: number) => {
        const dt = Math.min(now - last, 64);
        last = now;
        const before = el.scrollLeft;
        el.scrollLeft = before + v * dt;
        v *= DECELERATION ** dt;
        // Stop when it's barely moving or the rack can't go any further.
        glide = Math.abs(v) > 0.02 && el.scrollLeft !== before ? requestAnimationFrame(step) : 0;
      };
      glide = requestAnimationFrame(step);
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      stopGlide(); // catch it where it is
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      track.reset();
      track.add(e.clientX);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      // Pressed and let go outside the rack before it became a push: nothing to drag.
      if (!moved && (e.buttons & 1) === 0) {
        dragging = false;
        return;
      }
      track.add(e.clientX);
      // Only a real push takes the mouse over. Capturing on the press itself would send
      // every click to the rack instead of the button under the mouse.
      if (!moved) {
        if (Math.abs(e.clientX - startX) <= 4) return;
        moved = true;
        el.classList.add('is-dragging');
        el.setPointerCapture(e.pointerId);
      }
      el.scrollLeft = startLeft - (e.clientX - startX);
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('is-dragging');
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      const velocity = e.type === 'pointercancel' ? 0 : track.velocity();
      if (moved && Math.abs(velocity) > 50 && !prefersReducedMotion()) coast(velocity);
    };
    // Releasing a push over a piece's button would otherwise open it.
    const click = (e: MouseEvent) => {
      if (!moved) return;
      moved = false;
      e.preventDefault();
      e.stopPropagation();
    };

    const noGhost = (e: DragEvent) => e.preventDefault(); // no ghost image of the photo
    el.addEventListener('dragstart', noGhost);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('click', click, true);
    el.addEventListener('wheel', stopGlide, { passive: true });
    return () => {
      stopGlide();
      el.removeEventListener('dragstart', noGhost);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('click', click, true);
      el.removeEventListener('wheel', stopGlide);
    };
  }, [ref]);
}
