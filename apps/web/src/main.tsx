import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@kuhako/tokens/tokens.css';
import '@kuhako/ui/styles.css';
import './styles/site.css';
import './styles/app.css';
import { App } from './App';
import { MobileApp } from './app/MobileApp';
import { isApp } from './app/platform';
import { applyStoredTheme } from './theme';

applyStoredTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isApp() ? <MobileApp /> : <App />}</StrictMode>,
);
