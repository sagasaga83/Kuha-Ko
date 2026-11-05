// Small motion helpers for things a hand moves: a spring that starts from wherever the
// element is now and at the speed the finger left it, Apple's momentum projection, and
// rubber-banding past an edge. No library: these are the only three things we need.

/** How far a flick carries, in px, for a release velocity in px/s (Apple's scroll deceleration). */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Past a boundary, follow the pointer less and less the further it goes. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

type SpringOptions = {
  from: number;
  to: number;
  /** px/s, carried over from the gesture so there is no seam between drag and animation. */
  velocity?: number;
  /** 1 = settles without overshoot; below 1 bounces. */
  damping?: number;
  /** Roughly how long it takes to get there, in seconds (not a fixed duration). */
  response?: number;
  onUpdate: (value: number) => void;
  onDone?: () => void;
};

/** Run a spring on the display clock. Returns a function that stops it where it is. */
export function spring({ from, to, velocity = 0, damping = 1, response = 0.4, onUpdate, onDone }: SpringOptions) {
  const stiffness = (2 * Math.PI / response) ** 2;
  const friction = (4 * Math.PI * damping) / response;
  let x = from;
  let v = velocity;
  let last = performance.now();
  let frame = requestAnimationFrame(function step(now) {
    // Small fixed steps keep the integration stable when a frame runs long.
    let dt = Math.min((now - last) / 1000, 0.064);
    last = now;
    while (dt > 0) {
      const h = Math.min(dt, 1 / 240);
      v += (-stiffness * (x - to) - friction * v) * h;
      x += v * h;
      dt -= h;
    }
    if (Math.abs(x - to) < 0.5 && Math.abs(v) < 5) {
      onUpdate(to);
      onDone?.();
      return;
    }
    onUpdate(x);
    frame = requestAnimationFrame(step);
  });
  return () => cancelAnimationFrame(frame);
}

/** Pointer positions over the last moments of a drag, for the speed at release. */
export function velocityTracker() {
  let samples: { t: number; x: number }[] = [];
  return {
    reset() {
      samples = [];
    },
    add(x: number, t = performance.now()) {
      samples.push({ t, x });
      samples = samples.filter((s) => t - s.t <= 100);
    },
    /** px/s over the last 100 ms; 0 if the pointer stopped before letting go. */
    velocity(t = performance.now()) {
      const recent = samples.filter((s) => t - s.t <= 100);
      if (recent.length < 2) return 0;
      const a = recent[0];
      const b = recent[recent.length - 1];
      return b.t > a.t ? ((b.x - a.x) / (b.t - a.t)) * 1000 : 0;
    },
  };
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
