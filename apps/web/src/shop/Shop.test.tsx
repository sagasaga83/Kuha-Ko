import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CatalogContext, fallbackCatalog } from '../catalog/catalog';
import type { Catalog } from '../../shared/catalog';
import { MobileApp } from '../app/MobileApp';
import { App } from '../App';
import { ShopProvider } from './Shop';

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});

/** The built-in catalog with The Kuha priced at ₱140 (iced +₱20) and coffee open for orders. */
const open: Catalog = {
  ...fallbackCatalog,
  deliveryReady: true,
  paymentMethods: ['gcash', 'qrph'],
  ordering: { coffee: true, shirt: false, thrift: false },
  products: fallbackCatalog.products.map((p) =>
    p.id === 'the-kuha'
      ? {
          ...p,
          price: 14000,
          options: p.options.map((g) =>
            g.id === 'temperature' ? { ...g, values: g.values.map((v) => (v.id === 'iced' ? { ...v, delta: 2000 } : v)) } : g,
          ),
        }
      : p,
  ),
};

const withShop = (catalog: Catalog, ui: ReactNode) =>
  render(
    <CatalogContext.Provider value={catalog}>
      <ShopProvider>{ui}</ShopProvider>
    </CatalogContext.Provider>,
  );

describe('ordering in the app layout', () => {
  it('adds a drink with options and shows it in the cart bar', () => {
    withShop(open, <MobileApp />);
    fireEvent.click(screen.getByRole('tab', { name: 'Menu' }));
    fireEvent.click(screen.getByRole('button', { name: /The Kuha/ }));
    const sheet = screen.getByRole('dialog', { name: 'The Kuha' });
    expect(within(sheet).getByRole('button', { name: 'Add to order · ₱140' })).toBeTruthy();
    fireEvent.click(within(sheet).getByRole('radio', { name: /Iced/ }));
    fireEvent.click(within(sheet).getByRole('button', { name: 'Add to order · ₱160' }));
    expect(screen.getByRole('button', { name: /View cart.*1 item · ₱160/ })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('kuhako-cart')!)).toEqual([
      { productId: 'the-kuha', quantity: 1, choices: { temperature: ['iced'], 'add-ons': [] } },
    ]);
  });

  it('offers only the ways to pay that are set up', () => {
    localStorage.setItem('kuhako-cart', JSON.stringify([{ productId: 'the-kuha', quantity: 1, choices: { temperature: ['hot'], 'add-ons': [] } }]));
    withShop({ ...open, paymentMethods: ['qrph'] }, <MobileApp />);
    fireEvent.click(screen.getByRole('button', { name: /View cart/ }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Your cart' })).getByRole('button', { name: 'Checkout' }));
    const methods = within(screen.getByRole('dialog', { name: 'Checkout' })).getByRole('group', { name: 'Payment method' });
    const radios = within(methods).getAllByRole('radio') as HTMLInputElement[];
    expect(radios).toHaveLength(1);
    expect(radios[0].value).toBe('qrph');
    expect(radios[0].checked).toBe(true);
  });

  it('goes from the cart to checkout and checks the details', () => {
    localStorage.setItem('kuhako-cart', JSON.stringify([{ productId: 'the-kuha', quantity: 2, choices: { temperature: ['hot'], 'add-ons': [] } }]));
    withShop(open, <MobileApp />);
    fireEvent.click(screen.getByRole('button', { name: /View cart.*2 items · ₱280/ }));
    const cart = screen.getByRole('dialog', { name: 'Your cart' });
    fireEvent.click(within(cart).getByRole('button', { name: 'Checkout' }));
    const checkout = screen.getByRole('dialog', { name: 'Checkout' });
    const methods = within(checkout).getByRole('group', { name: 'Payment method' });
    expect(within(methods).getAllByRole('radio').map((r) => r.closest('label')?.textContent)).toEqual([
      'GCashScan our GCash QR in the GCash app',
      'Maya or any bank appScan our QR Ph code with Maya, GCash, GoTyme, MariBank or any bank app',
    ]);
    expect((within(methods).getByRole('radio', { name: /^GCash/ }) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(within(methods).getByRole('radio', { name: /^Maya/ }));
    expect(JSON.parse(localStorage.getItem('kuhako-checkout')!).paymentMethod).toBe('qrph');
    fireEvent.click(within(checkout).getByRole('button', { name: 'Place order' }));
    expect(within(checkout).getByRole('alert').textContent).toBe('Add your name.');
  });

  it('flags cart items that can no longer be ordered', () => {
    localStorage.setItem('kuhako-cart', JSON.stringify([{ productId: 'the-kuha', quantity: 1, choices: { temperature: ['hot'], 'add-ons': [] } }]));
    withShop({ ...open, ordering: { ...open.ordering, coffee: false } }, <MobileApp />);
    fireEvent.click(screen.getByRole('button', { name: /View cart/ }));
    const cart = screen.getByRole('dialog', { name: 'Your cart' });
    expect(within(cart).getByText('Can’t be ordered right now')).toBeTruthy();
    expect((within(cart).getByRole('button', { name: /Remove the marked items/ }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('ordering on the one-page site', () => {
  it('shows Add buttons only for orderable items', () => {
    window.history.replaceState(null, '', '/menu');
    withShop(open, <App />);
    expect(screen.getAllByRole('button', { name: /Add to order/ }).map((b) => b.textContent)).toEqual(['Add to order: The Kuha']);
  });

  it('shows no ordering while prices, ordering or delivery are not set up', () => {
    window.history.replaceState(null, '', '/menu');
    withShop(fallbackCatalog, <App />);
    expect(screen.queryByRole('button', { name: /Add to order/ })).toBeNull();
    withShop({ ...open, deliveryReady: false }, <App />);
    expect(screen.queryByRole('button', { name: /Add to order/ })).toBeNull();
    withShop({ ...open, paymentMethods: [] }, <App />);
    expect(screen.queryByRole('button', { name: /Add to order/ })).toBeNull();
  });
});
