import { requireAdmin } from '../../server/auth.js';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../../server/catalog.js';
import { HttpError, handle, json, readJson } from '../../server/http.js';
import { productInputSchema } from '../../shared/schema.js';

const idParam = (request: Request) => {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) throw new HttpError(400, 'Which product? Add ?id=');
  return id;
};

/** GET /api/admin/products: everything, hidden items included. */
export const GET = handle(async (request) => {
  requireAdmin(request);
  return json({ products: await listProducts({ activeOnly: false }) });
});

/** POST /api/admin/products: add a product. */
export const POST = handle(async (request) => {
  requireAdmin(request);
  const input = await readJson(request, productInputSchema);
  return json({ product: await createProduct(input) }, { status: 201 });
});

/** PUT /api/admin/products?id=…: replace a product's fields. */
export const PUT = handle(async (request) => {
  requireAdmin(request);
  const input = await readJson(request, productInputSchema);
  return json({ product: await updateProduct(idParam(request), input) });
});

/** DELETE /api/admin/products?id=… */
export const DELETE = handle(async (request) => {
  requireAdmin(request);
  await deleteProduct(idParam(request));
  return json({ ok: true });
});
