import { z } from 'zod';
import { checkPassword, clearCookie, isAdmin, sessionCookie } from '../../server/auth.js';
import { fail, handle, json, readJson } from '../../server/http.js';

// Sign-in, sign-out and the session check share one function: the Hobby plan allows 12 per deployment.

const body = z.object({ password: z.string().min(1).max(200) });

/** GET /api/admin/session: is this browser signed in? */
export const GET = handle(async (request) => json({ admin: isAdmin(request) }));

/** POST /api/admin/session { password }: signs in. */
export const POST = handle(async (request) => {
  const { password } = await readJson(request, body);
  if (!checkPassword(password)) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 800));
    return fail(401, 'That password is not right.');
  }
  return json({ admin: true }, { headers: { 'set-cookie': sessionCookie(request) } });
});

/** DELETE /api/admin/session: signs out. */
export const DELETE = handle(async (request) => json({ admin: false }, { headers: { 'set-cookie': clearCookie(request) } }));
