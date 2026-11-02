import { StrictMode, Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import '@kuhako/tokens/tokens.css';
import '@kuhako/ui/styles.css';
import './styles/site.css';
import './styles/app.css';
import './styles/shop.css';
import { App } from './App';
import { MobileApp } from './app/MobileApp';
import { PHONE_QUERY, isApp } from './app/platform';
import { applyStoredTheme } from './theme';
import { CatalogProvider } from './catalog/catalog';
import { ShopProvider } from './shop/Shop';
import { Splash } from './components/Splash';
import { upgradeHashLink } from './router';
import { AccountProvider } from './account/auth';

applyStoredTheme();
upgradeHashLink();

// The shop admin is its own page, loaded only on /admin.
const Admin = lazy(() => import('./admin/Admin'));
const isAdminPath = /^\/admin(\/|$)/.test(window.location.pathname);
// A customer's order page (where they pay and follow the order), also its own page.
const OrderPage = lazy(() => import('./order/OrderPage'));
const orderId = window.location.pathname.match(/^\/order\/([0-9a-f-]{36})\/?$/)?.[1];
// Customer sign-in, saved details and order history.
const AccountPage = lazy(() => import('./account/AccountPage'));
const isAccountPath = /^\/account(\/sign-up)?\/?$/.test(window.location.pathname);

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
    {isAdminPath ? (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ) : orderId ? (
      <Suspense fallback={null}>
        <OrderPage id={orderId} />
      </Suspense>
    ) : isAccountPath ? (
      <AccountProvider>
        <Suspense fallback={null}>
          <AccountPage />
        </Suspense>
      </AccountProvider>
    ) : (
      <AccountProvider>
        <CatalogProvider>
          <ShopProvider>
            <Root />
            <Splash />
          </ShopProvider>
        </CatalogProvider>
      </AccountProvider>
    )}
    <Analytics />
    <SpeedInsights dsn="bSxYQbOvjqJCiNmJq1Eey88eD4v" />
  </StrictMode>,
);
