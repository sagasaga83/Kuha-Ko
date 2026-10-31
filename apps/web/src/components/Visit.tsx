import { Eyebrow, Stamp } from '@kuhako/ui';
import { formatOpening, site } from '../data/site';

export function Visit() {
  const rows = [
    { label: 'Opening', value: formatOpening(site.openingDate) },
    { label: 'Where', value: site.address ?? `${site.city}. Exact spot announced soon.` },
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
    <section id="visit" className="section visit" aria-labelledby="visit-title">
      <div className="container visit__inner">
        <div className="visit__copy">
          <Eyebrow>Come by</Eyebrow>
          <h2 id="visit-title" className="section__title">
            Visit the shop
          </h2>
          <dl className="visit__list">
            {rows.map((r) => (
              <div key={r.label}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="visit__stamp" aria-hidden="true">
          <Stamp size={220} />
        </div>
      </div>
    </section>
  );
}
