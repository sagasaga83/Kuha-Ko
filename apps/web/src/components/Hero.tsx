import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Stamp } from '@kuhako/ui';
import { site } from '../data/site';
import { photos } from '../data/photos';
import { Photo } from './Photo';
import { Link } from '../router';
import { useScrollIn } from '../useScrollIn';
import { useHeroMotion } from '../useHeroMotion';

/**
 * The hero. Its words arrive the way each typeface works in the shop: the Courier label
 * types itself out, the painted serif "Kape ko." is hung word by word (each rises from
 * the line and settles from a tilt), the italic "Kuha ko." is written in behind a soft
 * ink edge, and its full stop lands last like a stamp. Fast movement carries a motion
 * blur. Once settled the words keep hanging: scrolling sways them (blurring as they
 * swing), the lines drift toward a mouse pointer, and a word under the pointer lifts like
 * a piece taken off the rail, springing back when the pointer leaves. The lift moves the
 * inner `hero__lift`, so the hovered box itself stays put and the hover can't flicker.
 * Scroll away and back and it plays again.
 */
export function Hero() {
  const label = `Coffee & thrift · ${site.city}`;
  const ref = useRef<HTMLElement>(null);
  const seen = useScrollIn(ref, '0px');
  /** Bumped on each return to the top, to remount the words and replay their entrance. */
  const [round, setRound] = useState(0);
  const [settled, setSettled] = useState(false);
  const left = useRef(false);
  // Once settled and on screen, the words keep hanging: they sway as the page scrolls
  // and the lines drift toward the pointer.
  useHeroMotion(ref, settled && seen !== 'out');

  useEffect(() => {
    if (seen === 'out') left.current = true;
    if (seen === 'in' && left.current) {
      left.current = false;
      setSettled(false);
      setRound((n) => n + 1);
    }
  }, [seen]);

  return (
    <section id="top" ref={ref} className={`hero${settled ? ' is-settled' : ''}`} aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div
          key={round}
          className="hero__copy"
          onAnimationEnd={(e) => {
            if ((e.target as Element).classList.contains('hero__dot')) setSettled(true);
          }}
        >
          <p className="label hero__typed" style={{ '--n': label.length } as CSSProperties}>
            {label}
          </p>
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span className="hero__word" style={{ '--w': 0 } as CSSProperties}>
                <span className="hero__lift">Kape</span>
              </span>{' '}
              <span className="hero__word" style={{ '--w': 1 } as CSSProperties}>
                <span className="hero__lift">ko.</span>
              </span>
            </span>
            <span className="hero__line">
              <em className="hero__write">
                <span className="hero__lift">
                  Kuha ko<span className="hero__dot">.</span>
                </span>
              </em>
            </span>
          </h1>
          <p className="hero__lede hero__in" style={{ '--d': 3 } as CSSProperties}>
            My coffee. My find. A coffee bar and a thrift boutique under one roof in {site.city}.
          </p>
          <div className="hero__links hero__in" style={{ '--d': 4 } as CSSProperties}>
            <Link className="text-link" href="/menu">
              See the menu
            </Link>
            <Link className="text-link" href="/live">
              Join the live selling
            </Link>
          </div>
        </div>
        <div className="hero__media">
          <Photo slot={photos.hero} className="hero__photo" eager />
          <div className="hero__stamp" aria-hidden="true">
            <Stamp size={132} />
          </div>
        </div>
      </div>
    </section>
  );
}
