import { z } from 'zod';
import { checkPassword, sessionCookie } from '../../server/auth.js';
import { fail, handle, json, readJson } from '../../server/http.js';

const body = z.object({ password: z.string().min(1).max(200) });

/** POST /api/admin/login { password } */
export const POST = handle(async (request) => {
  const { password } = await readJson(request, body);
  if (!checkPassword(password)) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 800));
    return fail(401, 'That password is not right.');
  }
  return json({ admin: true }, { headers: { 'set-cookie': sessionCookie(request) } });
});
