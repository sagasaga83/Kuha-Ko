// Shop details shown on the website. Fill these in as they are confirmed:
// anything left as null shows a "coming soon" line instead.
export const site = {
  name: 'Kuha Ko',
  city: 'Iloilo City',
  /** Grand opening; the lease starts the same day. */
  openingDate: '2027-06-22',
  /** Show the opening date on the home page, the About page and the footer. Set to false to hide it again. */
  showOpeningDate: true,
  /** When live selling starts on the thrift page, shown until the first live's date is set in the admin. */
  liveSellingFrom: 'November 2026',
  address: null as string | null,
  hours: null as string | null,
  /** Full https:// links. Check that the handles are free before printing them anywhere. */
  instagram: { handle: '@kuhako', url: null as string | null },
  facebook: { name: 'Kuha Ko Thrift', url: null as string | null },
};

/** "June 22, 2027", or null when the opening date is hidden. */
export function openingDayText(): string | null {
  if (!site.showOpeningDate) return null;
  return new Date(`${site.openingDate}T12:00:00+08:00`).toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
