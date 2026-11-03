import { describe, expect, it } from 'vitest';
import { fromLocalField, parseLatLng, toLocalField } from './SettingsPanel';

describe('shop location', () => {
  it('reads coordinates pasted from Google Maps', () => {
    expect(parseLatLng('10.6969, 122.5644')).toEqual({ lat: 10.6969, lng: 122.5644 });
    expect(parseLatLng('10.6969,122.5644')).toEqual({ lat: 10.6969, lng: 122.5644 });
    expect(parseLatLng('')).toBeNull();
    expect(parseLatLng('Iloilo City')).toBe('bad');
    expect(parseLatLng('100, 122')).toBe('bad');
  });
});

describe('next live time', () => {
  it('is typed and shown in Philippine time', () => {
    expect(fromLocalField('2026-11-14T20:00')).toBe('2026-11-14T20:00:00+08:00');
    expect(fromLocalField('')).toBeNull();
    expect(fromLocalField('tonight')).toBe('bad');
    expect(toLocalField('2026-11-14T20:00:00+08:00')).toBe('2026-11-14T20:00');
    expect(toLocalField('2026-11-14T12:00:00Z')).toBe('2026-11-14T20:00');
    expect(toLocalField(null)).toBe('');
  });
});
