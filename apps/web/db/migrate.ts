// Applies db/migrations/*.sql in order, once each. Run from the repo root:
//   npm run db:migrate --workspace @kuhako/web
// It reads DATABASE_URL from the repo's .env.local (made by `vercel env pull`).
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db } from '../server/db.js';

const dir = fileURLToPath(new URL('./migrations/', import.meta.url));

async function main() {
  const sql = db();
  await sql`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
  const done = new Set((await sql`SELECT name FROM schema_migrations`).map((r) => r.name as string));
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    if (done.has(file)) continue;
    const statements = readFileSync(dir + file, 'utf8')
      .replace(/--.*$/gm, '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    // One transaction per file: a failed migration leaves nothing half-applied.
    await sql.transaction([
      ...statements.map((s) => sql.query(s)),
      sql`INSERT INTO schema_migrations (name) VALUES (${file})`,
    ]);
    console.log(`applied ${file}`);
  }
  console.log('migrations up to date');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
