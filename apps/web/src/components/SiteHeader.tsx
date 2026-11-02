import { useEffect, useState, type CSSProperties } from 'react';
import { Wordmark } from '@kuhako/ui';
import { useScrollState } from '../hooks/motion';
import { Link, pageFor, usePath } from '../router';
import { CartButton } from '../shop/Shop';
import { ThemeLamp } from './ThemeLamp';
import { useAccount } from '../account/auth';

const links = [
  { id: 'menu', href: '/menu', label: 'Menu' },
  { id: 'thrift', href: '/thrift', label: 'Thrift' },
  { id: 'live', href: '/live', label: 'Live selling' },
  { id: 'visit', href: '/visit', label: 'Visit' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const active = pageFor(usePath());
  const { scrolled, goingDown } = useScrollState();
  const account = useAccount();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const cls = [
    'site-header',
    scrolled && 'is-scrolled',
    goingDown && !open && 'is-hidden',
    open && 'is-open',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={cls}>
      <div className="container site-header__inner">
        <Link href="/" className="site-header__home" aria-label="Kuha Ko, home" onClick={() => setOpen(false)}>
          <Wordmark size={40} aria-hidden="true" role="presentation" aria-label={undefined} />
        </Link>
        <CartButton />
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="nav-toggle__bars" aria-hidden="true" />
          {open ? 'Close' : 'Explore'}
        </button>
        <nav id="site-nav" aria-label="Sections" className="site-nav">
          {links.map((l, i) => (
            <Link
              key={l.id}
              href={l.href}
              aria-current={active === l.id ? 'page' : undefined}
              style={{ '--i': i } as CSSProperties}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {account.status !== 'off' ? (
            // A full page load: /account is its own page (see main.tsx).
            <a href="/account" style={{ '--i': links.length } as CSSProperties}>
              {account.status === 'signed-in' ? 'Account' : 'Sign in'}
            </a>
          ) : null}
        </nav>
        <ThemeLamp className="site-header__lamp" />
      </div>
    </header>
  );
}
