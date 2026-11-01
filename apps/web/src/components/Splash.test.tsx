import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Splash } from './Splash';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  document.documentElement.classList.remove('is-splashing');
});

describe('the opening splash', () => {
  it('shows the tagline, then lifts away on its own', async () => {
    render(<Splash />);
    expect(screen.getByRole('status', { name: 'Loading Kuha Ko' })).toBeTruthy();
    expect(document.documentElement.classList.contains('is-splashing')).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3600);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });
    expect(screen.queryByRole('status')).toBeNull();
    expect(document.documentElement.classList.contains('is-splashing')).toBe(false);
  });

  it('can be skipped with a tap', async () => {
    render(<Splash />);
    fireEvent.click(screen.getByRole('status'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('plays again on every load', () => {
    render(<Splash />);
    cleanup();
    render(<Splash />);
    expect(screen.getByRole('status', { name: 'Loading Kuha Ko' })).toBeTruthy();
  });
});
