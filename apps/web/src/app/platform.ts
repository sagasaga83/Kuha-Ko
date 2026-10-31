// The app layout (tab bar, large titles) is shown on phones in the browser and when
// the site is opened from the home screen. `?app` forces it anywhere (handy for
// previews on a desktop); `?web` forces the full one-page site, even on a phone.

/** Phone-sized screens: narrow in portrait, or short with touch in landscape. */
export const PHONE_QUERY = '(max-width: 640px), (pointer: coarse) and (max-height: 500px)';

export function isApp(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has('app')) return true;
  if (params.has('web')) return false;
  return Boolean(window.matchMedia?.(PHONE_QUERY).matches);
}
