import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { App } from './App';
import { menu } from './data/menu';
import { photos } from './data/photos';
import { Photo } from './components/Photo';

afterEach(cleanup);

describe('the Kuha Ko site', () => {
  it('lists every drink on the menu, one tab at a time', () => {
    render(<App />);
    for (const group of menu) {
      const tab = screen.getByRole('tab', { name: new RegExp(group.title) });
      fireEvent.click(tab);
      expect(tab.getAttribute('aria-selected')).toBe('true');
      for (const drink of group.drinks) {
        expect(screen.getByRole('heading', { name: drink.name })).toBeTruthy();
      }
    }
  });

  it('moves between menu tabs with the arrow keys', () => {
    render(<App />);
    const first = screen.getByRole('tab', { name: new RegExp(menu[0].title) });
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: new RegExp(menu[1].title) }).getAttribute('aria-selected')).toBe('true');
  });

  it('shows the live-selling claim rule', () => {
    render(<App />);
    expect(screen.getByText('First comment gets it.')).toBeTruthy();
  });

  it('counts down to opening day', () => {
    render(<App />);
    expect(screen.getByRole('timer').getAttribute('aria-label')).toMatch(/^Opening in: \d+ days$/);
  });
});

describe('Photo', () => {
  it('shows the shot brief until a photo is added', () => {
    render(<Photo slot={photos.hero} />);
    expect(screen.getByText(photos.hero.brief)).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows the real photo once src is set', () => {
    render(<Photo slot={{ ...photos.hero, src: '/photos/hero.jpg' }} />);
    expect(screen.getByRole('img', { name: photos.hero.alt })).toBeTruthy();
  });
});
