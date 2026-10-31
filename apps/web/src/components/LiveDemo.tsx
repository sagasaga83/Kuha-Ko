import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, useInView } from '../hooks/motion';

// An example of how a live sale plays out. Not real comments.
const script = [
  { who: 'A', text: 'Measurements please', note: null },
  { who: 'K', text: 'Chest 21 in, length 27 in. Flaw on the left cuff, photo posted.', note: 'Kuha Ko Thrift', host: true },
  { who: 'J', text: 'KUHA KO! 0142', note: 'First comment. Claimed.', win: true },
  { who: 'M', text: 'KUHA KO! 0142', note: 'Next piece coming up' },
];

/** A looping example of a live-selling comment thread. Decorative: the rule is written out beside it. */
export function LiveDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [shown, setShown] = useState(script.length);

  useEffect(() => {
    if (!inView || prefersReducedMotion()) {
      setShown(script.length);
      return;
    }
    setShown(0);
    let n = 0;
    const tick = () => {
      n = n >= script.length + 2 ? 0 : n + 1; // hold the full thread for two beats, then replay
      setShown(Math.min(n, script.length));
    };
    const t = window.setInterval(tick, 1500);
    return () => window.clearInterval(t);
  }, [inView]);

  return (
    <div className="live-demo" ref={ref} aria-hidden="true">
      <div className="live-demo__bar">
        <span className="live-demo__dot" />
        <span>Live</span>
        <span className="live-demo__piece">Now showing No. 0142 · Denim jacket · Size M</span>
      </div>
      <ul className="live-demo__thread">
        {script.slice(0, shown).map((c, i) => (
          <li key={i} className={`live-demo__comment${c.win ? ' is-win' : ''}${c.host ? ' is-host' : ''}`}>
            <span className="live-demo__avatar">{c.who}</span>
            <span className="live-demo__body">
              <span className="live-demo__text">{c.text}</span>
              {c.note ? <span className="live-demo__note">{c.note}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      <p className="live-demo__caption">Example of a live sale</p>
    </div>
  );
}
