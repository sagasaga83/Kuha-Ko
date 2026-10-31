import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MobileApp } from './MobileApp';
import { menu } from '../data/menu';
import { shirts } from '../data/shirts';
import { isApp } from './platform';

afterEach(cleanup);

const panel = (id: string) => document.getElementById(`screen-${id}`)!;

describe('the app layout', () => {
  it('opens on Home and switches screens from the tab bar', () => {
    render(<MobileApp />);
    expect(screen.getByRole('tab', { name: 'Home' }).getAttribute('aria-selected')).toBe('true');
    expect(panel('menu').hidden).toBe(true);
    fireEvent.click(screen.getByRole('tab', { name: 'Menu' }));
    expect(panel('menu').hidden).toBe(false);
    expect(panel('home').hidden).toBe(true);
  });

  it('jumps from a Home row to its screen', () => {
    render(<MobileApp />);
    fireEvent.click(within(panel('home')).getByRole('button', { name: /Kuha Ko Thrift/ }));
    expect(screen.getByRole('tab', { name: 'Thrift' }).getAttribute('aria-selected')).toBe('true');
  });

  it('lists every drink, one group at a time', () => {
    render(<MobileApp />);
    fireEvent.click(screen.getByRole('tab', { name: 'Menu' }));
    const menuScreen = within(panel('menu'));
    for (const group of menu) {
      fireEvent.click(menuScreen.getByRole('radio', { name: group.title }));
      for (const drink of group.drinks) expect(menuScreen.getByText(drink.name)).toBeTruthy();
    }
  });

  it('opens a shirt in a sheet and closes it with Done', () => {
    render(<MobileApp />);
    fireEvent.click(screen.getByRole('tab', { name: 'Thrift' }));
    const shirt = shirts[1];
    fireEvent.click(within(panel('thrift')).getByRole('button', { name: new RegExp(shirt.name) }));
    const sheet = screen.getByRole('dialog', { name: shirt.name });
    expect(within(sheet).getByText(shirt.description)).toBeTruthy();
    fireEvent.click(within(sheet).getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('switches appearance and can go back to the device setting', () => {
    render(<MobileApp />);
    fireEvent.click(screen.getByRole('tab', { name: 'Visit' }));
    const visit = within(panel('visit'));
    fireEvent.click(visit.getByRole('radio', { name: 'Evening' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent.click(visit.getByRole('radio', { name: 'Automatic' }));
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});

describe('isApp', () => {
  it('is false on the website and true inside Capacitor', () => {
    expect(isApp()).toBe(false);
    (window as unknown as { Capacitor: object }).Capacitor = { isNativePlatform: () => true };
    expect(isApp()).toBe(true);
    delete (window as unknown as { Capacitor?: object }).Capacitor;
  });
});
