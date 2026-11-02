import { describe, expect, it } from 'vitest';
import { swayTarget, stepSway } from './useRackSway';

describe('rack sway', () => {
  it('tips the pieces back against the way the rack moves, within a limit', () => {
    expect(swayTarget(1)).toBeLessThan(0); // rack slides left: garments trail to the right
    expect(swayTarget(-1)).toBeGreaterThan(0);
    expect(Math.abs(swayTarget(50))).toBeLessThanOrEqual(9);
    expect(swayTarget(0)).toBe(0);
  });

  it('swings past rest once let go, then settles', () => {
    let s = { angle: -8, velocity: 0 };
    let crossed = false;
    for (let i = 0; i < 400; i++) {
      s = stepSway(s, 0, 16, 1);
      if (s.angle > 0.3) crossed = true;
    }
    expect(crossed).toBe(true);
    expect(Math.abs(s.angle)).toBeLessThan(0.05);
    expect(Math.abs(s.velocity)).toBeLessThan(0.01);
  });
});
