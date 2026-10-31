import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Wordmark } from '@kuhako/ui';
import { Screen } from './ui';
import { HomeScreen, LiveScreen, MenuScreen, ThriftScreen, VisitScreen, type TabId } from './screens';

const tabs: { id: TabId; label: string; icon: ReactNode }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />,
  },
  {
    id: 'menu',
    label: 'Menu',
    icon: (
      <>
        <path d="M5 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z" />
        <path d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5H17" />
        <path d="M9 3.5c-.8 1 .8 2 0 3M13 3.5c-.8 1 .8 2 0 3" />
      </>
    ),
  },
  {
    id: 'thrift',
    label: 'Thrift',
    icon: (
      <>
        <path d="M12 7.5a2 2 0 1 1 2-2" />
        <path d="M12 7.5v1.2L3.6 15.2A1.3 1.3 0 0 0 4.4 17.5h15.2a1.3 1.3 0 0 0 .8-2.3L12 8.7" />
      </>
    ),
  },
  {
    id: 'live',
    label: 'Live',
    icon: (
      <>
        <circle cx="12" cy="12" r="2.2" />
        <path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6" />
        <path d="M5.4 5.4a9.3 9.3 0 0 0 0 13.2M18.6 5.4a9.3 9.3 0 0 1 0 13.2" />
      </>
    ),
  },
  {
    id: 'visit',
    label: 'Visit',
    icon: (
      <>
        <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
        <circle cx="12" cy="10" r="2.3" />
      </>
    ),
  },
];

const titles: Record<TabId, string> = {
  home: 'Kuha Ko',
  menu: 'Menu',
  thrift: 'Thrift',
  live: 'Live selling',
  visit: 'Visit',
};

/** `?app=menu` (or thrift, live, visit) opens on that tab; handy for previews. */
function startTab(): TabId {
  const want = new URLSearchParams(window.location.search).get('app');
  return tabs.some((t) => t.id === want) ? (want as TabId) : 'home';
}

/** The app layout: one screen per tab, with a tab bar along the bottom, like an iOS app. */
export function MobileApp() {
  const [tab, setTab] = useState<TabId>(startTab);
  const screens = useRef<Partial<Record<TabId, HTMLElement | null>>>({});
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    document.documentElement.classList.add('kk-app');
    return () => document.documentElement.classList.remove('kk-app');
  }, []);

  const select = (id: TabId) => {
    // Tapping the tab you're on scrolls back to the top, as on iOS.
    if (id === tab) screens.current[id]?.scrollTo({ top: 0, behavior: 'smooth' });
    else setTab(id);
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + tabs.length) % tabs.length;
    setTab(tabs[next].id);
    buttons.current[next]?.focus();
  };

  const screen = (id: TabId, body: ReactNode, largeTitle?: ReactNode) => (
    <Screen
      key={id}
      id={id}
      title={titles[id]}
      largeTitle={largeTitle}
      hidden={tab !== id}
      scrollRef={(el) => (screens.current[id] = el)}
    >
      {body}
    </Screen>
  );

  return (
    <div className="app">
      {screen('home', <HomeScreen go={setTab} />, <Wordmark size={40} />)}
      {screen('menu', <MenuScreen />)}
      {screen('thrift', <ThriftScreen />)}
      {screen('live', <LiveScreen />)}
      {screen('visit', <VisitScreen />)}
      <nav className="app-tabbar" role="tablist" aria-label="Sections">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => (buttons.current[i] = el)}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`screen-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className="app-tabbar__tab"
            onClick={() => select(t.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {t.icon}
            </svg>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
