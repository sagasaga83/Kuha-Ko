import { isAdmin } from '../../server/auth.js';
import { handle, json } from '../../server/http.js';

/** GET /api/admin/session: is this browser signed in? */
export const GET = handle(async (request) => json({ admin: isAdmin(request) }));
