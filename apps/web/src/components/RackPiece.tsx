import type { PhotoSlot } from '../data/photos';
import { swingOnTouch } from '../swing';
import { Photo } from './Photo';

/**
 * One piece on the rack: a wooden hanger hooked over the rail, the garment (a cut-out
 * photo) on it, and a kraft price tag tied to the hook. Reach for it and it swings; the
 * tag follows a beat later. Render inside the rack's <li>.
 *
 * The hanger is drawn behind the garment, so only the hook, the wood at the collar and
 * any tips past the shoulders show. Its drawing is in the photo's own units: the cut-outs
 * are 900 × 1200 with the collar at 150, and the hanger sits 110 units above the photo.
 */
export function RackPiece({ slot, no }: { slot: PhotoSlot; no: number }) {
  return (
    <div className="hang" {...swingOnTouch}>
      <svg className="hang__hanger" viewBox="0 0 900 330" aria-hidden="true" focusable="false">
        {/* the wooden body: shoulders that curve up to the neck, tucked just under the collar */}
        <g transform="translate(0 22)">
          <path
            className="hang__wood"
            d="M150 318c-14 0-20-14-8-22l266-74c28-8 56-8 84 0l266 74c12 8 6 22-8 22-82-8-178-38-298-38s-216 30-302 38z"
          />
          <path className="hang__grain" d="M210 300c74-16 150-36 240-36s166 20 240 36" />
        </g>
        {/* the metal hook, curled over the rail */}
        <path className="hang__hook" d="M450 248V50c0-30 22-44 42-38 20 6 22 32 4 40" />
      </svg>
      <Photo slot={slot} />
      <p className="hang__tag">
        <span>No. {String(no).padStart(4, '0')}</span>
        <span className="hang__note">One of one</span>
      </p>
    </div>
  );
}
