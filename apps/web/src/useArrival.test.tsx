import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useArrival } from './useArrival';

function Rack() {
  const ref = useRef<HTMLUListElement>(null);
  const state = useArrival(ref);
  return (
    <ul ref={ref} data-testid="rack" data-state={state}>
      <li>Jacket</li>
      <li>Tee</li>
    </ul>
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useArrival', () => {
  it('waits until the rack scrolls into view, then arrives once every piece has', () => {
    let fire: (hit: boolean) => void = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (e: { isIntersecting: boolean }[]) => void) {
          fire = (hit) => cb([{ isIntersecting: hit }]);
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    render(<Rack />);
    expect(screen.getByTestId('rack').dataset.state).toBe('waiting');
    act(() => fire(false));
    expect(screen.getByTestId('rack').dataset.state).toBe('waiting');
    act(() => fire(true));
    const rack = screen.getByTestId('rack');
    expect(rack.dataset.state).toBe('arriving');
    expect(disconnect).toHaveBeenCalled();
    act(() => {
      rack.children[0].dispatchEvent(new Event('animationend', { bubbles: true }));
    });
    expect(rack.dataset.state).toBe('arriving');
    act(() => {
      rack.children[1].dispatchEvent(new Event('animationend', { bubbles: true }));
    });
    expect(rack.dataset.state).toBe('arrived');
  });

  it('shows the pieces straight away where it can’t watch the scroll', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Rack />);
    expect(screen.getByTestId('rack').dataset.state).toBe('arrived');
  });
});
