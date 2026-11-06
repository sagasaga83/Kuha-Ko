import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { SectionHead } from './SectionHead';
import { prefersReducedMotion } from '../motion';

const TITLE = '“Kuha ko.” I’ll take it.';
const LEDE =
  'It’s what you say in Hiligaynon when you spot the right piece on the rack, or order your usual. So we named the shop after it.';

const words = [
  { key: 'kuha', term: 'kuha', meaning: 'to take, to get; also a photo you take' },
  { key: 'ko', term: 'ko', meaning: 'I, me, my: the one who takes it' },
] as const;

// Reading order: label, the heading word by word, the lede, then each card's word and
// meaning, one card after another. Lines that come into view together rise in this order,
// one --stagger-stagger apart.
const TITLE_AT = 1;
const LEDE_AT = TITLE_AT + TITLE.split(' ').length + 1;
const CARDS_AT = LEDE_AT + 2;
// Once the pronunciation has risen in, it says itself (about when its rise settles).
const SAY_AFTER_MS = 450;
// A line rises in once it is this far inside the screen: clear of the sticky header at
// the top (it slides back in when scrolling up), a little way up from the bottom...
const ENTER_MARGIN = '-15% 0px -8% 0px';
// ...and resets only when it is fully off screen, so nobody sees it disappear.
const canReveal = () => typeof IntersectionObserver !== 'undefined' && !prefersReducedMotion();

/** A line in the staggered texts reveal (transitions.dev 18); `at` is its place in reading order. */
function Line({ at, word, say, children }: { at: number; word?: boolean; say?: boolean; children: ReactNode }) {
  return (
    <span
      className={word ? 't-stagger-line t-stagger-line--word' : 't-stagger-line'}
      data-at={at}
      data-say={say ? '' : undefined}
    >
      {children}
    </span>
  );
}

/**
 * The name and what it means. Each line of text rises in whenever it scrolls into view,
 * from above or below, and resets out of sight so it rises again next time. The cards
 * also answer a touch: a rust hairline draws across the one under the pointer (or the one
 * tapped), and the pronunciation is "said" syllable by syllable, stress on KOO.
 */
export function NameStory() {
  const ref = useRef<HTMLElement>(null);
  const [still] = useState(() => !canReveal());
  const [on, setOn] = useState<string | null>(null);
  const [said, setSaid] = useState(0);

  const say = () => setSaid((n) => n + 1);
  const sayOnHover = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') say();
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || still) return;
    const lines = Array.from(el.querySelectorAll<HTMLElement>('.t-stagger-line'));
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };

    // Lines that arrive in the same frame rise together, staggered in reading order.
    const enter = new IntersectionObserver(
      (entries) => {
        const arriving = entries
          .filter((e) => e.isIntersecting && !e.target.classList.contains('is-in'))
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => Number(a.dataset.at) - Number(b.dataset.at));
        arriving.forEach((line, i) => {
          line.style.setProperty('--i', String(i));
          line.classList.add('is-in');
          if (line.dataset.say !== undefined) later(say, SAY_AFTER_MS + i * 40);
        });
      },
      { rootMargin: ENTER_MARGIN },
    );
    const leave = new IntersectionObserver((entries) => {
      for (const e of entries) if (!e.isIntersecting) e.target.classList.remove('is-in');
    });

    const html = document.documentElement;
    let wait: MutationObserver | undefined;
    const start = () => {
      for (const line of lines) {
        enter.observe(line);
        leave.observe(line);
      }
    };
    // Opened onto the page: let the splash lift before anything rises.
    if (html.classList.contains('is-splashing')) {
      wait = new MutationObserver(() => {
        if (html.classList.contains('is-splashing')) return;
        wait?.disconnect();
        start();
      });
      wait.observe(html, { attributes: true, attributeFilter: ['class'] });
    } else start();

    return () => {
      enter.disconnect();
      leave.disconnect();
      wait?.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [still]);

  return (
    <section
      ref={ref}
      id="name"
      className={still ? 'section t-stagger is-static' : 'section t-stagger'}
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
              <Line at={CARDS_AT + 2} say>
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
