import { clearCookie } from '../../server/auth.js';
import { handle, json } from '../../server/http.js';

/** POST /api/admin/logout */
export const POST = handle(async (request) => json({ admin: false }, { headers: { 'set-cookie': clearCookie(request) } }));
