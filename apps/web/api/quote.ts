import { handle, json, readJson } from '../server/http.js';
import { quote } from '../server/orders.js';
import { quoteRequestSchema } from '../shared/schema.js';

/** POST /api/quote { lat, lng }: the delivery fee to that spot, or 422 if it's outside the area. */
export const POST = handle(async (request) => json(await quote(await readJson(request, quoteRequestSchema))));
