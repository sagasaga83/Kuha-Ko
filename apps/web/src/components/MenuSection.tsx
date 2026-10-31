import { Eyebrow, MenuItem } from '@kuhako/ui';
import { addOns, menu } from '../data/menu';

export function MenuSection() {
  return (
    <section id="menu" className="section menu-band" aria-labelledby="menu-title">
      <div className="container">
        <div className="menu-band__head">
          <Eyebrow className="menu-band__eyebrow">Kuha Ko Coffee</Eyebrow>
          <h2 id="menu-title" className="section__title menu-band__title">
            The menu
          </h2>
          <p className="section__lede menu-band__lede">
            Espresso drinks named after the racks, hot or iced. Prices go up when we open.
          </p>
        </div>
        <div className="menu-band__groups">
          {menu.map((group) => (
            <section key={group.id} className="menu-group" aria-labelledby={`menu-${group.id}`}>
              <h3 id={`menu-${group.id}`} className="menu-group__title">
                {group.title}
              </h3>
              <p className="menu-group__subtitle">{group.subtitle}</p>
              {group.drinks.map((d) => (
                <MenuItem key={d.name} tone="board" {...d} />
              ))}
            </section>
          ))}
        </div>
        <div className="addons">
          <p className="addons__title">Add-ons</p>
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
    </section>
  );
}
