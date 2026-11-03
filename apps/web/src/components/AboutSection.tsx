import type { CSSProperties } from 'react';
import { openingDayText, site } from '../data/site';
import { photos } from '../data/photos';
import { Photo } from './Photo';

/** The About page: what Kuha Ko is, where it is, when it's open, where to follow it. */
const shops = [
  {
    key: 'coffee' as const,
    label: 'Kuha Ko Coffee',
    accent: 'coffee',
    body: 'The owner’s coffee bar. Espresso drinks named after the racks, hot or iced, made to order.',
  },
  {
    key: 'thrift' as const,
    label: 'Kuha Ko Thrift',
    accent: 'thrift',
    body: 'The partner’s boutique, behind the bar. Hand-picked pre-loved pieces, measured, tagged and shown flaws and all.',
  },
];

export function AboutSection() {
  const opening = openingDayText();
  const cols = [
    ...(opening ? [{ label: 'Opening day', value: opening }] : []),
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
    <>
      <section id="about" className="container section section--first about" aria-labelledby="about-title">
        <div className="about__top">
          <div>
            <h1 id="about-title" className="about__title" data-reveal>
              About Kuha Ko
            </h1>
            <p className="about__intro" data-reveal>
              A coffee bar and a thrift boutique under one roof in {site.city}. The name is Hiligaynon: <em>kuha</em> is
              to take or to get, <em>ko</em> is I or my. “Kuha ko” is what you say when you find the right piece or order
              your usual: I’ll take it.
            </p>
            <p className="about__say" data-reveal>
              Say it KOO-ha’ ko · /ˈku.haʔ ko/
            </p>
          </div>
          <div className="about__photo" data-reveal>
            <Photo slot={photos.shop} />
          </div>
        </div>
        <dl className={`about__cols about__cols--${cols.length}`}>
          {cols.map((c, i) => (
            <div key={c.label} data-reveal style={{ '--d': i } as CSSProperties}>
              <dt className="label">{c.label}</dt>
              <dd>{c.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="section section--linen" aria-labelledby="shops-title">
        <div className="container">
          <h2 id="shops-title" className="label band-title">
            Two shops, one roof
          </h2>
          <ul className="shops">
            {shops.map((s, i) => (
              <li key={s.key} data-reveal style={{ '--d': i } as CSSProperties}>
                <Photo slot={photos.people[s.key]} />
                <p className={`section-head__label section-head__label--${s.accent} shops__label`}>{s.label}</p>
                <p className="shops__body">{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
