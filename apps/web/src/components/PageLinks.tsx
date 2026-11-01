import type { CSSProperties } from 'react';
import { Link } from '../router';

const pages = [
  { href: '/menu', label: 'Coffee', title: 'Menu', line: 'Lattes, americanos and a tablea mocha.', accent: 'coffee' },
  { href: '/thrift', label: 'Thrift', title: 'Thrift', line: 'Pre-loved pieces and Kuha Ko shirts.', accent: 'thrift' },
  { href: '/live', label: 'Live', title: 'Live selling', line: 'Comment KUHA KO! to claim a piece first.', accent: 'shop' },
  { href: '/visit', label: 'Visit', title: 'Visit the shop', line: 'Where we are, and when we open.', accent: 'shop' },
] as const;

/** The home page's way into the other pages. */
export function PageLinks() {
  return (
    <section className="section" aria-labelledby="explore-title">
      <div className="container">
        <h2 id="explore-title" className="label page-links__title">
          Explore
        </h2>
        <ul className="page-links">
          {pages.map((p, i) => (
            <li key={p.href} data-reveal style={{ '--d': i } as CSSProperties}>
              <Link className="page-link" href={p.href}>
                <span className={`page-link__label section-head__label--${p.accent}`}>{p.label}</span>
                <span className="page-link__title">{p.title}</span>
                <span className="page-link__line">{p.line}</span>
                <span className="page-link__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
