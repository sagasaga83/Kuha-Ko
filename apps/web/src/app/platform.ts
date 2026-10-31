// The iOS and Android apps bundle this same site. Inside them, Capacitor puts a
// `Capacitor` object on window; we then show the app layout instead of the web page.
// Add `?app` to the URL to preview the app layout in a browser.
interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

export function isApp(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  if (cap?.isNativePlatform?.()) return true;
  return new URLSearchParams(window.location.search).has('app');
}
