import type { CSSProperties } from 'react';
import { SectionHead } from './SectionHead';

export function NameStory() {
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
          <div data-reveal>
            <dt>kuha</dt>
            <dd>to take, to get; also a photo you take</dd>
          </div>
          <div data-reveal style={{ '--d': 1 } as CSSProperties}>
            <dt>ko</dt>
            <dd>I, me, my: the one who takes it</dd>
          </div>
          <div data-reveal style={{ '--d': 2 } as CSSProperties}>
            <dt>
              <span className="words__beat">KOO</span>-ha’ ko
            </dt>
            <dd className="words__ipa">/ˈku.haʔ ko/</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
