import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { photos } from '../data/photos';
import { shirtsFrom, useCatalog } from '../catalog/catalog';
import { Photo } from './Photo';
import { SectionHead } from './SectionHead';

const promises = [
  {
    title: 'One of each',
    body: 'Every piece on the rack is the only one. Once it’s gone, it’s gone.',
  },
  {
    title: 'Honest tags',
    body: 'Size and measurements on every tag, and any flaw shown in a close-up photo before you ask.',
  },
  {
    title: 'Kuha of the Week',
    body: 'One standout piece, posted every week. Show us yours with #KuhaKoFinds.',
  },
];

export function ThriftSection() {
  const shirts = shirtsFrom(useCatalog().products);
  const track = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ start: true, end: false, progress: 0 });

  const update = () => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setPos({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2, progress: max > 0 ? el.scrollLeft / max : 1 });
  };
  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector('li');
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 280) + 24), behavior: 'smooth' });
  };

  return (
    <section id="thrift" className="section" aria-labelledby="thrift-title">
      <div className="container">
        <SectionHead
          id="thrift-title"
          accent="thrift"
          label="Kuha Ko Thrift"
          title="Pre-loved, one of a kind"
          lede="Behind the coffee bar: racks of hand-picked ukay finds, a fitting room and a vintage mirror. Grab a cup and take your time."
        />
      </div>
      <div className="rack" data-reveal>
        <ul className="rack__track" ref={track} onScroll={update} aria-label="On the rack" tabIndex={0}>
          {photos.rack.map((p, i) => (
            <li key={p.brief} className="rack__item">
              <Photo slot={p} />
              <p className="rack__tag">
                No. {String(i + 1).padStart(4, '0')} <span>· One of one</span>
              </p>
            </li>
          ))}
        </ul>
        <div className="container rack__controls">
          <div className="rack__progress" aria-hidden="true">
            <span style={{ '--p': pos.progress } as CSSProperties} />
          </div>
          <div className="rack__buttons">
            <button type="button" className="icon-btn" onClick={() => scroll(-1)} disabled={pos.start}>
              <span aria-hidden="true">←</span>
              <span className="visually-hidden">Previous pieces</span>
            </button>
            <button type="button" className="icon-btn" onClick={() => scroll(1)} disabled={pos.end}>
              <span aria-hidden="true">→</span>
              <span className="visually-hidden">Next pieces</span>
            </button>
          </div>
        </div>
      </div>
      <div className="container">
        <section className="shirts" aria-labelledby="shirts-title">
          <header className="shirts__head" data-reveal>
            <h3 id="shirts-title" className="shirts__title">
              Our own shirts
            </h3>
            <p className="shirts__lede">
              Five designs about the photos we take and the stories we keep. Printed in black or white, on the rack
              beside the finds.
            </p>
          </header>
          <ul className="shirts__grid">
            {shirts.map((s, i) => (
              <li key={s.name} className="shirts__item" data-reveal style={{ '--d': i % 3 } as CSSProperties}>
                <Photo slot={s.photo} />
                <p className="shirts__no">Design {String(i + 1).padStart(2, '0')}</p>
                <div className="shirts__row">
                  <h4 className="shirts__name">{s.name}</h4>
                  <span className="shirts__price">{s.price ?? 'Price at opening'}</span>
                </div>
                <p className="shirts__desc">{s.description}</p>
                <p className="shirts__colours">{s.colours.join(' · ')}</p>
              </li>
            ))}
          </ul>
        </section>
        <ol className="promises">
          {promises.map((p, i) => (
            <li key={p.title} data-reveal style={{ '--d': i } as CSSProperties}>
              <span className="promises__no" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
