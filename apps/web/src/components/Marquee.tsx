import { site } from '../data/site';

// Repeated within each row so the loop stays seamless on wide screens.
const items = [
  'Kape ko. Kuha ko.',
  'Something to sip, something to keep',
  `Coffee & thrift in ${site.city}`,
];

/** A slow ticker of the taglines. Pauses on hover; holds still with reduced motion. */
export function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {[...items, ...items].map((t, i) => (
        <li key={i} aria-hidden={i >= items.length || undefined}>
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
