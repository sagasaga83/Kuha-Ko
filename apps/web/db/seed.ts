// Fills an empty catalog from the site's current content and sets default settings.
// Safe to run again: it never overwrites rows that already exist (so prices and
// edits made in the admin page are kept). Run from the repo root:
//   npm run db:seed --workspace @kuhako/web
import { db } from '../server/db.js';
import { DEFAULT_SETTINGS } from '../shared/catalog.js';
import { seedProducts } from '../shared/seed.js';

async function main() {
  const sql = db();
  const products = seedProducts();
  const added = await sql.transaction(
    products.map(
      (p) => sql`
        INSERT INTO products (id, kind, category, name, description, detail, photo_url, price, options, stock, active, featured, sort)
        VALUES (${p.id}, ${p.kind}, ${p.category}, ${p.name}, ${p.description}, ${p.detail}, ${p.photoUrl},
                ${p.price}, ${JSON.stringify(p.options)}::jsonb, ${p.stock}, ${p.active}, ${p.featured}, ${p.sort})
        ON CONFLICT (id) DO NOTHING
        RETURNING id`,
    ),
  );
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await sql`INSERT INTO settings (key, value) VALUES (${key}, ${JSON.stringify(value)}::jsonb) ON CONFLICT (key) DO NOTHING`;
  }
  console.log(`added ${added.filter((r) => r.length).length} of ${products.length} products; settings ready`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
