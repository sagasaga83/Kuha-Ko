import { requireAdmin } from '../../server/auth.js';
import { getSettings, saveSettings } from '../../server/catalog.js';
import { HttpError, handle, json, readJson } from '../../server/http.js';
import { normalizePhone } from '../../shared/order.js';
import { settingsSchema } from '../../shared/schema.js';

/** GET /api/admin/settings */
export const GET = handle(async (request) => {
  requireAdmin(request);
  return json({ settings: await getSettings() });
});

/** PUT /api/admin/settings: delivery area and fees, and which kinds take orders. */
export const PUT = handle(async (request) => {
  requireAdmin(request);
  const settings = await readJson(request, settingsSchema);
  if (settings.payment.gcashNumber) {
    const phone = normalizePhone(settings.payment.gcashNumber);
    if (!phone) throw new HttpError(400, 'GCash number: it should look like 0917 123 4567.');
    settings.payment.gcashNumber = phone;
  }
  await saveSettings(settings);
  return json({ settings });
});
