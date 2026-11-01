// A tiny client-side router for the site's pages (/, /menu, /thrift, /live, /visit).
// No library: history.pushState plus a popstate listener. Vercel rewrites each path to index.html.
import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react';

export const PAGES = [
  { path: '/', id: 'home', label: 'Home', title: 'Kuha Ko · Coffee & Thrift, Iloilo City' },
  { path: '/menu', id: 'menu', label: 'Menu', title: 'Menu · Kuha Ko' },
  { path: '/thrift', id: 'thrift', label: 'Thrift', title: 'Thrift · Kuha Ko' },
  { path: '/live', id: 'live', label: 'Live selling', title: 'Live selling · Kuha Ko' },
  { path: '/visit', id: 'visit', label: 'Visit', title: 'Visit · Kuha Ko' },
] as const;
export type PageId = (typeof PAGES)[number]['id'];

const CHANGE = 'kk-navigate';

/** "/menu/" → "/menu"; anything else stays as it is. */
const clean = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

export function pageFor(path: string): PageId | null {
  return PAGES.find((p) => p.path === clean(path))?.id ?? null;
}

export function pathFor(id: PageId): string {
  return PAGES.find((p) => p.id === id)!.path;
}

/**
 * Old one-page links (/#menu, /#visit …) still work: they become /menu, /visit.
 * Call once, before the first render.
 */
export function upgradeHashLink() {
  const { pathname, hash, search } = window.location;
  const id = hash.slice(1);
  if (clean(pathname) === '/' && id !== 'home' && PAGES.some((p) => p.id === id)) {
    window.history.replaceState(null, '', `/${id}${search}`);
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

/** The current path, re-rendering on navigation and back/forward. */
export function usePath(): string {
  return useSyncExternalStore(subscribe, () => clean(window.location.pathname));
}

/** Go to a page of the site. `replace` swaps the history entry instead of adding one. */
export function navigate(to: string, { replace = false, scroll = true } = {}) {
  const url = new URL(to, window.location.href);
  const next = url.pathname + url.search + url.hash;
  if (next !== window.location.pathname + window.location.search + window.location.hash) {
    window.history[replace ? 'replaceState' : 'pushState'](null, '', next);
    window.dispatchEvent(new Event(CHANGE));
  }
  if (scroll) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

/** A link to a page of the site that changes page without reloading. */
export function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (rest.target && rest.target !== '_self') return;
    e.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={go} {...rest} />;
}
