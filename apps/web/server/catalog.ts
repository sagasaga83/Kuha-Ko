import { db } from './db.js';
import { HttpError } from './http.js';
import { availablePaymentMethods, DEFAULT_SETTINGS, slugify, type Catalog, type Product, type Settings } from '../shared/catalog.js';
import { productInputSchema, settingsSchema } from '../shared/schema.js';
import type { z } from 'zod';

type Row = Record<string, unknown>;

export function rowToProduct(r: Row): Product {
  return {
    id: r.id as string,
    kind: r.kind as Product['kind'],
    category: r.category as string,
    name: r.name as string,
    description: r.description as string,
    detail: r.detail as string,
    photoUrl: (r.photo_url as string | null) ?? null,
    price: (r.price as number | null) ?? null,
    options: (r.options as Product['options']) ?? [],
    stock: (r.stock as number | null) ?? null,
    active: r.active as boolean,
    featured: r.featured as boolean,
    sort: r.sort as number,
  };
}

const ORDER = `ORDER BY CASE kind WHEN 'coffee' THEN 0 WHEN 'shirt' THEN 1 ELSE 2 END, category, sort, name`;

export async function listProducts({ activeOnly }: { activeOnly: boolean }): Promise<Product[]> {
  const sql = db();
  const rows = activeOnly
    ? await sql.query(`SELECT * FROM products WHERE active ${ORDER}`)
    : await sql.query(`SELECT * FROM products ${ORDER}`);
  return rows.map(rowToProduct);
}

export async function getSettings(): Promise<Settings> {
  const rows = await db()`SELECT key, value FROM settings`;
  const stored = Object.fromEntries(rows.map((r) => [r.key as string, r.value]));
  // Missing keys fall back to defaults, so new settings don't need a migration.
  const parsed = settingsSchema.safeParse({ ...DEFAULT_SETTINGS, ...stored });
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const sql = db();
  await sql.transaction(
    Object.entries(settings).map(
      ([key, value]) => sql`
        INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    ),
  );
}

export async function getCatalog(): Promise<Catalog> {
  const [products, settings] = await Promise.all([listProducts({ activeOnly: true }), getSettings()]);
  return {
    products,
    ordering: settings.ordering,
    deliveryReady: settings.delivery.origin !== null,
    paymentMethods: availablePaymentMethods(settings.payment),
  };
}

type ProductInput = z.infer<typeof productInputSchema>;

/** Creates a product. The id comes from the name unless given; a clash gets a number added. */
export async function createProduct(input: ProductInput): Promise<Product> {
  const sql = db();
  const base = input.id ?? (slugify(input.name) || input.kind);
  for (let n = 1; n < 50; n++) {
    const id = n === 1 ? base : `${base.slice(0, 56)}-${n}`;
    const rows = await sql`
      INSERT INTO products (id, kind, category, name, description, detail, photo_url, price, options, stock, active, featured, sort)
      VALUES (${id}, ${input.kind}, ${input.category}, ${input.name}, ${input.description}, ${input.detail}, ${input.photoUrl},
              ${input.price}, ${JSON.stringify(input.options)}::jsonb, ${input.stock}, ${input.active}, ${input.featured}, ${input.sort})
      ON CONFLICT (id) DO NOTHING
      RETURNING *`;
    if (rows[0]) return rowToProduct(rows[0]);
    if (input.id) throw new HttpError(409, `There is already a product with the id "${input.id}".`);
  }
  throw new HttpError(409, 'Could not find a free id for this product. Try another name.');
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const rows = await db()`
    UPDATE products SET
      kind = ${input.kind}, category = ${input.category}, name = ${input.name}, description = ${input.description},
      detail = ${input.detail}, photo_url = ${input.photoUrl}, price = ${input.price},
      options = ${JSON.stringify(input.options)}::jsonb, stock = ${input.stock}, active = ${input.active},
      featured = ${input.featured}, sort = ${input.sort}, updated_at = now()
    WHERE id = ${id}
    RETURNING *`;
  if (!rows[0]) throw new HttpError(404, 'That product no longer exists.');
  return rowToProduct(rows[0]);
}

export async function deleteProduct(id: string): Promise<void> {
  const rows = await db()`DELETE FROM products WHERE id = ${id} RETURNING id`;
  if (!rows[0]) throw new HttpError(404, 'That product no longer exists.');
}
