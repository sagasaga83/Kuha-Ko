import { describe, expect, it } from 'vitest';
import { parseLatLng } from './SettingsPanel';

describe('shop location', () => {
  it('reads coordinates pasted from Google Maps', () => {
    expect(parseLatLng('10.6969, 122.5644')).toEqual({ lat: 10.6969, lng: 122.5644 });
    expect(parseLatLng('10.6969,122.5644')).toEqual({ lat: 10.6969, lng: 122.5644 });
    expect(parseLatLng('')).toBeNull();
    expect(parseLatLng('Iloilo City')).toBe('bad');
    expect(parseLatLng('100, 122')).toBe('bad');
  });
});
