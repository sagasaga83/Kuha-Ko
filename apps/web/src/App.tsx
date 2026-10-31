import { Announcement } from './components/Announcement';
import { SiteHeader } from './components/SiteHeader';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { NameStory } from './components/NameStory';
import { MenuSection } from './components/MenuSection';
import { ThriftSection } from './components/ThriftSection';
import { LiveSelling } from './components/LiveSelling';
import { SiteFooter } from './components/SiteFooter';
import { BackToTop } from './components/BackToTop';
import { useReveal } from './hooks/motion';

export function App() {
  useReveal();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Announcement />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Marquee />
        <NameStory />
        <MenuSection />
        <ThriftSection />
        <LiveSelling />
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
