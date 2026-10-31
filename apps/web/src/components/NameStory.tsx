import { Eyebrow } from '@kuhako/ui';

export function NameStory() {
  return (
    <section id="name" className="section name-story" aria-labelledby="name-title">
      <div className="container name-story__inner">
        <div className="name-story__head">
          <Eyebrow>The name, in Hiligaynon</Eyebrow>
          <h2 id="name-title" className="section__title">
            “Kuha ko.” I’ll take it.
          </h2>
          <p className="section__lede">
            It’s what you say when you spot the right piece on the rack, or order your usual. So we named the shop
            after it.
          </p>
        </div>
        <dl className="name-story__words">
          <div>
            <dt>kuha</dt>
            <dd>to take, to get; also a photo you take</dd>
          </div>
          <div>
            <dt>ko</dt>
            <dd>I, me, my: the one who takes it</dd>
          </div>
          <div className="name-story__say">
            <dt>Say it</dt>
            <dd>
              <span className="name-story__beat">KOO</span>-ha’ ko <span className="name-story__ipa">/ˈku.haʔ ko/</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
