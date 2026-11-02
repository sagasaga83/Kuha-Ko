import type { PhotoSlot } from '../data/photos';
import { swingOnTouch } from '../swing';
import { Photo } from './Photo';

/**
 * One piece on the rack: a wooden suit hanger inside the garment, hooked over the rail,
 * and a kraft price tag on a string from the collar. Reach for it and it swings; the tag
 * follows a beat later. Render inside the rack's <li>.
 *
 * The hanger is drawn behind the garment and narrower than its shoulders, the way a
 * shirt hangs in a shop: the curved top of the wood and the hook show above the collar,
 * the arms run inside the shoulders and the ends stay hidden. The drawing
 * is in the photo's own units: cut-outs are 900 × 1200 with the collar at 150, and the
 * photo starts 110 units down, so the collar is at y 260 here.
 */
export function RackPiece({ slot, no }: { slot: PhotoSlot; no: number }) {
  const scale = 0.7 * (slot.hanger?.scale ?? 1);
  const top = 214 + (slot.hanger?.drop ?? 0);
  return (
    <div className="hang" {...swingOnTouch}>
      <svg className="hang__hanger" viewBox="0 0 900 450" aria-hidden="true" focusable="false">
        {/* a classic wooden suit hanger: curved shoulders, notched ends, a trouser bar */}
        <g transform={`translate(450 ${top}) scale(${scale}) translate(-285 -232)`}>
          <path className="hang__bar" d="M40 424H530" />
          <path
            className="hang__wood"
            d="M285 232c33 0 60 16 87 40 48 40 128 80 173 108 11 7 13 20 8 30l-7 18c-2 5-8 6-12 4L285 296 36 432c-4 2-10 1-12-4l-7-18c-5-10-3-23 8-30 45-28 125-68 173-108 27-24 54-40 87-40z"
          />
          <path className="hang__notch" d="M502 393l-8 13M68 393l8 13" />
        </g>
        {/* the metal hook, out of the collar and curled over the rail */}
        <path className="hang__hook" d={`M450 ${top + 8}V58c0-34 25-50 47-43 22 7 24 35 5 45`} />
      </svg>
      <Photo slot={slot} />
      <p className="hang__tag">
        <span>No. {String(no).padStart(4, '0')}</span>
        <span className="hang__note">One of one</span>
      </p>
    </div>
  );
}
