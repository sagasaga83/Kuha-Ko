import { handle, json, readJson } from '../server/http.js';
import { createOrder } from '../server/orders.js';
import { customerIdFrom } from '../server/customers.js';
import { checkoutRequestSchema } from '../shared/schema.js';

/**
 * POST /api/checkout: re-prices the cart from the database and holds stock for
 * 30 minutes. The customer then pays on their order page (/order/:id).
 * Signed-in customers (Clerk token in Authorization) get the order on their account.
 */
export const POST = handle(async (request) => {
  const body = await readJson(request, checkoutRequestSchema);
  return json(await createOrder(body, await customerIdFrom(request)), { status: 201 });
});
