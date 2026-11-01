import { useEffect } from 'react';
import { Announcement } from './components/Announcement';
import { SiteHeader } from './components/SiteHeader';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { NameStory } from './components/NameStory';
import { PageLinks } from './components/PageLinks';
import { MenuSection } from './components/MenuSection';
import { ThriftSection } from './components/ThriftSection';
import { LiveSelling } from './components/LiveSelling';
import { VisitSection } from './components/VisitSection';
import { SiteFooter } from './components/SiteFooter';
import { BackToTop } from './components/BackToTop';
import { useReveal } from './hooks/motion';
import { Link, PAGES, pageFor, usePath, type PageId } from './router';

function Page({ id }: { id: PageId | null }) {
  switch (id) {
    case 'home':
      return (
        <>
          <Hero />
          <Marquee />
          <NameStory />
          <PageLinks />
        </>
      );
    case 'menu':
      return <MenuSection />;
    case 'thrift':
      return <ThriftSection />;
    case 'live':
      return <LiveSelling />;
    case 'visit':
      return <VisitSection />;
    default:
      return (
        <section className="section" aria-labelledby="missing-title">
          <div className="container">
            <h1 id="missing-title" className="section-head__title">
              We can’t find that page.
            </h1>
            <p>
              <Link className="text-link" href="/">
                Back to the home page
              </Link>
            </p>
          </div>
        </section>
      );
  }
}

/** The full website: one page per section (/, /menu, /thrift, /live, /visit). */
export function App() {
  useReveal();
  const path = usePath();
  const id = pageFor(path);

  useEffect(() => {
    document.title = PAGES.find((p) => p.id === id)?.title ?? 'Page not found · Kuha Ko';
  }, [id]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Announcement />
      <SiteHeader />
      <main id="main" key={id ?? 'missing'}>
        <Page id={id} />
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
