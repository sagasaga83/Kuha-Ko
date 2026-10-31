import { z } from 'zod';
import { HttpError, handle, json, readJson } from '../server/http.js';
import { cancelOrder, getOrderView, submitReference } from '../server/orders.js';

const idOf = (request: Request) => {
  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new HttpError(404, 'We can’t find that order.');
  return id;
};

/** GET /api/order?id=…: the order, and where to pay while it's unpaid. The id is the secret. */
export const GET = handle(async (request) => {
  const view = await getOrderView(idOf(request));
  if (!view) throw new HttpError(404, 'We can’t find that order.');
  return json(view);
});

const action = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel') }),
  z.object({ action: z.literal('reference'), reference: z.string().max(60) }),
]);

/**
 * POST /api/order?id=…
 *   { action: "reference", reference }: "I've paid", with the receipt's reference number
 *   { action: "cancel" }: cancel before paying, and release the items
 */
export const POST = handle(async (request) => {
  const id = idOf(request);
  const body = await readJson(request, action);
  if (body.action === 'cancel') await cancelOrder(id);
  else await submitReference(id, body.reference, new URL(request.url).origin);
  return json(await getOrderView(id));
});
