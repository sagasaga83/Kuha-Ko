import { z } from 'zod';
import { HttpError, handle, json, readJson } from '../server/http.js';
import { cancelOrder, getOrderView } from '../server/orders.js';

const idOf = (request: Request) => {
  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new HttpError(404, 'We can’t find that order.');
  return id;
};

/** GET /api/order?id=…: the order's status, for the customer's order page. The id is the secret. */
export const GET = handle(async (request) => {
  const view = await getOrderView(idOf(request), { sync: true, siteUrl: new URL(request.url).origin });
  if (!view) throw new HttpError(404, 'We can’t find that order.');
  return json(view);
});

/** POST /api/order?id=… { action: "cancel" }: cancel an unpaid order and release its items. */
export const POST = handle(async (request) => {
  const id = idOf(request);
  await readJson(request, z.object({ action: z.literal('cancel') }));
  await cancelOrder(id);
  return json(await getOrderView(id, { sync: false }));
});
