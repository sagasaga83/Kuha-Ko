import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { MenuItem } from '@kuhako/ui';
import { addOnsFrom, menuFrom, useCatalog } from '../catalog/catalog';
import { photos } from '../data/photos';
import { Photo } from './Photo';
import { SectionHead } from './SectionHead';

export function MenuSection() {
  const { products } = useCatalog();
  const menu = menuFrom(products);
  const addOns = addOnsFrom(products);
  const [active, setActive] = useState(menu[0]?.id ?? '');
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const group = menu.find((g) => g.id === active) ?? menu[0];
  if (!group) return null;

  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + menu.length) % menu.length;
    setActive(menu[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <section id="menu" className="section" aria-labelledby="menu-title">
      <div className="container">
        <SectionHead
          id="menu-title"
          accent="coffee"
          label="Kuha Ko Coffee"
          title="The menu"
          lede="Espresso drinks named after the racks, hot or iced. Prices go up when we open."
        />
        <div className="menu" data-reveal>
          <div className="menu__media">
            {menu.map((g) => (
              <div key={g.id} className={`menu__photo${g.id === active ? ' is-active' : ''}`}>
                {photos.menu[g.id] ? <Photo slot={photos.menu[g.id]} /> : null}
              </div>
            ))}
          </div>
          <div className="menu__list">
            <div className="tabs" role="tablist" aria-label="Menu groups">
              {menu.map((g, i) => (
                <button
                  key={g.id}
                  ref={(el) => (tabs.current[i] = el)}
                  type="button"
                  role="tab"
                  id={`tab-${g.id}`}
                  aria-selected={g.id === active}
                  aria-controls={`panel-${g.id}`}
                  tabIndex={g.id === active ? 0 : -1}
                  className="tabs__tab"
                  onClick={() => setActive(g.id)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  {g.title}
                  <span className="tabs__count">{g.drinks.length}</span>
                </button>
              ))}
            </div>
            <div
              key={group.id}
              className="menu__panel"
              role="tabpanel"
              id={`panel-${group.id}`}
              aria-labelledby={`tab-${group.id}`}
            >
              <p className="menu__subtitle">{group.subtitle}</p>
              {group.drinks.map((d, i) => (
                <div key={d.name} className="menu__item" style={{ '--i': i } as CSSProperties}>
                  <MenuItem {...d} />
                </div>
              ))}
            </div>
            <div className="addons">
              <p className="label">Add-ons</p>
              <ul className="addons__list">
                {addOns.map((a) => (
                  <li key={a.name}>
                    <span>{a.name}</span>
                    <span className="addons__price">{a.price ?? 'Price at opening'}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
