import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { App } from './App';
import { menu } from './data/menu';

afterEach(cleanup);

describe('the Kuha Ko site', () => {
  it('lists every drink on the menu', () => {
    render(<App />);
    for (const group of menu) {
      for (const drink of group.drinks) {
        expect(screen.getByRole('heading', { name: drink.name })).toBeTruthy();
      }
    }
  });

  it('shows the live-selling claim rule', () => {
    render(<App />);
    expect(screen.getByText('First comment gets it.')).toBeTruthy();
  });
});
