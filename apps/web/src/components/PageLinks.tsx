import type { ReactNode } from 'react';
import { Stamp } from '@kuhako/ui';
import { photos } from '../data/photos';
import { Link } from '../router';
import { Photo } from './Photo';

const coffee = photos.menu.classics;
const piece = photos.rack.find((p) => p.src?.includes('denim')) ?? photos.rack[0];

const pages: { href: string; label: string; title: string; line: string; accent: string; visual: ReactNode }[] = [
  {
    href: '/menu',
    label: 'Coffee',
    title: 'Menu',
    line: 'Lattes, americanos and a tablea mocha.',
    accent: 'coffee',
    visual: coffee ? <Photo slot={{ ...coffee, ratio: '4 / 3' }} /> : null,
  },
  {
    href: '/thrift',
    label: 'Thrift',
    title: 'Thrift',
    line: 'Pre-loved pieces and Kuha Ko shirts.',
    accent: 'thrift',
    visual: piece ? <Photo slot={{ ...piece, ratio: '4 / 3' }} className="page-link__cutout" /> : null,
  },
  {
    href: '/live',
    label: 'Live',
    title: 'Live selling',
    line: 'Comment KUHA KO! to claim a piece first.',
    accent: 'shop',
    visual: (
      <span className="page-link__board" aria-hidden="true">
        KUHA KO!
      </span>
    ),
  },
  {
    href: '/about',
    label: 'About',
    title: 'About Kuha Ko',
    line: 'Who we are, where we are, and when we open.',
    accent: 'shop',
    visual: (
      <span className="page-link__stamp" aria-hidden="true">
        <Stamp size={112} />
      </span>
    ),
  },
];

/** The home page's way into the other pages. */
export function PageLinks() {
  return (
    <section className="section" aria-labelledby="explore-title">
      <div className="container">
        <h2 id="explore-title" className="label page-links__title">
          Explore
        </h2>
        <ul className="page-links">
          {pages.map((p) => (
            <li key={p.href}>
              <Link className="page-link" href={p.href}>
                <span className="page-link__visual" aria-hidden="true">
                  {p.visual}
                </span>
                <span className={`page-link__label section-head__label--${p.accent}`}>{p.label}</span>
                <span className="page-link__title">{p.title}</span>
                <span className="page-link__line">{p.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
