import { requireAdmin } from '../../server/auth.js';
import { getSettings, saveSettings } from '../../server/catalog.js';
import { handle, json, readJson } from '../../server/http.js';
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
  await saveSettings(settings);
  return json({ settings });
});
