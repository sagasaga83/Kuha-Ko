import type { CSSProperties } from 'react';
import { site } from '../data/site';
import { photos } from '../data/photos';
import { Photo } from './Photo';

/** The Visit page: where the shop is, when it's open, where to follow it. */
export function VisitSection() {
  const cols = [
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
    <section id="visit" className="container section visit-page" aria-labelledby="visit-title">
      <div className="site-footer__top">
        <h1 id="visit-title" className="site-footer__title" data-reveal>
          Visit the shop
        </h1>
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
  );
}
