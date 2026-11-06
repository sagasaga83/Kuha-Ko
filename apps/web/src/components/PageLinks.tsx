import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Stamp } from '@kuhako/ui';
import { photos } from '../data/photos';
import { Link } from '../router';
import { Photo } from './Photo';
import { useScrollIn } from '../useScrollIn';

const coffee = photos.menu.classics;
const piece = photos.rack.find((p) => p.src?.includes('denim')) ?? photos.rack[0];

/** `kind` picks how the card answers a hover: the photo leans in, the piece swings, the claim punches, the stamp thunks. */
const pages: {
  href: string;
  kind: 'menu' | 'thrift' | 'live' | 'about';
  label: string;
  title: string;
  line: string;
  accent: string;
  visual: ReactNode;
}[] = [
  {
    href: '/menu',
    kind: 'menu',
    label: 'Coffee',
    title: 'Menu',
    line: 'Lattes, americanos and a tablea mocha.',
    accent: 'coffee',
    visual: coffee ? <Photo slot={{ ...coffee, ratio: '4 / 3' }} /> : null,
  },
  {
    href: '/thrift',
    kind: 'thrift',
    label: 'Thrift',
    title: 'Thrift',
    line: 'Pre-loved pieces and Kuha Ko shirts.',
    accent: 'thrift',
    visual: piece ? <Photo slot={{ ...piece, ratio: '4 / 3' }} className="page-link__cutout" /> : null,
  },
  {
    href: '/live',
    kind: 'live',
    label: 'Live',
    title: 'Live selling',
    line: 'Comment KUHA KO! to claim a piece first.',
    accent: 'shop',
    visual: (
      <span className="page-link__board" aria-hidden="true">
        <span className="page-link__claim">KUHA KO!</span>
      </span>
    ),
  },
  {
    href: '/about',
    kind: 'about',
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

/**
 * The home page's way into the other pages. When it scrolls into view the rail draws
 * across and the cards hang on it one after another (each picture unveils from the top,
 * like the hero photo), replaying on every scroll in.
 */
export function PageLinks() {
  const ref = useRef<HTMLElement>(null);
  const seen = useScrollIn(ref);
  const cls = seen === 'static' ? 'section explore' : `section explore is-armed${seen === 'in' ? ' is-in' : ''}`;
  return (
    <section ref={ref} className={cls} aria-labelledby="explore-title">
      <div className="container">
        <h2 id="explore-title" className="label page-links__title">
          Explore
        </h2>
        <ul className="page-links">
          {pages.map((p, i) => (
            <li key={p.href} style={{ '--i': i } as CSSProperties}>
              <Link className={`page-link page-link--${p.kind}`} href={p.href}>
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
