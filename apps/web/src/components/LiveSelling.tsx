import { ButtonLink, ClaimBanner, Eyebrow } from '@kuhako/ui';
import { site } from '../data/site';

export function LiveSelling() {
  return (
    <section id="live" className="section live" aria-labelledby="live-title">
      <div className="container live__inner">
        <div className="live__head">
          <Eyebrow>From {site.liveSellingFrom}</Eyebrow>
          <h2 id="live-title" className="section__title">
            Live selling
          </h2>
          <p className="section__lede">
            Before the shop opens, Kuha Ko Thrift sells online. Join the lives on our Facebook page and claim a piece
            in the comments.
          </p>
        </div>
        <ClaimBanner>
          <p>
            Comment <strong>KUHA KO!</strong> and the item number.
          </p>
          <p>First comment gets it.</p>
        </ClaimBanner>
        <div className="live__cta">
          {site.facebook.url ? (
            <ButtonLink href={site.facebook.url} target="_blank" rel="noreferrer">
              Go to {site.facebook.name} on Facebook
            </ButtonLink>
          ) : (
            <p className="live__soon">Our Facebook page link is coming soon.</p>
          )}
        </div>
      </div>
    </section>
  );
}
