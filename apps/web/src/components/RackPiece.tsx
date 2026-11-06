import type { CSSProperties } from 'react';
import type { PhotoSlot } from '../data/photos';
import { swingOnTouch } from '../swing';
import { Photo } from './Photo';
import { ClaimStamp } from '../shop/ClaimStamp';

/** The wooden hanger photo (547 × 310): the wood's crown is 97 px below the hook's top. */
const HANGER = { src: '/photos/rack/hanger.webp', crown: 97 / 547, aspect: 310 / 547 };

/** n cut-out units (the piece is 900 wide) as a length. */
const u = (n: number) => `calc(${n.toFixed(1)} * var(--u))`;

/**
 * One piece on the rack: a wooden hanger hooked over the rail with the garment on it,
 * and a kraft price tag on a string from the collar. Reach for it and it swings; the tag
 * follows a beat later. Render inside the rack's <li>.
 *
 * The hanger sits inside the garment, the way a shirt hangs in a shop. It is drawn twice:
 * once behind the garment (the hook and the crown above the collar), and once in front,
 * clipped to the neck opening, so the wood shows inside the collar, in front of the back
 * of the shirt and behind the front neckline. Each cut-out says where its neck is.
 *
 * With `onPick`, a click picks the piece off the rail: it lifts from the rail, its tag
 * turns over to "Kuha ko." and the KUHA KO! stamp lands on it. Click again to put it
 * back. It's only a picked look: nothing is reserved or added to the cart.
 */
export function RackPiece({
  slot,
  no,
  picked = false,
  onPick,
}: {
  slot: PhotoSlot;
  no: number;
  picked?: boolean;
  onPick?: () => void;
}) {
  const number = `No. ${String(no).padStart(4, '0')}`;
  const width = slot.hanger?.width ?? 400;
  const crown = slot.hanger?.crown ?? 120;
  const neck = slot.hanger?.neck;
  // The hook's top is the top of the piece; the photo moves so its collar meets the crown.
  const off = HANGER.crown * width - crown;
  const x0 = 450 - width / 2;
  const place: CSSProperties = { left: u(x0), width: u(width) };

  let clip: string | undefined;
  if (neck) {
    const cy = neck.cy + off;
    const pts: [number, number][] = [[neck.cx - neck.rx, -400], [neck.cx - neck.rx, cy]];
    for (let i = 1; i < 24; i++) {
      const t = Math.PI - (i / 24) * Math.PI;
      pts.push([neck.cx + neck.rx * Math.cos(t), cy + neck.ry * Math.sin(t)]);
    }
    pts.push([neck.cx + neck.rx, cy], [neck.cx + neck.rx, -400]);
    clip = `polygon(${pts.map(([x, y]) => `${u(x - x0)} ${u(y)}`).join(', ')})`;
  }

  return (
    <div
      className={`hang${picked ? ' is-picked' : ''}`}
      style={{ '--off': off.toFixed(1) } as CSSProperties}
      {...swingOnTouch}
    >
      <img className="hang__hanger" src={HANGER.src} alt="" style={place} loading="lazy" decoding="async" />
      <Photo slot={slot} />
      {clip ? (
        <img
          className="hang__hanger hang__hanger--front"
          src={HANGER.src}
          alt=""
          style={{ ...place, clipPath: clip }}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <p className="hang__tag">
        <span className="hang__faces">
          <span className="hang__face">
            <span>{number}</span>
            <span className="hang__note">One of one</span>
          </span>
          <span className="hang__face hang__face--back" aria-hidden="true">
            Kuha ko.
          </span>
        </span>
      </p>
      {/* Mounts on each pick, so the stamp lands with a thunk every time. */}
      {picked ? <ClaimStamp fresh className="hang__stamp" /> : null}
      {onPick ? (
        <button type="button" className="hang__pick" aria-pressed={picked} onClick={onPick}>
          <span className="visually-hidden">
            {picked ? 'Put back' : 'Pick'} {number}: {slot.alt}
          </span>
        </button>
      ) : null}
    </div>
  );
}
