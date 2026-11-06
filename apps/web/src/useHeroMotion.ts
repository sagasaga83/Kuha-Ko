// The hero's words after their entrance: they hang, so they answer the page moving.
//
// Scrolling sways them on the rack's spring (useRackSway's stepSway): each word tips
// against the way the page moves, alternate words the other way so they jostle like
// hangers, and they settle with a damped swing once the page stops. Sets `--sway` on
// each word (CSS turns it into `rotate`).
//
// With a mouse or trackpad, the two lines also drift a few pixels toward the pointer,
// the italic line further, for depth. Sets `--px` and `--py` (-1 to 1) on the hero; CSS
// eases the drift. Off until `active`, and off under prefers-reduced-motion.
import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from './motion';
import { stepSway, type Sway } from './useRackSway';

const MAX = 4; // degrees: big words need only a little lean

export function useHeroMotion(ref: RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    const hero = ref.current;
    if (!hero || !active || prefersReducedMotion()) return;
    const words = Array.from(hero.querySelectorAll<HTMLElement>('.hero__word, .hero__write'));
    const states = words.map((_, i) => ({ angle: 0, velocity: 0, stiff: 0.8 + i * 0.12, sign: i % 2 ? -1 : 1 }));
    let target = 0;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let lastFrame = 0;
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(32, now - lastFrame || 16);
      lastFrame = now;
      target *= Math.pow(0.85, dt / 16); // the push fades once the page stops
      let moving = Math.abs(target) > 0.01;
      words.forEach((word, i) => {
        const s = states[i];
        const next: Sway = stepSway(s, target * s.sign, dt, s.stiff);
        s.angle = next.angle;
        s.velocity = next.velocity;
        if (Math.abs(s.angle) > 0.02 || Math.abs(s.velocity) > 0.0005) {
          moving = true;
          word.style.setProperty('--sway', `${s.angle.toFixed(2)}deg`);
        } else {
          s.angle = 0;
          s.velocity = 0;
          word.style.removeProperty('--sway');
        }
      });
      raf = moving ? requestAnimationFrame(frame) : 0;
    };

    const onScroll = () => {
      const now = performance.now();
      const speed = (window.scrollY - lastY) / Math.max(1, now - lastTime); // px per ms
      lastY = window.scrollY;
      lastTime = now;
      const lean = Math.max(-MAX, Math.min(MAX, -speed * 3.2));
      target = target * 0.6 + lean * 0.4;
      if (!raf) {
        lastFrame = now;
        raf = requestAnimationFrame(frame);
      }
    };

    // The drift follows only a real mouse or trackpad; touch screens keep the sway alone.
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = hero.getBoundingClientRect();
      const px = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      const py = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      hero.style.setProperty('--px', px.toFixed(3));
      hero.style.setProperty('--py', py.toFixed(3));
    };
    const onLeave = () => {
      hero.style.removeProperty('--px');
      hero.style.removeProperty('--py');
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    if (fine) {
      hero.addEventListener('pointermove', onPointer);
      hero.addEventListener('pointerleave', onLeave);
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      hero.removeEventListener('pointermove', onPointer);
      hero.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
      words.forEach((w) => w.style.removeProperty('--sway'));
      onLeave();
    };
  }, [ref, active]);
}
