import type { ReactNode } from 'react';

export interface HangTagProps {
  /** Item number, e.g. "0142". Leave out to show a blank line for writing by hand. */
  number?: string;
  size?: string;
  /** Price as shown, e.g. "₱350". Leave out for a blank line. */
  price?: string;
  /** One line: a flaw, a measurement or "one of one". */
  note?: ReactNode;
  className?: string;
}

const blank = (value: string | undefined, width: number) => value ?? '_'.repeat(width);

/** The Kuha Ko Thrift price tag: kraft, punched hole, name in sage, details in typewriter type. */
export function HangTag({ number, size, price, note, className = '' }: HangTagProps) {
  return (
    <div className={`kk-hangtag ${className}`.trim()}>
      <span className="kk-hangtag__hole" aria-hidden="true" />
      <p className="kk-hangtag__name">Kuha Ko</p>
      <p className="kk-hangtag__shop">THRIFT</p>
      <hr className="kk-hangtag__rule" />
      <p className="kk-hangtag__lines">
        NO. {blank(number, 4)}
        <br />
        SIZE {blank(size, 4)}
        <br />
        {price ?? `₱ ${'_'.repeat(6)}`}
      </p>
      {note ? <p className="kk-hangtag__note">{note}</p> : null}
    </div>
  );
}
