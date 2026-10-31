import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CatalogContext, fallbackCatalog } from '../catalog/catalog';
import type { Catalog } from '../../shared/catalog';
import { MobileApp } from '../app/MobileApp';
import { App } from '../App';
import { ShopProvider } from './Shop';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

/** The built-in catalog with The Kuha priced at ₱140 (iced +₱20) and coffee open for orders. */
const open: Catalog = {
  ...fallbackCatalog,
  deliveryReady: true,
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
    expect(screen.getByRole('button', { name: /View order.*1 item · ₱160/ })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('kuhako-cart')!)).toEqual([
      { productId: 'the-kuha', quantity: 1, choices: { temperature: ['iced'], 'add-ons': [] } },
    ]);
  });

  it('goes from the cart to checkout and checks the details', () => {
    localStorage.setItem('kuhako-cart', JSON.stringify([{ productId: 'the-kuha', quantity: 2, choices: { temperature: ['hot'], 'add-ons': [] } }]));
    withShop(open, <MobileApp />);
    fireEvent.click(screen.getByRole('button', { name: /View order.*2 items · ₱280/ }));
    const cart = screen.getByRole('dialog', { name: 'Your order' });
    fireEvent.click(within(cart).getByRole('button', { name: 'Checkout' }));
    const checkout = screen.getByRole('dialog', { name: 'Checkout' });
    fireEvent.click(within(checkout).getByRole('button', { name: 'Continue to payment' }));
    expect(within(checkout).getByRole('alert').textContent).toBe('Add your name.');
  });

  it('flags cart items that can no longer be ordered', () => {
    localStorage.setItem('kuhako-cart', JSON.stringify([{ productId: 'the-kuha', quantity: 1, choices: { temperature: ['hot'], 'add-ons': [] } }]));
    withShop({ ...open, ordering: { ...open.ordering, coffee: false } }, <MobileApp />);
    fireEvent.click(screen.getByRole('button', { name: /View order/ }));
    const cart = screen.getByRole('dialog', { name: 'Your order' });
    expect(within(cart).getByText('Can’t be ordered right now')).toBeTruthy();
    expect((within(cart).getByRole('button', { name: /Remove the marked items/ }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('ordering on the one-page site', () => {
  it('shows Add buttons only for orderable items', () => {
    withShop(open, <App />);
    expect(screen.getAllByRole('button', { name: /Add to order/ }).map((b) => b.textContent)).toEqual(['Add to order: The Kuha']);
  });

  it('shows no ordering while prices, ordering or delivery are not set up', () => {
    withShop(fallbackCatalog, <App />);
    expect(screen.queryByRole('button', { name: /Add to order/ })).toBeNull();
    withShop({ ...open, deliveryReady: false }, <App />);
    expect(screen.queryByRole('button', { name: /Add to order/ })).toBeNull();
  });
});
