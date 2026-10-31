import { formatOpening, site } from '../data/site';

export function Announcement() {
  return (
    <p className="announce">
      Live selling from {site.liveSellingFrom}
      <span aria-hidden="true"> · </span>
      <span className="announce__break">Opening {formatOpening(site.openingDate)}</span>
    </p>
  );
}
