import { requireAdmin } from '../../server/auth.js';
import { HttpError, handle, json } from '../../server/http.js';
import { listSignups, removeSignup } from '../../server/signups.js';

/** GET /api/admin/signups: everyone who asked for the live schedule, newest first. */
export const GET = handle(async (request) => {
  requireAdmin(request);
  return json({ signups: await listSignups() });
});

/** DELETE /api/admin/signups?email=…: takes someone off the list (when they ask). */
export const DELETE = handle(async (request) => {
  requireAdmin(request);
  const email = new URL(request.url).searchParams.get('email');
  if (!email) throw new HttpError(400, 'Which email?');
  await removeSignup(email);
  return json({ ok: true });
});
