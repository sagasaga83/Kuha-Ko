import { useState } from 'react';
import { ClaimBanner, Wordmark } from '@kuhako/ui';
import type { Drink } from '../data/menu';
import { photos } from '../data/photos';
import type { Shirt } from '../data/shirts';
import { addOnsFrom, menuFrom, shirtsFrom, useCatalog } from '../catalog/catalog';
import { useShop } from '../shop/Shop';
import { OnlineThrift } from '../shop/OnlineThrift';
import { site } from '../data/site';
import { Photo } from '../components/Photo';
import { LiveDemo } from '../components/LiveDemo';
import { clearTheme, setTheme, storedTheme, type Theme } from '../theme';
import { Group, Row, Segmented, Sheet } from './ui';

export type TabId = 'home' | 'menu' | 'thrift' | 'live' | 'visit';

export function HomeScreen({ go }: { go: (tab: TabId) => void }) {
  return (
    <>
      <div className="app-hero">
        <Photo slot={photos.hero} eager />
        <p className="app-hero__line">
          Kape ko. <em>Kuha ko.</em>
        </p>
        <p className="app-hero__sub">A coffee bar and a thrift boutique under one roof in {site.city}.</p>
      </div>
      <Group header="Inside">
        <Row title="Kuha Ko Coffee" subtitle="Espresso drinks named after the racks" onClick={() => go('menu')} chevron />
        <Row title="Kuha Ko Thrift" subtitle="Pre-loved, one of a kind" onClick={() => go('thrift')} chevron />
        <Row title="Live selling" subtitle="Comment KUHA KO! to claim a piece" onClick={() => go('live')} chevron />
      </Group>
      <Group header="The name" footer="It’s what you say in Hiligaynon when you spot the right piece on the rack, or order your usual.">
        <Row title={<em className="app-word">kuha</em>} detail="to take, to get; a photo you take" />
        <Row title={<em className="app-word">ko</em>} detail="I, me, my" />
        <Row title="KOO-ha’ ko" detail={<span className="app-mono">/ˈku.haʔ ko/</span>} />
      </Group>
    </>
  );
}

const priceOf = (d: Drink) => {
  if (d.hot && d.iced) return `${d.hot} · ${d.iced} iced`;
  return d.hot ?? d.iced ?? 'Price at opening';
};

export function MenuScreen() {
  const { products } = useCatalog();
  const shop = useShop();
  const productOf = (id: string) => products.find((p) => p.id === id);
  const menu = menuFrom(products);
  const addOns = addOnsFrom(products);
  const [active, setActive] = useState(menu[0]?.id ?? '');
  const group = menu.find((g) => g.id === active) ?? menu[0];
  if (!group) return null;
  const photo = photos.menu[group.id];
  return (
    <>
      <div className="app-pad">
        <Segmented
          label="Menu groups"
          options={menu.map((g) => ({ value: g.id, label: g.title }))}
          value={active}
          onChange={setActive}
        />
      </div>
      {photo ? (
        <div className="app-pad app-menu-photo" key={group.id}>
          <Photo slot={{ ...photo, ratio: '3 / 2' }} />
        </div>
      ) : null}
      <Group header={group.subtitle}>
        {group.drinks.map((d) => {
          const p = d.id ? productOf(d.id) : undefined;
          const orderable = Boolean(p && shop?.canOrder(p));
          return (
          <Row
            key={d.name}
            onClick={orderable && p ? () => shop?.openProduct(p) : undefined}
            chevron={orderable}
            title={
              <>
                {d.name}
                {d.house ? <span className="app-badge">House</span> : null}
              </>
            }
            subtitle={d.description}
            detail={priceOf(d)}
          />
          );
        })}
      </Group>
      <Group header="Add-ons" footer="Prices go up when we open.">
        {addOns.map((a) => (
          <Row key={a.name} title={a.name} detail={a.price ?? 'Price at opening'} />
        ))}
      </Group>
    </>
  );
}

const promises = [
  { title: 'One of each', body: 'Every piece on the rack is the only one.' },
  { title: 'Honest tags', body: 'Size, measurements and any flaw, shown up front.' },
  { title: 'Kuha of the Week', body: 'One standout piece, posted every week.' },
];

