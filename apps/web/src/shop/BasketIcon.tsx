/** A woven rattan basket with a bent-cane handle: the cart icon. Drawn in hairlines, coloured by `currentColor`. */
export function BasketIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      className="basket-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* bent-cane handle */}
      <path d="M7 10.5C7 4.5 17 4.5 17 10.5" />
      {/* rim */}
      <path d="M3 10.5h18" />
      {/* rounded body */}
      <path d="M4.2 10.5c.4 4.4 1.7 8.2 3.8 9.5h8c2.1-1.3 3.4-5.1 3.8-9.5" />
      {/* weave rows */}
      <path d="M4.8 14h14.4M6 17.3h12" />
      {/* staggered canes, so the rows read as woven */}
      <path
        d="M8 10.5v3.5M12 10.5v3.5M16 10.5v3.5M10 14v3.3M14 14v3.3M8.6 17.3l.4 2.7M12 17.3V20M15.4 17.3l-.4 2.7"
        strokeWidth={1.2}
      />
    </svg>
  );
}
