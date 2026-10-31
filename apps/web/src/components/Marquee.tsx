import { formatOpening, site } from '../data/site';

const items = [
  'Kape ko. Kuha ko.',
  'Something to sip, something to keep',
  `Coffee & thrift in ${site.city}`,
  `Live selling from ${site.liveSellingFrom}`,
  `Opening ${formatOpening(site.openingDate)}`,
];

/** A slow ticker of the taglines. Pauses on hover; holds still with reduced motion. */
export function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t}>
          {t}
          <span className="marquee__dot" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee">
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
