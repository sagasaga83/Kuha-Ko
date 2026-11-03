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
 */
export function RackPiece({
  slot,
  no,
  note = 'One of one',
  sold,
  onOpen,
  label,
  claimed,
}: {
  slot: PhotoSlot;
  no: number;
  /** The tag's second line: size and price, "Sold", or "One of one". */
  note?: string;
  sold?: boolean;
  /** Makes the piece a button (for real pieces): opens its sheet. */
  onOpen?: () => void;
  /** What the button says to screen readers: "Denim jacket, size M, ₱450". */
  label?: string;
  /** In the customer's cart: stamped KUHA KO!, freshly when just added. */
  claimed?: 'fresh' | boolean;
}) {
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
      className={`hang${slot.cutout ? '' : ' hang--framed'}`}
      data-sold={sold || undefined}
      style={{ '--off': (slot.cutout ? off : 60).toFixed(1) } as CSSProperties}
      {...swingOnTouch}
    >
      <img className="hang__hanger" src={HANGER.src} alt="" style={place} loading="lazy" decoding="async" />
      <Photo slot={slot} />
      {clip && slot.cutout ? (
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
        <span>No. {String(no).padStart(4, '0')}</span>
        <span className="hang__note">{note}</span>
      </p>
      {claimed ? <ClaimStamp fresh={claimed === 'fresh'} className="hang__stamp" /> : null}
      {onOpen ? (
        <button type="button" className="hang__open" onClick={onOpen}>
          <span className="visually-hidden">{label ?? slot.alt}</span>
        </button>
      ) : null}
    </div>
  );
}
