// Road distance from the shop, for the delivery fee. Uses Google's Routes API
// (motorbike routing, which covers the Philippines) when GOOGLE_ROUTES_KEY is set;
// otherwise a straight-line estimate with a road factor, marked `estimated`.
import { HttpError } from './http.js';

export interface LatLng {
  lat: number;
  lng: number;
}

/** Straight-line distance in metres. */
export function haversineM(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Roads are longer than a straight line; in a city about a third longer. */
export const ROAD_FACTOR = 1.35;

async function routesApi(origin: LatLng, dest: LatLng, mode: 'TWO_WHEELER' | 'DRIVE', key: string): Promise<number | null> {
  const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': key,
      'x-goog-fieldmask': 'routes.distanceMeters,routes.duration',
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: { location: { latLng: { latitude: dest.lat, longitude: dest.lng } } },
      travelMode: mode,
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) {
    console.error('Routes API', res.status, await res.text().catch(() => ''));
    throw new HttpError(502, 'We couldn’t work out the delivery distance just now. Please try again.');
  }
  const data = (await res.json()) as { routes?: { distanceMeters?: number }[] };
  const m = data.routes?.[0]?.distanceMeters;
  return typeof m === 'number' ? m : null;
}

/**
 * Road distance in metres, or null when no route exists. Addresses clearly past
 * `maxKm` in a straight line are refused without calling Google.
 */
export async function roadDistance(origin: LatLng, dest: LatLng, maxKm: number): Promise<{ meters: number; estimated: boolean } | null> {
  const straight = haversineM(origin, dest);
  if (straight > maxKm * 1000) return { meters: Math.round(straight), estimated: true };
  const key = process.env.GOOGLE_ROUTES_KEY;
  if (!key) return { meters: Math.round(straight * ROAD_FACTOR), estimated: true };
  const meters = (await routesApi(origin, dest, 'TWO_WHEELER', key)) ?? (await routesApi(origin, dest, 'DRIVE', key));
  return meters === null ? null : { meters, estimated: false };
}
