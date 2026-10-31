import { Wordmark } from '@kuhako/ui';
import { site } from '../data/site';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Wordmark size={48} tone="reversed" />
          <p className="site-footer__tagline">Something to sip, something to keep.</p>
        </div>
        <div className="site-footer__meta">
          <p>Coffee &amp; thrift · {site.city}</p>
          <p>Say it KOO-ha ko</p>
          <p>© {new Date().getFullYear()} Kuha Ko</p>
        </div>
      </div>
    </footer>
  );
}
