import type { AnchorHTMLAttributes } from 'react';

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary';
}

/** A link styled as a button. Primary is rust; secondary is an espresso outline. */
export function ButtonLink({ variant = 'primary', className = '', ...rest }: ButtonLinkProps) {
  return <a className={`kk-button kk-button--${variant} ${className}`.trim()} {...rest} />;
}
