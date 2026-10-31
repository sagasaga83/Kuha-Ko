import type { HTMLAttributes } from 'react';

/** A label-style eyebrow above a heading: Courier Prime, capitals, 3px tracking. */
export function Eyebrow({ className = '', ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`kk-eyebrow ${className}`.trim()} {...rest} />;
}
