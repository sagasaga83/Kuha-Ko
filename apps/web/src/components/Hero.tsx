import type { CSSProperties } from 'react';
import { Stamp } from '@kuhako/ui';
import { formatOpening, site } from '../data/site';
import { photos } from '../data/photos';
import { Photo } from './Photo';
import { Countdown } from './Countdown';

export function Hero() {
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
            My coffee. My find. A coffee bar and a thrift boutique under one roof, opening{' '}
            <strong>{formatOpening(site.openingDate)}</strong>.
          </p>
          <div className="hero__links hero__in" style={{ '--d': 4 } as CSSProperties}>
            <a className="text-link" href="#menu">
              See the menu
            </a>
            <a className="text-link" href="#live">
              Join the live selling
            </a>
          </div>
          <div className="hero__in" style={{ '--d': 5 } as CSSProperties}>
            <Countdown to={site.openingDate} label="Opening in" />
          </div>
        </div>
        <div className="hero__media">
          <Photo slot={photos.hero} className="hero__photo" eager />
          <div className="hero__stamp" aria-hidden="true">
            <Stamp size={132} />
          </div>
        </div>
      </div>
    </section>
  );
}
