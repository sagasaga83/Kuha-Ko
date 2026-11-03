import { describe, expect, it } from 'vitest';
import { googleCalendarUrl, icsHref, nextLiveFrom } from './live';

const start = '2026-11-14T20:00:00+08:00';
const at = (iso: string) => new Date(iso).getTime();

describe('the next live', () => {
  it('shows the day and time in Philippine time', () => {
    const live = nextLiveFrom(start, at('2026-11-10T09:00:00+08:00'))!;
    expect(live.day).toBe('Saturday, November 14');
    expect(live.shortDay).toBe('Sat, Nov 14');
    expect(live.time).toBe('8:00 PM');
    expect(live.now).toBe(false);
  });

  it('is "live now" for two hours, then goes away after three', () => {
    expect(nextLiveFrom(start, at('2026-11-14T20:30:00+08:00'))?.now).toBe(true);
    expect(nextLiveFrom(start, at('2026-11-14T22:30:00+08:00'))?.now).toBe(false);
    expect(nextLiveFrom(start, at('2026-11-14T23:01:00+08:00'))).toBe(null);
  });

  it('ignores a missing or broken date', () => {
    expect(nextLiveFrom(null)).toBe(null);
    expect(nextLiveFrom('soon')).toBe(null);
  });

  it('makes calendar links for a two-hour live', () => {
    const live = nextLiveFrom(start, at('2026-11-10T09:00:00+08:00'))!;
    expect(new URL(googleCalendarUrl(live, null)).searchParams.get('dates')).toBe('20261114T120000Z/20261114T140000Z');
    const ics = decodeURIComponent(icsHref(live, 'https://kuhako.ph/live').split(',')[1]);
    expect(ics).toContain('DTSTART:20261114T120000Z');
    expect(ics).toContain('DTEND:20261114T140000Z');
    expect(ics).toContain('URL:https://kuhako.ph/live');
  });
});
