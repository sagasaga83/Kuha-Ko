import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let sql: NeonQueryFunction<false, false> | null = null;

/** The Neon client, created on first use so builds and tests don't need DATABASE_URL. */
export function db(): NeonQueryFunction<false, false> {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set. Run `vercel env pull` in the repo root.');
    sql = neon(url);
  }
  return sql;
}
