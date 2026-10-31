import type { DeliverySettings } from './catalog';

/**
 * The delivery fee for a road distance, in centavos, or null when it's past the
 * delivery area. Base fee covers the first `baseKm`; each further km, or part of
 * one, adds `perKm`. Used by the checkout (server) and the admin fee preview.
 */
export function deliveryFee(distanceM: number, d: Pick<DeliverySettings, 'radiusKm' | 'baseFee' | 'baseKm' | 'perKm'>): number | null {
  if (!Number.isFinite(distanceM) || distanceM < 0) return null;
  const km = distanceM / 1000;
  if (km > d.radiusKm) return null;
  const extraKm = Math.max(0, Math.ceil(km - d.baseKm - 1e-9));
  return d.baseFee + extraKm * d.perKm;
}
