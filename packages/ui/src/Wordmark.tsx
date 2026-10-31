import type { HTMLAttributes } from 'react';

export interface WordmarkProps extends HTMLAttributes<HTMLSpanElement> {
  /** Font size in px. The guidelines set a floor of 120px wide on screen, roughly size 40. */
  size?: number;
  /** `default` for linen, paper and kraft grounds; `reversed` for the board. */
  tone?: 'default' | 'reversed';
}

/**
 * The Kuha Ko wordmark: bold "Kúha" with the acute accent, then a light italic "Ko".
 * The accent belongs to the logo only; everywhere else the name is written "Kuha Ko".
 */
export function Wordmark({ size = 64, tone = 'default', className = '', style, ...rest }: WordmarkProps) {
  return (
    <span
      role="img"
      aria-label="Kuha Ko"
      className={`kk-wordmark kk-wordmark--${tone} ${className}`.trim()}
      style={{ fontSize: size, ...style }}
      {...rest}
    >
      <b aria-hidden="true">Kúha</b> <i aria-hidden="true">Ko</i>
    </span>
  );
}
