import type { PhotoSlot } from '../data/photos';
import { swingOnTouch } from '../swing';
import { Photo } from './Photo';

/**
 * One piece on the rack: a hanger hooked over the rail, the photo hanging from it, and a
 * kraft tag tied to the corner. Reach for it and it swings; the tag follows a beat later.
 * Render inside the rack's <li>.
 */
export function RackPiece({ slot, no }: { slot: PhotoSlot; no: number }) {
  return (
    <div className="hang" {...swingOnTouch}>
      <svg className="hang__hanger" viewBox="0 0 140 34" aria-hidden="true" focusable="false">
        <path d="M70 21V15c0-4 6-4.5 6-9.5S70-.5 65.5 3" />
        <path d="M70 21 3 32.5h134z" />
      </svg>
      <div className="hang__body">
        <Photo slot={slot} />
        <p className="hang__tag">
          <span>No. {String(no).padStart(4, '0')}</span>
          <span className="hang__note">One of one</span>
        </p>
      </div>
    </div>
  );
}
