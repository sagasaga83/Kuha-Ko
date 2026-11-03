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
  const follow = [
    { name: 'Instagram', detail: site.instagram.handle, url: site.instagram.url },
    { name: 'Facebook', detail: site.facebook.name, url: site.facebook.url },
  ];
  return (
    <footer className="site-footer">
      <div className="container site-footer__top">
        <div className="site-footer__brand">
          <Wordmark size={40} />
          <p className="site-footer__tagline">Something to sip, something to keep.</p>
          <p className="site-footer__where">
            Coffee &amp; thrift · {site.city}
            {opening ? (
              <>
                <br />
                Opening {opening}
              </>
            ) : null}
          </p>
        </div>
        <nav className="site-footer__col" aria-label="Footer">
          <p className="label">Pages</p>
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href}>{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-footer__col">
          <p className="label">Follow</p>
          <ul>
            {follow.map((f) => (
              <li key={f.name}>
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noreferrer">
                    {f.name}
                  </a>
                ) : (
                  <span className="muted">{f.name} (coming soon)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        {onLive ? null : (
          <div className="site-footer__signup">
            <SignupForm source="footer" />
          </div>
        )}
      </div>
      <div className="container site-footer__base">
        <p className="site-footer__meta">Say it KOO-ha ko · © {new Date().getFullYear()} Kuha Ko</p>
      </div>
    </footer>
  );
}
