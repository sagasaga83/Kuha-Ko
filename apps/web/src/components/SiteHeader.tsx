import { useEffect, useState, type CSSProperties } from 'react';
import { Wordmark } from '@kuhako/ui';
import { currentTheme, setTheme, type Theme } from '../theme';
import { useScrollSpy, useScrollState } from '../hooks/motion';

const links = [
  { id: 'menu', label: 'Menu' },
  { id: 'thrift', label: 'Thrift' },
  { id: 'live', label: 'Live selling' },
  { id: 'visit', label: 'Visit' },
];
const ids = links.map((l) => l.id);

export function SiteHeader() {
  const [theme, setThemeState] = useState<Theme>('light');
  const [open, setOpen] = useState(false);
  const active = useScrollSpy(ids);
  const { scrolled, goingDown } = useScrollState();
  useEffect(() => setThemeState(currentTheme()), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  };

  const cls = [
    'site-header',
    scrolled && 'is-scrolled',
    goingDown && !open && 'is-hidden',
    open && 'is-open',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={cls}>
      <div className="container site-header__inner">
        <a href="#top" className="site-header__home" aria-label="Kuha Ko, back to top" onClick={() => setOpen(false)}>
          <Wordmark size={40} aria-hidden="true" role="presentation" aria-label={undefined} />
        </a>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="nav-toggle__bars" aria-hidden="true" />
          {open ? 'Close' : 'Explore'}
        </button>
        <nav id="site-nav" aria-label="Sections" className="site-nav">
          {links.map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              aria-current={active === l.id ? 'true' : undefined}
              style={{ '--i': i } as CSSProperties}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-pressed={theme === 'dark'}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </nav>
      </div>
    </header>
  );
}
