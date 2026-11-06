import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { SectionHead } from './SectionHead';
import { prefersReducedMotion } from '../motion';

const TITLE = '“Kuha ko.” I’ll take it.';
const LEDE =
  'It’s what you say in Hiligaynon when you spot the right piece on the rack, or order your usual. So we named the shop after it.';

const words = [
  { key: 'kuha', term: 'kuha', meaning: 'to take, to get; also a photo you take' },
  { key: 'ko', term: 'ko', meaning: 'I, me, my: the one who takes it' },
] as const;

// Reveal order (each step is one --stagger-stagger): label, the heading word by word,
// the lede, then each card's word and meaning, one card after another.
const TITLE_AT = 1;
const LEDE_AT = TITLE_AT + TITLE.split(' ').length + 1;
const CARDS_AT = LEDE_AT + 2;
// When the pronunciation card has landed, it says itself.
const SAY_AFTER_MS = 1000;
// Where the scroll can't be watched, or the reader prefers less motion, the text is simply there.
const canReveal = () => typeof IntersectionObserver !== 'undefined' && !prefersReducedMotion();

/** A line in the staggered texts reveal (transitions.dev 18), held back by `at` steps. */
function Line({ at, word, children }: { at: number; word?: boolean; children: ReactNode }) {
  return (
    <span
      className={word ? 't-stagger-line t-stagger-line--word' : 't-stagger-line'}
      style={{ '--i': at } as CSSProperties}
    >
      {children}
    </span>
  );
}

/**
 * The name and what it means. The text rises in each time the section scrolls into
 * view, from either direction. The cards also answer a touch: a rust hairline draws across
 * the one under the pointer (or the one tapped), and the pronunciation is "said"
 * syllable by syllable, stress on KOO, each time it's reached.
 */
export function NameStory() {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(() => !canReveal());
  const [on, setOn] = useState<string | null>(null);
  const [said, setSaid] = useState(0);

  const say = () => setSaid((n) => n + 1);
  const sayOnHover = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') say();
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || !canReveal()) return;
    const html = document.documentElement;
    let isShown = false;
    let wait: MutationObserver | undefined;
    let sayTimer: number | undefined;
    const reveal = () => {
      isShown = true;
      setShown(true);
      sayTimer = window.setTimeout(say, SAY_AFTER_MS);
    };
    const reset = () => {
      isShown = false;
      wait?.disconnect();
      window.clearTimeout(sayTimer);
      setShown(false);
    };
    // Rises in whenever a quarter of the section scrolls into view, from above or below,
    // and resets once it has left the screen entirely, so it plays again on the way back.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!entry.isIntersecting) {
          if (isShown) reset();
          return;
        }
        if (isShown || entry.intersectionRatio < 0.25) return;
        // Opened straight onto this section: let the splash lift first.
        if (!html.classList.contains('is-splashing')) return reveal();
        wait?.disconnect();
        wait = new MutationObserver(() => {
          if (html.classList.contains('is-splashing')) return;
          wait?.disconnect();
          reveal();
        });
        wait.observe(html, { attributes: true, attributeFilter: ['class'] });
      },
      { threshold: [0, 0.25] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      wait?.disconnect();
      window.clearTimeout(sayTimer);
    };
  }, []);

  return (
    <section
      ref={ref}
      id="name"
      className={shown ? 'section t-stagger is-shown' : 'section t-stagger'}
      aria-labelledby="name-title"
    >
      <div className="container">
        <SectionHead
          id="name-title"
          label={<Line at={0}>The name</Line>}
          title={TITLE.split(' ').map((w, i) => (
            <span key={i}>
              {i > 0 ? ' ' : null}
              <Line at={TITLE_AT + i} word>
                {w}
              </Line>
            </span>
          ))}
          lede={<Line at={LEDE_AT}>{LEDE}</Line>}
        />
        <dl className="words">
          {words.map((w, i) => (
            <div key={w.key} className={on === w.key ? 'is-on' : undefined} onClick={() => setOn(w.key)}>
              <dt>
                <Line at={CARDS_AT + i}>{w.term}</Line>
              </dt>
              <dd>
                <Line at={CARDS_AT + i + 1}>{w.meaning}</Line>
              </dd>
            </div>
          ))}
          <div
            className={on === 'say' ? 'is-on' : undefined}
            onPointerEnter={sayOnHover}
            onClick={() => {
              setOn('say');
              say();
            }}
          >
            <dt>
              <Line at={CARDS_AT + 2}>
                {/* Remounting on each "say" restarts the syllable beat. */}
                <span key={said} className={said ? 'words__say is-saying' : 'words__say'}>
                  <span className="words__syl words__beat">KOO</span>-<span className="words__syl">ha’</span>{' '}
                  <span className="words__syl">ko</span>
                </span>
              </Line>
            </dt>
            <dd className="words__ipa">
              <Line at={CARDS_AT + 3}>/ˈku.haʔ ko/</Line>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
