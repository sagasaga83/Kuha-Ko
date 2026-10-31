import { handle, json, readJson } from '../server/http.js';
import { createOrder } from '../server/orders.js';
import { checkoutRequestSchema } from '../shared/schema.js';

/**
 * POST /api/checkout: re-prices the cart from the database, holds stock for 30
 * minutes, and returns the PayMongo page to pay on.
 */
export const POST = handle(async (request) => {
  const body = await readJson(request, checkoutRequestSchema);
  const result = await createOrder(body, new URL(request.url).origin);
  return json(result, { status: 201 });
});
