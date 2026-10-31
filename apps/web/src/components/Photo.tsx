import type { PhotoSlot } from '../data/photos';

interface PhotoProps {
  slot: PhotoSlot;
  className?: string;
  /** Load straight away (above the fold) instead of lazily. */
  eager?: boolean;
}

/** A photo, or until one is added, a placeholder card that shows the shot brief. */
export function Photo({ slot, className = '', eager }: PhotoProps) {
  const cls = `photo ${className}`.trim();
  if (slot.src) {
    return (
      <div className={cls} style={{ aspectRatio: slot.ratio }}>
        <img src={slot.src} alt={slot.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      </div>
    );
  }
  return (
    <div className={`${cls} photo--placeholder`} style={{ aspectRatio: slot.ratio }} aria-hidden="true">
      <span className="photo__corner photo__corner--tl" />
      <span className="photo__corner photo__corner--br" />
      <span className="photo__label">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h3l1.5-2h6l1.5 2h3A1.5 1.5 0 0 1 21 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
        Photo coming soon
      </span>
      <span className="photo__brief">{slot.brief}</span>
      <span className="photo__ratio">{slot.ratio.replace(/\s/g, '')}</span>
    </div>
  );
}
