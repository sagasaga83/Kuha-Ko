import type { CSSProperties } from 'react';
import { ClaimBanner } from '@kuhako/ui';
import { site } from '../data/site';
import { LiveDemo } from './LiveDemo';
import { SectionHead } from './SectionHead';

export function LiveSelling() {
  return (
    <section id="live" className="section" aria-labelledby="live-title">
      <div className="container">
        <SectionHead
          id="live-title"
          accent="thrift"
          label="Kuha Ko Thrift"
          title="Live selling"
          lede="Before the shop opens, Kuha Ko Thrift sells online. Join the lives on our Facebook page and claim a piece in the comments."
        />
        <div className="live">
          <div className="live__claim" data-reveal>
            <ClaimBanner>
              <p>
                Comment <strong>KUHA KO!</strong> and the item number.
              </p>
              <p>First comment gets it.</p>
            </ClaimBanner>
            {site.facebook.url ? (
              <a className="text-link" href={site.facebook.url} target="_blank" rel="noreferrer">
                Go to {site.facebook.name} on Facebook
              </a>
            ) : (
              <p className="muted">Our Facebook page link is coming soon.</p>
            )}
          </div>
          <div data-reveal style={{ '--d': 1 } as CSSProperties}>
            <LiveDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
