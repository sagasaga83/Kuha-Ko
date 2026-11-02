/**
 * KUHA KO! ("I'll take it") in a rubber-stamp box, on whatever you've put in your cart.
 * `fresh` lands it with a thunk; otherwise it's already there.
 */
export function ClaimStamp({ fresh = false, className = '' }: { fresh?: boolean; className?: string }) {
  return (
    <span className={`claim-stamp${fresh ? ' is-fresh' : ''} ${className}`.trim()} aria-hidden="true">
      KUHA KO!
    </span>
  );
}
