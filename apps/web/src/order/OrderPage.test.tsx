import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import type { OrderView } from '../../shared/order';
import OrderPage from './OrderPage';

const ID = '8f14e45f-ceea-4e7a-9b1c-0123456789ab';

const order = (status: OrderView['status']): OrderView => ({
  id: ID,
  code: 'KK-7QF3M',
  status,
  createdAt: '2026-11-07T10:00:00.000Z',
  paidAt: status === 'paid' ? '2026-11-07T10:05:00.000Z' : null,
  customerName: 'Ana Reyes',
  address: 'Iznart St, Iloilo City',
  addressNotes: '',
  items: [{ name: 'The Kuha', choices: [], quantity: 1, unitPrice: 14000, lineTotal: 14000 }],
  subtotal: 14000,
  deliveryFee: 4900,
  total: 18900,
  paymentMethod: 'gcash',
  paymentReference: status === 'pending_payment' ? null : '1012345678912',
  payTo: null,
  holdExpiresAt: null,
});

const ok = (o: OrderView) => new Response(JSON.stringify(o), { status: 200, headers: { 'content-type': 'application/json' } });

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('the order page', () => {
  it('keeps checking for the shop’s confirmation after one failed check', async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(ok(order('awaiting_confirmation')))
      .mockRejectedValueOnce(new TypeError('Load failed')) // the phone drops signal for a moment
      .mockResolvedValue(ok(order('paid')));
    vi.stubGlobal('fetch', fetch);

    render(<OrderPage id={ID} />);
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Checking your payment');

    await act(() => vi.advanceTimersByTimeAsync(10_000)); // the check that fails
    await act(() => vi.advanceTimersByTimeAsync(30_000)); // a later one gets through
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Payment received/);
    // The blip doesn't leave an error behind once the page is up to date again.
    expect(screen.queryByText('Load failed')).toBeNull();
  });
});
