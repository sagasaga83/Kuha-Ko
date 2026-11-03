// Drag a horizontal rail with the mouse, the way you'd push hangers along a rack.
// Touch and trackpads already scroll it; this only adds click-and-drag for a mouse.
import { useEffect, type RefObject } from 'react';

export function useDragScroll(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    let startLeft = 0;
    /** The mouse is down on the rail; it becomes a drag once it moves a few pixels. */
    let pressed = false;
    let dragging = false;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      pressed = true;
      dragging = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const move = (e: PointerEvent) => {
      if (!pressed) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 5) return;
        // Only now take the pointer: capturing it on press would send a plain click to
        // the rail instead of the piece under the mouse, so pieces couldn't be opened.
        dragging = true;
        el.classList.add('is-dragging');
        el.setPointerCapture(e.pointerId);
      }
      el.scrollLeft = startLeft - dx;
    };
    const up = (e: PointerEvent) => {
      if (!pressed) return;
      pressed = false;
      if (!dragging) return;
      dragging = false;
      el.classList.remove('is-dragging');
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      // Letting go after a drag isn't a click on the piece it ends over.
      const swallow = (ev: MouseEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
      };
      el.addEventListener('click', swallow, { capture: true, once: true });
      window.setTimeout(() => el.removeEventListener('click', swallow, { capture: true }), 0);
    };

    const noGhost = (e: DragEvent) => e.preventDefault(); // no ghost image of the photo
    el.addEventListener('dragstart', noGhost);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('dragstart', noGhost);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [ref]);
}
