import { useEffect, useState } from 'react';
import { Wordmark } from '@kuhako/ui';
import { currentTheme, setTheme, type Theme } from '../theme';

const links = [
  { href: '#menu', label: 'Menu' },
  { href: '#thrift', label: 'Thrift' },
  { href: '#live', label: 'Live selling' },
  { href: '#visit', label: 'Visit' },
];

export function SiteHeader() {
  const [theme, setThemeState] = useState<Theme>('light');
  useEffect(() => setThemeState(currentTheme()), []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a href="#top" className="site-header__home" aria-label="Kuha Ko, back to top">
          <Wordmark size={34} aria-hidden="true" role="presentation" aria-label={undefined} />
        </a>
        <nav aria-label="Sections" className="site-nav">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <button type="button" className="theme-toggle" onClick={toggle} aria-pressed={theme === 'dark'}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </header>
  );
}
