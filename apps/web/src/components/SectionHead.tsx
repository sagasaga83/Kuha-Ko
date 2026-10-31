import type { ReactNode } from 'react';

interface SectionHeadProps {
  id: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Accent for the label: coffee (rust), thrift (sage-ink) or the shared shop (muted). */
  accent?: 'coffee' | 'thrift' | 'shop';
}

/** The section opener used across the page: a small label on the left, the heading on the right. */
export function SectionHead({ id, label, title, lede, accent = 'shop' }: SectionHeadProps) {
  return (
    <header className="section-head" data-reveal>
      <p className={`section-head__label section-head__label--${accent}`}>{label}</p>
      <div className="section-head__body">
        <h2 id={id} className="section-head__title">
          {title}
        </h2>
        {lede ? <p className="section-head__lede">{lede}</p> : null}
      </div>
    </header>
  );
}
