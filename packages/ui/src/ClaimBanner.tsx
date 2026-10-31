import type { ReactNode } from 'react';

export interface ClaimBannerProps {
  eyebrow?: string;
  /** The claim instruction and tie rule, one line each. */
  children: ReactNode;
}

/** The live-selling banner: KUHA KO! on the board, with how to claim. */
export function ClaimBanner({ eyebrow = 'Live on Kuha Ko Thrift', children }: ClaimBannerProps) {
  return (
    <section className="kk-claim" aria-label="How to claim in live selling">
      <p className="kk-claim__word" aria-hidden="true">
        KUHA KO!
      </p>
      <div className="kk-claim__how">
        <p className="kk-claim__eyebrow">{eyebrow}</p>
        {children}
      </div>
    </section>
  );
}
