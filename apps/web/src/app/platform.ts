// The app layout (tab bar, large titles) is shown:
//  - inside the iOS and Android apps, where Capacitor puts a `Capacitor` object on window;
//  - on phones in the browser, and when the site is opened from the home screen;
//  - anywhere with `?app` in the URL (handy for previews on a desktop).
// `?web` forces the full one-page site, even on a phone.
interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

/** Phone-sized screens: narrow in portrait, or short with touch in landscape. */
export const PHONE_QUERY = '(max-width: 640px), (pointer: coarse) and (max-height: 500px)';

export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export function isApp(): boolean {
  if (typeof window === 'undefined') return false;
  if (isNativeApp()) return true;
  const params = new URLSearchParams(window.location.search);
  if (params.has('app')) return true;
  if (params.has('web')) return false;
  return Boolean(window.matchMedia?.(PHONE_QUERY).matches);
}
