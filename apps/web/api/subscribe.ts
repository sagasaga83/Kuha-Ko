import { z } from 'zod';
import { handle, json, readJson } from '../server/http.js';
import { addSignup } from '../server/signups.js';
import { subscribeRequestSchema } from '../shared/schema.js';

/** POST /api/subscribe { email, source? }: asks to hear when the next live selling starts. */
export const POST = handle(async (request) => {
  const body = await readJson(request, subscribeRequestSchema.extend({ source: z.enum(['live', 'footer']).default('live') }));
  // The hidden field is only ever filled in by bots: answer as if it worked, and keep nothing.
  if (!body.website) await addSignup(body.email, body.source);
  return json({ ok: true }, { status: 201 });
});
