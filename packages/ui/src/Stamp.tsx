import { useId } from 'react';

export interface StampProps {
  size?: number;
  className?: string;
}

/** The one-colour round stamp: "KUHA KO · COFFEE & THRIFT · ILOILO ·" around an italic K. */
export function Stamp({ size = 160, className = '' }: StampProps) {
  const ringId = useId().replace(/:/g, '');
  return (
    <svg
      className={`kk-stamp ${className}`.trim()}
      viewBox="0 0 220 220"
      width={size}
      height={size}
      role="img"
      aria-label="Kuha Ko round stamp"
    >
      <defs>
        <path id={ringId} d="M110,110 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
      </defs>
      <circle className="kk-stamp__ring" cx="110" cy="110" r="104" strokeWidth="3" />
      <circle className="kk-stamp__ring" cx="110" cy="110" r="58" strokeWidth="1.5" />
      <text className="kk-stamp__text">
        <textPath href={`#${ringId}`}>KUHA KO · COFFEE &amp; THRIFT · ILOILO ·</textPath>
      </text>
      <text className="kk-stamp__k" x="110" y="132" textAnchor="middle">
        K
      </text>
    </svg>
  );
}
