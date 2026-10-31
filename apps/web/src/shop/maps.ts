// Loads the Google Maps JavaScript API once, on demand (only at checkout).
// Needs VITE_GOOGLE_MAPS_KEY: a browser key restricted to the site's domains,
// with Maps JavaScript API and Places API (New) enabled. VITE_GOOGLE_MAP_ID is a
// map ID for the draggable pin (Google's DEMO_MAP_ID works for testing).

type Maps = any;

export const mapsKey = (import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined) || '';
export const mapId = (import.meta.env.VITE_GOOGLE_MAP_ID as string | undefined) || 'DEMO_MAP_ID';

/** Iloilo City, to centre the map and bias place search. */
export const ILOILO = { lat: 10.7202, lng: 122.5621 };

let loading: Promise<Maps> | null = null;

export function loadMaps(): Promise<Maps> {
  if (!mapsKey) return Promise.reject(new Error('No Google Maps key'));
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const w = window as any;
    if (w.google?.maps?.importLibrary) return resolve(w.google.maps);
    const cb = '__kuhakoMapsReady';
    w[cb] = () => resolve(w.google.maps);
    const s = document.createElement('script');
    const params = new URLSearchParams({ key: mapsKey, v: 'weekly', loading: 'async', callback: cb, region: 'PH', language: 'en' });
    s.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    s.async = true;
    s.onerror = () => {
      loading = null;
      reject(new Error('Google Maps failed to load'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** A LatLng object or literal → plain numbers. */
export function toLatLng(p: any): { lat: number; lng: number } | null {
  if (!p) return null;
  const lat = typeof p.lat === 'function' ? p.lat() : p.lat;
  const lng = typeof p.lng === 'function' ? p.lng() : p.lng;
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}
