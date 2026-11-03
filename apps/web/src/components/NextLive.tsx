import { site } from '../data/site';
import { googleCalendarUrl, icsHref, useNextLive } from '../live';

const pageUrl = () => (typeof window === 'undefined' ? null : `${window.location.origin}/live`);

/** When the next live is, with calendar links; or, until it's set, where it will be announced. */
export function NextLive() {
  const live = useNextLive();
  return (
    <div className="next-live" aria-live="polite">
      <p className="label next-live__label">
        {live?.now ? (
          <>
            <span className="next-live__dot" aria-hidden="true" /> Live now
          </>
        ) : (
          'Next live'
        )}
      </p>
      {live ? (
        <>
          <p className="next-live__day">{live.day}</p>
          <p className="next-live__time">{live.time}, Philippine time</p>
          <p className="next-live__links">
            {live.now && site.facebook.url ? (
              <a className="text-link" href={site.facebook.url} target="_blank" rel="noreferrer">
                Watch on Facebook
              </a>
            ) : (
              <>
                <a className="text-link" href={googleCalendarUrl(live, pageUrl())} target="_blank" rel="noreferrer">
                  Add to Google Calendar
                </a>
                <a className="text-link" href={icsHref(live, pageUrl())} download="kuha-ko-live.ics">
                  Other calendars
                </a>
              </>
            )}
          </p>
        </>
      ) : (
        <>
          <p className="next-live__day">Date announced soon</p>
          <p className="next-live__time">Live selling starts {site.liveSellingFrom}.</p>
        </>
      )}
      {site.facebook.url && !live?.now ? (
        <p className="next-live__follow">
          <a className="text-link" href={site.facebook.url} target="_blank" rel="noreferrer">
            Follow {site.facebook.name} on Facebook
          </a>
        </p>
      ) : null}
    </div>
  );
}
