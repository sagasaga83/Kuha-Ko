import { Wordmark } from '@kuhako/ui';

export function SiteFooter() {
  return (
    <footer className="site-footer">
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
