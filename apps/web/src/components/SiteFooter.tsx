import { Wordmark } from '@kuhako/ui';
import { Link, PAGES } from '../router';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <nav className="site-footer__nav" aria-label="Pages">
          {PAGES.map((p) => (
            <Link key={p.id} href={p.path}>
              {p.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="container site-footer__base">
        <Wordmark size={40} />
        <p className="site-footer__tagline">Something to sip, something to keep.</p>
        <p className="site-footer__meta">
          Say it KOO-ha ko · © {new Date().getFullYear()} Kuha Ko
        </p>
      </div>
    </footer>
  );
}
