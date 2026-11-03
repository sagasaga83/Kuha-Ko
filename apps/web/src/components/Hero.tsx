import type { CSSProperties } from 'react';
import { Stamp } from '@kuhako/ui';
import { openingDayText, site } from '../data/site';
import { photos } from '../data/photos';
import { useNextLive } from '../live';
import { Photo } from './Photo';
import { RackPiece } from './RackPiece';
import { Link } from '../router';

/** The thrift piece that hangs beside the coffee in the hero: both shops in one picture. */
const HERO_PIECE = photos.rack.find((p) => p.src?.includes('orange-tee')) ?? photos.rack[0];

export function Hero() {
  const live = useNextLive();
  const opening = openingDayText();
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="label hero__in" style={{ '--d': 0 } as CSSProperties}>
            Coffee &amp; thrift · {site.city}
          </p>
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span className="hero__in" style={{ '--d': 1 } as CSSProperties}>
                Kape ko.
              </span>
            </span>
            <span className="hero__line">
              <em className="hero__in" style={{ '--d': 2 } as CSSProperties}>
                Kuha ko.
              </em>
            </span>
          </h1>
          <p className="hero__lede hero__in" style={{ '--d': 3 } as CSSProperties}>
            My coffee. My find. A coffee bar and a thrift boutique under one roof in {site.city}.
          </p>
          <div className="hero__links hero__in" style={{ '--d': 4 } as CSSProperties}>
            <Link className="text-link" href="/menu">
              See the menu
            </Link>
            <Link className="text-link" href="/thrift">
              Browse the rack
            </Link>
          </div>
          <dl className="hero__dates hero__in" style={{ '--d': 5 } as CSSProperties}>
            <div>
              <dt className="label">{live?.now ? 'Live now' : 'Next live'}</dt>
              <dd>
                <Link href="/live">{live ? `${live.shortDay} · ${live.time}` : 'Date announced soon'}</Link>
              </dd>
            </div>
            {opening ? (
              <div>
                <dt className="label">Opening day</dt>
                <dd>
                  <Link href="/about">{opening}</Link>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="hero__media">
          <Photo slot={photos.hero} className="hero__photo" eager />
          <div className="hero__hang" aria-hidden="true">
            <RackPiece slot={HERO_PIECE} no={1} note="One of one" />
          </div>
          <div className="hero__stamp" aria-hidden="true">
            <Stamp size={132} />
          </div>
        </div>
      </div>
    </section>
  );
}
