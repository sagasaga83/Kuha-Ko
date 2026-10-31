import { db } from '../server/db.js';
import { fail, handle, json } from '../server/http.js';
import { markPaid } from '../server/orders.js';
import { getCheckoutSession, isLiveMode, verifyWebhookSignature } from '../server/paymongo.js';

/**
 * POST /api/paymongo-webhook: PayMongo calls this when a checkout is paid
 * (event checkout_session.payment.paid). The signature is checked against the
 * raw body, then the session is fetched from PayMongo itself: the event body is
 * never trusted for amounts. Replays are harmless because marking paid is idempotent.
 */
export const POST = handle(async (request) => {
  const raw = await request.text();
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET ?? '';
  if (!verifyWebhookSignature(raw, request.headers.get('paymongo-signature'), secret, isLiveMode())) {
    return fail(401, 'Bad signature');
  }
  const event = JSON.parse(raw) as {
    data?: { attributes?: { type?: string; data?: { id?: string; type?: string } } };
  };
  const type = event.data?.attributes?.type;
  const sessionId = event.data?.attributes?.data?.id;
  if (type !== 'checkout_session.payment.paid' || !sessionId) return json({ received: true, ignored: type ?? 'unknown' });

  const [order] = await db()`SELECT id FROM orders WHERE checkout_session_id = ${sessionId}`;
  if (!order) {
    console.error('webhook for unknown checkout session', sessionId);
    return json({ received: true, ignored: 'unknown session' });
  }
  const session = await getCheckoutSession(sessionId);
  if (session.paid) await markPaid(order.id as string, session.paid, new URL(request.url).origin);
  return json({ received: true });
});
