import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@kuhako/tokens/tokens.css';
import '@kuhako/ui/styles.css';
import './styles/site.css';
import './styles/app.css';
import { App } from './App';
import { MobileApp } from './app/MobileApp';
import { PHONE_QUERY, isApp } from './app/platform';
import { applyStoredTheme } from './theme';

applyStoredTheme();

/** Picks the app layout or the one-page site, and switches if the window is resized across the phone size. */
function Root() {
  const [app, setApp] = useState(isApp);
  useEffect(() => {
    const mq = window.matchMedia?.(PHONE_QUERY);
    if (!mq) return;
    const update = () => setApp(isApp());
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return app ? <MobileApp /> : <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
