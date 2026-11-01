import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { App } from './App';
import { menu } from './data/menu';
import { photos } from './data/photos';
import { shirts } from './data/shirts';
import { Photo } from './components/Photo';
import { upgradeHashLink } from './router';

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});

/** Opens the site on one of its pages. */
const at = (path: string) => window.history.replaceState(null, '', path);

describe('the Kuha Ko site', () => {
  it('lists every drink on the menu, one tab at a time', () => {
    at('/menu');
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
    at('/menu');
    render(<App />);
    const first = screen.getByRole('tab', { name: new RegExp(menu[0].title) });
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: new RegExp(menu[1].title) }).getAttribute('aria-selected')).toBe('true');
  });

  it('shows every shirt on the thrift page', () => {
    at('/thrift');
    render(<App />);
    for (const s of shirts) {
      expect(screen.getByRole('heading', { name: s.name })).toBeTruthy();
      expect(screen.getByRole('img', { name: s.photo.alt })).toBeTruthy();
    }
  });

  it('shows the live-selling claim rule', () => {
    at('/live');
    render(<App />);
    expect(screen.getByText('First comment gets it.')).toBeTruthy();
  });
});

describe('pages', () => {
  it('opens each page from the header, without reloading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /Kape ko/ })).toBeTruthy();
    const nav = screen.getByRole('navigation', { name: 'Sections' });
    fireEvent.click(within(nav).getByRole('link', { name: 'Menu' }));
    expect(window.location.pathname).toBe('/menu');
    expect(document.title).toBe('Menu · Kuha Ko');
    expect(within(nav).getByRole('link', { name: 'Menu' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('tab', { name: new RegExp(menu[0].title) })).toBeTruthy();
    fireEvent.click(within(nav).getByRole('link', { name: 'Visit' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Visit the shop' })).toBeTruthy();
    expect(screen.queryByRole('tab', { name: new RegExp(menu[0].title) })).toBeNull();
  });

  it('turns old one-page links into page addresses', () => {
    at('/#thrift');
    upgradeHashLink();
    expect(window.location.pathname).toBe('/thrift');
    expect(window.location.hash).toBe('');
  });

  it('says so when a page does not exist', () => {
    at('/nope');
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /can’t find that page/ })).toBeTruthy();
  });
});

describe('Photo', () => {
  it('shows the shot brief until a photo is added', () => {
    render(<Photo slot={{ ...photos.hero, src: null }} />);
    expect(screen.getByText(photos.hero.brief)).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows the real photo once src is set', () => {
    render(<Photo slot={{ ...photos.hero, src: '/photos/hero.jpg' }} />);
    expect(screen.getByRole('img', { name: photos.hero.alt })).toBeTruthy();
  });
});
