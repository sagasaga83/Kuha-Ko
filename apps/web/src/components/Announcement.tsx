import { site } from '../data/site';

export function Announcement() {
  return <p className="announce">Live selling on {site.facebook.name} from {site.liveSellingFrom}</p>;
}
