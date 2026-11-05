import { describe, expect, it } from 'vitest';
import { project, rubberband, velocityTracker } from './motion';

describe('motion helpers', () => {
  it('projects a flick forward the way a scroll decelerates', () => {
    expect(project(0)).toBe(0);
    expect(project(1000)).toBeCloseTo(499, 0); // 1000 px/s carries about half a screen
    expect(project(-1000)).toBeCloseTo(-499, 0);
  });

  it('resists more the further past the edge it is pulled', () => {
    const near = rubberband(20, 400);
    const far = rubberband(200, 400);
    expect(near).toBeGreaterThan(0);
    expect(near).toBeLessThan(20);
    expect(far / 200).toBeLessThan(near / 20);
    expect(rubberband(-50, 400)).toBeCloseTo(-rubberband(50, 400));
  });

  it('measures release speed over the last moments only', () => {
    const t = velocityTracker();
    t.add(0, 0);
    t.add(10, 50);
    t.add(30, 100);
    expect(t.velocity(100)).toBeCloseTo(300);
    expect(t.velocity(400)).toBe(0); // paused before letting go: no throw
  });
});
