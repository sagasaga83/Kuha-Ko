import { HttpError, handle, json, readJson } from '../server/http.js';
import { getAccount, requireCustomer, saveProfile } from '../server/customers.js';
import { normalizePhone } from '../shared/order.js';
import { profileSchema } from '../shared/schema.js';

/** GET /api/account: the signed-in customer's saved details and their orders. */
export const GET = handle(async (request) => json(await getAccount(await requireCustomer(request))));

/** PUT /api/account: save the customer's checkout details. */
export const PUT = handle(async (request) => {
  const id = await requireCustomer(request);
  const body = await readJson(request, profileSchema);
  const phone = body.phone ? normalizePhone(body.phone) : '';
  if (phone === null) throw new HttpError(400, 'Check your mobile number: it should look like 0917 123 4567.');
  await saveProfile(id, { ...body, phone });
  return json(await getAccount(id));
});
