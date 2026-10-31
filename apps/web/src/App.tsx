import { SiteHeader } from './components/SiteHeader';
import { Hero } from './components/Hero';
import { NameStory } from './components/NameStory';
import { MenuSection } from './components/MenuSection';
import { ThriftSection } from './components/ThriftSection';
import { LiveSelling } from './components/LiveSelling';
import { Visit } from './components/Visit';
import { SiteFooter } from './components/SiteFooter';

export function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <NameStory />
        <MenuSection />
        <ThriftSection />
        <LiveSelling />
        <Visit />
      </main>
      <SiteFooter />
    </>
  );
}