export function ThriftScreen() {
  const { products } = useCatalog();
  const shirts = shirtsFrom(products);
  const shop = useShop();
  const [open, setOpen] = useState<Shirt | null>(null);
  return (
    <>
      <p className="app-lede">Hand-picked ukay finds behind the coffee bar, a fitting room and a vintage mirror.</p>
      <h2 className="app-section-title">On the rack</h2>
      <ul className="app-rack" aria-label="On the rack">
        {photos.rack.map((p, i) => (
          <li key={p.brief}>
            <Photo slot={p} />
            <p className="app-rack__tag">No. {String(i + 1).padStart(4, '0')}</p>
          </li>
        ))}
      </ul>
      <OnlineThrift variant="app" />
      <h2 className="app-section-title">Our own shirts</h2>
      <ul className="app-shirts">
        {shirts.map((s) => (
          <li key={s.name}>
            <button
              type="button"
              className="app-shirts__card"
              onClick={() => {
                const p = products.find((x) => x.id === s.id);
                if (p && shop?.canOrder(p)) shop.openProduct(p);
                else setOpen(s);
              }}
            >
              <Photo slot={s.photo} />
              <span className="app-shirts__name">{s.name}</span>
              <span className="app-shirts__meta">{s.price ?? 'Price at opening'}</span>
            </button>
          </li>
        ))}
      </ul>
      <Group header="Our promise">
        {promises.map((p) => (
          <Row key={p.title} title={p.title} subtitle={p.body} />
        ))}
      </Group>
      <Sheet title={open?.name ?? ''} open={open !== null} onClose={() => setOpen(null)}>
        {open ? (
          <>
            <Photo slot={open.photo} />
            <p className="app-sheet__text">{open.description}</p>
            <Group>
              <Row title="Colours" detail={open.colours.join(' · ')} />
              <Row title="Price" detail={open.price ?? 'Price at opening'} />
            </Group>
          </>
        ) : null}
      </Sheet>
    </>
  );
}

export function LiveScreen() {
  return (
    <>
      <p className="app-lede">Before the shop opens, Kuha Ko Thrift sells online. Join the lives on our Facebook page.</p>
      <div className="app-pad">
        <ClaimBanner>
          <p>
            Comment <strong>KUHA KO!</strong> and the item number.
          </p>
          <p>First comment gets it.</p>
        </ClaimBanner>
      </div>
      <Group header="How it works">
        <Row title="Watch the live" subtitle="Each piece is shown with its number, size and any flaw." />
        <Row title="Comment KUHA KO!" subtitle="Add the item number, like KUHA KO! 0142." />
        <Row title="First comment gets it" subtitle="We confirm the claim in the comments." />
      </Group>
      <div className="app-pad">
        <LiveDemo />
      </div>
      <Group footer={site.facebook.url ? undefined : 'Our Facebook page link is coming soon.'}>
        {site.facebook.url ? (
          <Row title={site.facebook.name} subtitle="Facebook" href={site.facebook.url} />
        ) : (
          <Row title={site.facebook.name} detail="Coming soon" />
        )}
      </Group>
    </>
  );
}

export function VisitScreen() {
  const [theme, setChoice] = useState<Theme | 'system'>(() => storedTheme());
  const pick = (t: Theme | 'system') => {
    if (t === 'system') clearTheme();
    else setTheme(t);
    setChoice(t);
  };
  return (
    <>
      <div className="app-pad">
        <Photo slot={photos.shop} />
      </div>
      <Group header="The shop">
        <Row title="Address" subtitle={site.address ?? `${site.city}. Exact spot announced soon.`} />
        <Row title="Hours" subtitle={site.hours ?? 'Announced before opening day.'} />
      </Group>
      <Group header="Follow">
        {site.instagram.url ? (
          <Row title="Instagram" detail={site.instagram.handle} href={site.instagram.url} />
        ) : (
          <Row title="Instagram" detail="Coming soon" />
        )}
        {site.facebook.url ? (
          <Row title="Facebook" detail={site.facebook.name} href={site.facebook.url} />
        ) : (
          <Row title="Facebook" detail="Coming soon" />
        )}
      </Group>
      <div className="app-group">
        <h2 className="app-group__header">Appearance</h2>
        <Segmented
          label="Appearance"
          options={[
            { value: 'system', label: 'Automatic' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Evening' },
          ]}
          value={theme}
          onChange={pick}
        />
      </div>
      <footer className="app-colophon">
        <Wordmark size={32} />
        <p>Something to sip, something to keep.</p>
        <p className="app-mono">Say it KOO-ha ko · © {new Date().getFullYear()} Kuha Ko</p>
      </footer>
    </>
  );
}
