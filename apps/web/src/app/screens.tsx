import { useRef, useState, type CSSProperties } from 'react';
import { ClaimBanner, Wordmark } from '@kuhako/ui';
import type { Drink } from '../data/menu';
import { photos } from '../data/photos';
import type { Shirt } from '../data/shirts';
import { menuFrom, shirtsFrom, useCatalog } from '../catalog/catalog';
import { useShop } from '../shop/Shop';
import { openingDayText, site } from '../data/site';
import { googleCalendarUrl, useNextLive } from '../live';
import { SignupForm } from '../components/SignupForm';
import { liveSteps } from '../components/LiveSelling';
import { RackPiece } from '../components/RackPiece';
import { useRack as useRackEntries } from '../useRack';
import { useRackSway } from '../useRackSway';
import { useArrival } from '../useArrival';
import { Photo } from '../components/Photo';
import { LiveDemo } from '../components/LiveDemo';
import { clearTheme, setTheme, storedTheme, type Theme } from '../theme';
import { ThemeLamp } from '../components/ThemeLamp';
import { useAccount } from '../account/auth';
import { Group, Row, Segmented, Sheet } from './ui';

export type TabId = 'home' | 'menu' | 'thrift' | 'live' | 'about';

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
  const rack = useRef<HTMLUListElement>(null);
  useRackSway(rack);
  const arrival = useArrival(rack);
  const pieces = useRackEntries();
  return (
    <>
      <p className="app-lede">Hand-picked ukay finds behind the coffee bar, a fitting room and a vintage mirror.</p>
      <h2 className="app-section-title">On the rack</h2>
      <ul className={`app-rack is-${arrival}`} ref={rack} aria-label="On the rack" tabIndex={0}>
        {pieces.map(({ key, ...r }, i) => (
          <li key={key} style={{ '--i': i } as CSSProperties}>
            <RackPiece {...r} />
          </li>
        ))}
      </ul>
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
  const live = useNextLive();
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
      <Group header={live?.now ? 'Live now' : 'Next live'} footer={live ? 'Philippine time.' : `Live selling starts ${site.liveSellingFrom}.`}>
        {live ? (
          <>
            <Row title={live.day} detail={live.time} />
            {live.now && site.facebook.url ? (
              <Row title="Watch on Facebook" href={site.facebook.url} />
            ) : (
              <Row title="Add to calendar" href={googleCalendarUrl(live, `${window.location.origin}/live`)} />
            )}
          </>
        ) : (
          <Row title="Date announced soon" />
        )}
      </Group>
      <div className="app-pad app-signup">
        <SignupForm source="live" />
      </div>
      <Group header="How it works">
        {liveSteps.map((s) => (
          <Row key={s.title} title={s.title} subtitle={s.body} />
        ))}
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

export function AboutScreen() {
  const account = useAccount();
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
        {openingDayText() ? <Row title="Opening day" subtitle={openingDayText()!} /> : null}
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
      {account.status !== 'off' ? (
        <Group header="Your account" footer="Saved delivery details and your orders. You can always order as a guest.">
          <Row
            title={account.status === 'signed-in' ? 'Account' : 'Sign in'}
            subtitle={account.status === 'signed-in' ? account.email || undefined : undefined}
            onClick={() => window.location.assign('/account')}
            chevron
          />
        </Group>
      ) : null}
      <div className="app-group">
        <h2 className="app-group__header">Appearance</h2>
        <div className="app-lamp">
          <ThemeLamp className="app-lamp__lamp" onChange={setChoice} />
          <div className="app-lamp__text">
            <p>Pull the chain. Lamp on for evening, off for daytime.</p>
            {theme !== 'system' ? (
              <button type="button" className="app-lamp__auto" onClick={() => pick('system')}>
                Follow my phone’s setting
              </button>
            ) : (
              <p className="app-lamp__note">Following your phone’s setting.</p>
            )}
          </div>
        </div>
      </div>
      <footer className="app-colophon">
        <Wordmark size={32} />
        <p>Something to sip, something to keep.</p>
        <p className="app-mono">Say it KOO-ha ko · © {new Date().getFullYear()} Kuha Ko</p>
      </footer>
    </>
  );
}
