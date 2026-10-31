import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { HangTag, MenuItem, Wordmark } from './index';

afterEach(cleanup);

describe('Wordmark', () => {
  it('shows the acute-accent logo but is announced as the plain name', () => {
    const { container } = render(<Wordmark />);
    expect(screen.getByRole('img', { name: 'Kuha Ko' })).toBeTruthy();
    expect(container.textContent).toContain('Kúha');
  });
});

describe('MenuItem', () => {
  it('says "Price at opening" until a price is given', () => {
    render(<MenuItem name="Thrift-y Americano" kind="Americano" description="Our lowest-priced cup." />);
    expect(screen.getByText('Price at opening')).toBeTruthy();
  });

  it('shows hot and iced prices when set', () => {
    render(<MenuItem name="The Kuha" kind="Latte" description="House latte." hot="₱120" iced="₱140" house />);
    expect(screen.getByText('Hot ₱120')).toBeTruthy();
    expect(screen.getByText('Iced ₱140')).toBeTruthy();
    expect(screen.getByText('Latte · House')).toBeTruthy();
  });
});

describe('HangTag', () => {
  it('leaves blank lines for hand-written details', () => {
    const { container } = render(<HangTag />);
    expect(container.textContent).toContain('NO. ____');
  });
});
