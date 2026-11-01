import type { ReactNode } from 'react';

interface SectionHeadProps {
  id: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Accent for the label: coffee (rust), thrift (sage-ink) or the shared shop (muted). */
  accent?: 'coffee' | 'thrift' | 'shop';
  /** 1 when the section is the page itself (its own page title); 2 inside a page. */
  level?: 1 | 2;
}

/** The section opener used across the page: a small label on the left, the heading on the right. */
export function SectionHead({ id, label, title, lede, accent = 'shop', level = 2 }: SectionHeadProps) {
  const H = level === 1 ? 'h1' : 'h2';
  return (
    <header className="section-head" data-reveal>
      <p className={`section-head__label section-head__label--${accent}`}>{label}</p>
      <div className="section-head__body">
        <H id={id} className="section-head__title">
          {title}
        </H>
        {lede ? <p className="section-head__lede">{lede}</p> : null}
      </div>
    </header>
  );
}
