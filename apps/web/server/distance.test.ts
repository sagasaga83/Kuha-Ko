// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { haversineM, roadDistance, ROAD_FACTOR } from './distance';

const shop = { lat: 10.6969, lng: 122.5644 }; // around Iloilo City proper
const jaro = { lat: 10.7276, lng: 122.5574 };
const manila = { lat: 14.5995, lng: 120.9842 };
const key = process.env.GOOGLE_ROUTES_KEY;
afterEach(() => {
  process.env.GOOGLE_ROUTES_KEY = key;
});

describe('distance', () => {
  it('measures straight-line distance', () => {
    expect(haversineM(shop, shop)).toBe(0);
    expect(haversineM(shop, jaro)).toBeGreaterThan(3300);
    expect(haversineM(shop, jaro)).toBeLessThan(3600);
  });
  it('estimates road distance without a Routes key', async () => {
    delete process.env.GOOGLE_ROUTES_KEY;
    const d = await roadDistance(shop, jaro, 8);
    expect(d?.estimated).toBe(true);
    expect(d?.meters).toBe(Math.round(haversineM(shop, jaro) * ROAD_FACTOR));
  });
  it('refuses far-away places without asking Google', async () => {
    process.env.GOOGLE_ROUTES_KEY = 'would-fail-if-called';
    const d = await roadDistance(shop, manila, 8);
    expect(d?.meters).toBeGreaterThan(8000);
  });
});
