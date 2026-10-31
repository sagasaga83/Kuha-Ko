// Shop details shown on the website. Fill these in as they are confirmed:
// anything left as null shows a "coming soon" line instead.
export const site = {
  name: 'Kuha Ko',
  city: 'Iloilo City',
  /** Grand opening; the lease starts the same day. Not shown on the site for now. */
  openingDate: '2027-06-22',
  /** When live selling starts on the thrift page. */
  liveSellingFrom: 'November 2026',
  address: null as string | null,
  hours: null as string | null,
  /** Full https:// links. Check that the handles are free before printing them anywhere. */
  instagram: { handle: '@kuhako', url: null as string | null },
  facebook: { name: 'Kuha Ko Thrift', url: null as string | null },
};
