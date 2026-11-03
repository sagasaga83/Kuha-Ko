import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { MenuItem } from '@kuhako/ui';
import { addOnsFrom, menuFrom, useCatalog } from '../catalog/catalog';
import { useShop } from '../shop/Shop';
import { photos } from '../data/photos';
import { Photo } from './Photo';
import { SectionHead } from './SectionHead';

export function MenuSection() {
  const { products } = useCatalog();
  const shop = useShop();
  const menu = menuFrom(products);
  const addOns = addOnsFrom(products);
  const [active, setActive] = useState(menu[0]?.id ?? '');
  /** The drink being pointed at or focused: the photo column shows it. */
  const [pointed, setPointed] = useState<string | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const group = menu.find((g) => g.id === active) ?? menu[0];
  if (!group) return null;
  const drink = group.drinks.find((d) => d.id && d.id === pointed);
  const drinkPhoto = drink?.id ? products.find((x) => x.id === drink.id)?.photoUrl : null;
  const price = (d: (typeof group.drinks)[number]) =>
    d.hot && d.iced ? `Hot ${d.hot} · Iced ${d.iced}` : (d.hot ?? d.iced ?? 'Price at opening');

  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + menu.length) % menu.length;
    setActive(menu[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <section id="menu" className="section section--first" aria-labelledby="menu-title">
      <div className="container">
        <SectionHead
          level={1}
          id="menu-title"
          accent="coffee"
          label="Kuha Ko Coffee"
          title="The menu"
          lede="Espresso drinks named after the racks, hot or iced. Prices go up when we open."
        />
        <div className="menu" data-reveal>
          <div className="menu__media">
            <div className="menu__frame">
              {menu.map((g) => (
                <div key={g.id} className={`menu__photo${g.id === active && !drinkPhoto ? ' is-active' : ''}`}>
                  {photos.menu[g.id] ? <Photo slot={photos.menu[g.id]} /> : null}
                </div>
              ))}
              {drinkPhoto && drink ? (
                <div key={drinkPhoto} className="menu__photo is-active">
                  <Photo slot={{ src: drinkPhoto, alt: drink.name, brief: drink.name, ratio: '4 / 5' }} />
                </div>
              ) : null}
            </div>
            <p className="menu__caption" aria-hidden="true">
              <span className="menu__caption-name">{drink ? drink.name : group.title}</span>
              <span className="menu__caption-meta">{drink ? price(drink) : group.subtitle}</span>
            </p>
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
              {group.drinks.map((d, i) => {
                const p = d.id ? products.find((x) => x.id === d.id) : undefined;
                const orderable = Boolean(p && shop?.canOrder(p));
                const point = () => setPointed(d.id ?? null);
                return (
                  <div
                    key={d.name}
                    className={`menu__item${orderable ? ' is-orderable' : ''}`}
                    style={{ '--i': i } as CSSProperties}
                    onMouseEnter={point}
                    onMouseLeave={() => setPointed(null)}
                    onFocus={point}
                    onBlur={() => setPointed(null)}
                  >
                    <MenuItem {...d} />
                    {orderable && p ? (
                      <>
                        <span className="menu__plus" aria-hidden="true">
                          Add +
                        </span>
                        <button type="button" className="menu__open" onClick={() => shop?.openProduct(p)}>
                          <span className="visually-hidden">Add {d.name} to your order</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                );
              })}
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
