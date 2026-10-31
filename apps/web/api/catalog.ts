import { getCatalog } from '../server/catalog.js';
import { handle, json } from '../server/http.js';

/** GET /api/catalog: what's on sale, and which kinds take orders now. */
export const GET = handle(async () =>
  json(await getCatalog(), {
    // Short CDN cache: admin changes show within a minute, and busy moments hit the DB rarely.
    headers: { 'cache-control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300' },
  }),
);
