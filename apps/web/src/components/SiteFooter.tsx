import { Wordmark } from '@kuhako/ui';
import { openingDayText, site } from '../data/site';
import { Link, usePath } from '../router';
import { SignupForm } from './SignupForm';

const nav = [
  { href: '/menu', label: 'Menu' },
  { href: '/thrift', label: 'Thrift' },
  { href: '/live', label: 'Live selling' },
  { href: '/about', label: 'About' },
];

export function SiteFooter() {
  const opening = openingDayText();
  // The live page has its own sign-up, just above.
  const onLive = usePath() === '/live';
  // Only links that exist; About already says the pages are coming soon.
  const follow = [
    { name: 'Instagram', url: site.instagram.url },
    { name: 'Facebook', url: site.facebook.url },
  ].filter((f): f is { name: string; url: string } => Boolean(f.url));
  return (
    <footer className="site-footer">
      <div className="container site-footer__top">
        <div className="site-footer__brand">
          <Wordmark size={30} />
          <nav aria-label="Footer">
            <ul className="site-footer__nav">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {onLive ? null : (
          <div className="site-footer__signup">
            <SignupForm source="footer" />
          </div>
        )}
      </div>
      <div className="container site-footer__base">
        <p className="site-footer__meta">
          Coffee &amp; thrift · {site.city}
          {opening ? (
            <>
              {' · '}
              <span className="site-footer__opening">Opening {opening}</span>
            </>
          ) : null}
        </p>
        <p className="site-footer__meta">
          {follow.map((f) => (
            <span key={f.name}>
              <a href={f.url} target="_blank" rel="noreferrer">
                {f.name}
              </a>
              {' · '}
            </span>
          ))}
          Say it KOO-ha ko · © {new Date().getFullYear()} Kuha Ko
        </p>
      </div>
    </footer>
  );
}
