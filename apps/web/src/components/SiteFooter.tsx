import type { CSSProperties } from 'react';
import { Wordmark } from '@kuhako/ui';
import { formatOpening, site } from '../data/site';
import { photos } from '../data/photos';
import { Photo } from './Photo';

export function SiteFooter() {
  const cols = [
    { label: 'Opening', value: formatOpening(site.openingDate) },
    { label: 'Visit', value: site.address ?? `${site.city}. Exact spot announced soon.` },
    { label: 'Hours', value: site.hours ?? 'Announced before opening day.' },
    {
      label: 'Follow',
      value: site.instagram.url ? (
        <a href={site.instagram.url} target="_blank" rel="noreferrer">
          {site.instagram.handle} on Instagram
        </a>
      ) : (
        `${site.instagram.handle} on Instagram (coming soon)`
      ),
    },
  ];

  return (
    <footer className="site-footer">
      <section id="visit" className="container" aria-labelledby="visit-title">
        <div className="site-footer__top">
          <h2 id="visit-title" className="site-footer__title" data-reveal>
            Visit the shop
          </h2>
          <div className="site-footer__photo" data-reveal>
            <Photo slot={photos.shop} />
          </div>
        </div>
        <dl className="site-footer__cols">
          {cols.map((c, i) => (
            <div key={c.label} data-reveal style={{ '--d': i } as CSSProperties}>
              <dt className="label">{c.label}</dt>
              <dd>{c.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <div className="container site-footer__base">
        <Wordmark size={40} />
        <p className="site-footer__tagline">Something to sip, something to keep.</p>
        <p className="site-footer__meta">
          Say it KOO-ha ko · © {new Date().getFullYear()} Kuha Ko
        </p>
      </div>
    </footer>
  );
}
