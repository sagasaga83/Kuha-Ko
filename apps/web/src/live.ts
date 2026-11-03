// The next live selling: when it is, how to show it, and calendar links for it.
// The time is set in the admin (Settings → Live selling) and comes with the catalog.
import { useCatalog } from './catalog/catalog';

/** How long a live runs, for calendar entries. */
const LENGTH_MS = 2 * 3600_000;
/** After the start, keep showing it (as "live now", then just the time) for this long. */
const SHOW_FOR_MS = 3 * 3600_000;

export interface NextLive {
  start: Date;
  /** Started and still within the usual length: "Live now". */
  now: boolean;
  /** "Saturday, November 14" */
  day: string;
  /** "Sat, Nov 14" */
  shortDay: string;
  /** "8:00 PM" */
  time: string;
}

const zone = { timeZone: 'Asia/Manila' } as const;

/** The next live from an ISO date-time, or null when there's none, it's invalid, or it's long over. */
export function nextLiveFrom(iso: string | null, now = Date.now()): NextLive | null {
  if (!iso) return null;
  const start = new Date(iso);
  const t = start.getTime();
  if (Number.isNaN(t) || now > t + SHOW_FOR_MS) return null;
  return {
    start,
    now: now >= t && now < t + LENGTH_MS,
    day: start.toLocaleDateString('en-PH', { ...zone, weekday: 'long', day: 'numeric', month: 'long' }),
    shortDay: start.toLocaleDateString('en-PH', { ...zone, weekday: 'short', day: 'numeric', month: 'short' }),
    time: start.toLocaleTimeString('en-PH', { ...zone, hour: 'numeric', minute: '2-digit' }),
  };
}

export function useNextLive(): NextLive | null {
  return nextLiveFrom(useCatalog().nextLive);
}

/** 20261114T120000Z */
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const TITLE = 'Kuha Ko Thrift live selling';
const details = (url: string | null) =>
  `Comment KUHA KO! and the item number to claim a piece. First comment gets it.${url ? ` ${url}` : ''}`;

export function googleCalendarUrl(live: NextLive, pageUrl: string | null): string {
  const end = new Date(live.start.getTime() + LENGTH_MS);
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: TITLE,
    dates: `${stamp(live.start)}/${stamp(end)}`,
    details: details(pageUrl),
    ctz: 'Asia/Manila',
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

/** An .ics file as a data: URL, for Apple Calendar, Outlook and the rest. */
export function icsHref(live: NextLive, pageUrl: string | null): string {
  const end = new Date(live.start.getTime() + LENGTH_MS);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kuha Ko//Live selling//EN',
    'BEGIN:VEVENT',
    `UID:live-${stamp(live.start)}@kuhako`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(live.start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${TITLE}`,
    `DESCRIPTION:${details(pageUrl).replace(/[,;]/g, '\\$&')}`,
    ...(pageUrl ? [`URL:${pageUrl}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
