import { ClaimBanner } from '@kuhako/ui';
import { formatPeso } from '../../shared/catalog';
import { useCatalog } from '../catalog/catalog';
import { LiveDemo } from './LiveDemo';
import { NextLive } from './NextLive';
import { SectionHead } from './SectionHead';
import { SignupForm } from './SignupForm';

/** How a claim works. The same three steps as the app's Live tab. */
export const liveSteps = [
  { title: 'Watch the live', body: 'Each piece is shown with its number, size and any flaw.' },
  { title: 'Comment KUHA KO!', body: 'Add the item number, like KUHA KO! 0142.' },
  { title: 'First comment gets it', body: 'We confirm the claim in the comments.' },
];

export function LiveSelling() {
  const { products } = useCatalog();
  const claimed = products.filter((p) => p.kind === 'thrift' && p.stock === 0 && p.photoUrl).slice(0, 4);

  return (
    <>
      <section id="live" className="section section--first" aria-labelledby="live-title">
        <div className="container">
          <SectionHead
            level={1}
            id="live-title"
            accent="thrift"
            label="Kuha Ko Thrift"
            title="Live selling"
            lede="Before the shop opens, Kuha Ko Thrift sells online. Join the lives on our Facebook page and claim a piece in the comments."
          />
          <div className="live">
            <div className="live__claim">
              <ClaimBanner>
                <p>
                  Comment <strong>KUHA KO!</strong> and the item number.
                </p>
                <p>First comment gets it.</p>
              </ClaimBanner>
              <div className="live__when">
                <NextLive />
                <SignupForm source="live" />
              </div>
            </div>
            <div>
              <LiveDemo />
            </div>
          </div>
        </div>
      </section>
      <section className="section section--linen" aria-labelledby="steps-title">
        <div className="container">
          <h2 id="steps-title" className="label band-title">
            How claiming works
          </h2>
          <ol className="steps">
            {liveSteps.map((s, i) => (
              <li key={s.title}>
                <span className="steps__no" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          {claimed.length ? (
            <div className="claimed">
              <h2 className="label band-title">Claimed lately</h2>
              <ul className="claimed__list">
                {claimed.map((p) => (
                  <li key={p.id}>
                    <span className="claimed__photo">
                      <img src={p.photoUrl!} alt="" loading="lazy" />
                    </span>
                    <span className="claimed__name">{p.name}</span>
                    <span className="claimed__meta">{p.price === null ? 'Sold' : `Sold · ${formatPeso(p.price)}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
