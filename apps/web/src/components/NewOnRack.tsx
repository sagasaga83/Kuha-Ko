import type { CSSProperties } from 'react';
import { useRackItems } from '../rack';
import { Link } from '../router';
import { RackItemPiece } from './RackItemPiece';

/** The home page's look at the thrift rack: the newest pieces (or the samples), hanging on a rail. */
export function NewOnRack() {
  const items = useRackItems().filter((r) => !r.sold).slice(0, 4);
  const forSale = items.some((r) => r.product);
  if (items.length === 0) return null;
  return (
    <section className="section section--linen new-rack" aria-labelledby="new-rack-title">
      <div className="container">
        <header className="new-rack__head" data-reveal>
          <p className="section-head__label section-head__label--thrift">Kuha Ko Thrift</p>
          <h2 id="new-rack-title" className="new-rack__title">
            {forSale ? 'New on the rack' : 'On the rack'}
          </h2>
          <p className="new-rack__lede">
            {forSale
              ? 'One of each, measured and tagged. First to pay gets it.'
              : 'Hand-picked ukay finds, one of each. Pieces for sale online hang here once they’re in.'}
          </p>
          <Link className="text-link" href="/thrift">
            See the whole rack
          </Link>
        </header>
        <ul className="mini-rack" aria-label={forSale ? 'New on the rack' : 'On the rack'}>
          {items.map((r, i) => (
            <li key={r.key} data-reveal style={{ '--d': i } as CSSProperties}>
              <RackItemPiece item={r} no={i + 1} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
