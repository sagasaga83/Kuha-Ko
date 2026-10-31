import { handle, json, readJson } from '../server/http.js';
import { createOrder } from '../server/orders.js';
import { checkoutRequestSchema } from '../shared/schema.js';

/**
 * POST /api/checkout: re-prices the cart from the database and holds stock for
 * 30 minutes. The customer then pays on their order page (/order/:id).
 */
export const POST = handle(async (request) => {
  const body = await readJson(request, checkoutRequestSchema);
  return json(await createOrder(body), { status: 201 });
});
