import { useState, type PointerEvent } from 'react';
import { SectionHead } from './SectionHead';

const words = [
  { key: 'kuha', term: 'kuha', meaning: 'to take, to get; also a photo you take' },
  { key: 'ko', term: 'ko', meaning: 'I, me, my: the one who takes it' },
] as const;

/**
 * The name and what it means. The cards answer a touch: a rust hairline draws
 * across the one under the pointer (or the one tapped), and the pronunciation
 * is "said" syllable by syllable, stress on KOO, each time it's reached.
 */
export function NameStory() {
  const [on, setOn] = useState<string | null>(null);
  const [said, setSaid] = useState(0);

  const say = () => setSaid((n) => n + 1);
  const sayOnHover = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') say();
  };

  return (
    <section id="name" className="section" aria-labelledby="name-title">
      <div className="container">
        <SectionHead
          id="name-title"
          label="The name"
          title="“Kuha ko.” I’ll take it."
          lede="It’s what you say in Hiligaynon when you spot the right piece on the rack, or order your usual. So we named the shop after it."
        />
        <dl className="words">
          {words.map((w) => (
            <div key={w.key} className={on === w.key ? 'is-on' : undefined} onClick={() => setOn(w.key)}>
              <dt>{w.term}</dt>
              <dd>{w.meaning}</dd>
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
              {/* Remounting on each "say" restarts the syllable beat. */}
              <span key={said} className={said ? 'words__say is-saying' : 'words__say'}>
                <span className="words__syl words__beat">KOO</span>-<span className="words__syl">ha’</span>{' '}
                <span className="words__syl">ko</span>
              </span>
            </dt>
            <dd className="words__ipa">/ˈku.haʔ ko/</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
