import { ButtonLink, Eyebrow, HangTag, Stamp } from '@kuhako/ui';
import { formatOpening, site } from '../data/site';

export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <Eyebrow>Coffee &amp; thrift · {site.city}</Eyebrow>
          <h1 className="hero__title">
            Kape ko. <em>Kuha ko.</em>
          </h1>
          <p className="hero__lede">
            My coffee. My find. A coffee bar and a thrift boutique under one roof, opening{' '}
            <strong>{formatOpening(site.openingDate)}</strong>.
          </p>
          <div className="hero__actions">
            <ButtonLink href="#menu">See the menu</ButtonLink>
            <ButtonLink href="#live" variant="secondary">
              Join the live selling
            </ButtonLink>
          </div>
          <p className="hero__note">Live selling on {site.facebook.name} starts {site.liveSellingFrom}.</p>
        </div>
        <div className="hero__rail" aria-hidden="true">
          <span className="hero__bar" />
          <div className="hero__tag hero__tag--1">
            <HangTag number="0001" size="M" note="one of one" />
          </div>
          <div className="hero__tag hero__tag--2">
            <HangTag number="0002" size="S" note="denim" />
          </div>
          <div className="hero__stamp">
            <Stamp size={150} />
          </div>
        </div>
      </div>
    </section>
  );
}
