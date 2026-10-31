import { z } from 'zod';
import { requireAdmin } from '../../server/auth.js';
import { HttpError, handle, json, readJson } from '../../server/http.js';
import { ADMIN_ACTIONS, adminUpdateOrder, listOrders } from '../../server/orders.js';

/** GET /api/admin/orders?filter=open|all: orders, the ones needing action first. */
export const GET = handle(async (request) => {
  requireAdmin(request);
  const filter = new URL(request.url).searchParams.get('filter') === 'all' ? 'all' : 'open';
  return json({ orders: await listOrders(filter) });
});

/** POST /api/admin/orders { id, action }: confirm or reject a payment, or move a delivery along. */
export const POST = handle(async (request) => {
  requireAdmin(request);
  const { id, action } = await readJson(request, z.object({ id: z.string().uuid(), action: z.enum(ADMIN_ACTIONS) }));
  if (!id) throw new HttpError(400, 'Which order?');
  return json({ order: await adminUpdateOrder(id, action, new URL(request.url).origin) });
});
