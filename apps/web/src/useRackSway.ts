// Scrolling the rack sways the pieces, like hangers pushed along a rail: each garment
// tips back against the way the rack moves, its tag swings a little further, and when
// the rack stops they settle with a damped swing. Each piece springs slightly
// differently so they don't move in lockstep. Sets `--sway` on every `.hang` (CSS
// turns it into `rotate`). Off under prefers-reduced-motion.
import { useEffect, type RefObject } from 'react';

export interface Sway {
  angle: number; // degrees
  velocity: number; // degrees per ms
}

const MAX = 9; // degrees
const STIFFNESS = 3.9e-5; // per ms²: about a one-second swing
const DAMPING = 2.5e-3; // per ms: a few swings, then still

/** How far the pieces lean for a scroll speed in px/ms (positive = rack slides left). */
export function swayTarget(speed: number): number {
  const lean = -speed * 6;
  return lean === 0 ? 0 : Math.max(-MAX, Math.min(MAX, lean));
}

/** One step of a damped spring pulling the piece toward `target`. */
export function stepSway(s: Sway, target: number, dt: number, stiff = 1): Sway {
  const accel = STIFFNESS * stiff * (target - s.angle) - DAMPING * s.velocity;
  const velocity = s.velocity + accel * dt;
  return { angle: s.angle + velocity * dt, velocity };
}

export function useRackSway(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const states = new Map<Element, Sway & { stiff: number }>();
    let target = 0;
    let lastLeft = el.scrollLeft;
    let lastTime = performance.now();
    let lastFrame = 0;
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(32, now - lastFrame || 16);
      lastFrame = now;
      target *= Math.pow(0.88, dt / 16); // the push fades once the rack stops
      let moving = Math.abs(target) > 0.01;
      el.querySelectorAll<HTMLElement>('.hang').forEach((piece, i) => {
        const s = states.get(piece) ?? { angle: 0, velocity: 0, stiff: 0.85 + ((i * 7) % 6) * 0.06 };
        Object.assign(s, stepSway(s, target, dt, s.stiff));
        states.set(piece, s);
        if (Math.abs(s.angle) > 0.02 || Math.abs(s.velocity) > 0.0005) {
          moving = true;
          piece.style.setProperty('--sway', `${s.angle.toFixed(2)}deg`);
        } else {
          s.angle = 0;
          s.velocity = 0;
          piece.style.removeProperty('--sway');
        }
      });
      raf = moving ? requestAnimationFrame(frame) : 0;
    };

    const onScroll = () => {
      const now = performance.now();
      const speed = (el.scrollLeft - lastLeft) / Math.max(1, now - lastTime);
      lastLeft = el.scrollLeft;
      lastTime = now;
      target = target * 0.6 + swayTarget(speed) * 0.4;
      if (!raf) {
        lastFrame = now;
        raf = requestAnimationFrame(frame);
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}
