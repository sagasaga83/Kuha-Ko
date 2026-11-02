// Order emails through Resend (https://resend.com/docs/api-reference/emails/send-email).
// RESEND_API_KEY and RESEND_EMAIL_DOMAIN come from the Vercel Marketplace integration;
// mail is sent from orders@<that domain> (override with EMAIL_FROM). The domain must
// be verified in Resend (DNS records) before mail is delivered.
// SHOP_EMAIL gets a note when a customer sends a payment reference to check; the
// customer gets a receipt (if they gave an email) once the shop confirms it.
// Email never blocks an order: failures are logged, not thrown.
import { formatPeso } from '../shared/catalog.js';
import type { OrderView } from '../shared/order.js';

export function fromAddress(env: Record<string, string | undefined> = process.env): string {
  if (env.EMAIL_FROM) return env.EMAIL_FROM;
  if (env.RESEND_EMAIL_DOMAIN) return `Kuha Ko <orders@${env.RESEND_EMAIL_DOMAIN}>`;
  return 'Kuha Ko <onboarding@resend.dev>';
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function send(to: string, subject: string, text: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`email skipped (RESEND_API_KEY not set): ${subject}`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: fromAddress(), to: [to], subject, text, html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error('Resend', res.status, await res.text().catch(() => ''));
  } catch (err) {
    console.error('Resend', err);
  }
}

function lines(order: OrderView, totalLabel: string) {
  const items = order.items.map((i) => {
    const opts = i.choices.map((c) => c.value).join(', ');
    return { text: `${i.quantity} × ${i.name}${opts ? ` (${opts})` : ''}`, amount: formatPeso(i.lineTotal) };
  });
  const totals = [
    { text: 'Subtotal', amount: formatPeso(order.subtotal) },
    { text: 'Delivery', amount: formatPeso(order.deliveryFee) },
    { text: totalLabel, amount: formatPeso(order.total) },
  ];
  const textBlock = [...items, ...totals].map((l) => `${l.text}  ${l.amount}`).join('\n');
  const row = (l: { text: string; amount: string }, bold = false) =>
    `<tr><td style="padding:4px 12px 4px 0;${bold ? 'font-weight:700' : ''}">${esc(l.text)}</td><td style="padding:4px 0;text-align:right;${bold ? 'font-weight:700' : ''}">${esc(l.amount)}</td></tr>`;
  const htmlBlock = `<table style="border-collapse:collapse;font:15px/1.5 Helvetica,Arial,sans-serif;color:#3B2A20">${items.map((l) => row(l)).join('')}${totals.map((l, i) => row(l, i === 2)).join('')}</table>`;
  return { textBlock, htmlBlock };
}

const wrap = (body: string) =>
  `<div style="font:15px/1.6 Helvetica,Arial,sans-serif;color:#3B2A20;max-width:520px">${body}</div>`;

const METHOD = { gcash: 'GCash', qrph: 'Maya (QR Ph)' } as const;

/** To the shop: a customer says they've paid; check the reference in GCash or the bank app. */
export async function sendPaymentToCheck(order: OrderView, phone: string, siteUrl: string): Promise<void> {
  const shop = process.env.SHOP_EMAIL;
  if (!shop) {
    console.warn(`email skipped (SHOP_EMAIL not set): payment to check for ${order.code}`);
    return;
  }
  const { textBlock, htmlBlock } = lines(order, 'Total to check');
  const method = METHOD[order.paymentMethod] ?? order.paymentMethod;
  const subject = `Check payment: ${order.code}, ${formatPeso(order.total)} by ${method}`;
  const text = `${order.customerName} says they paid ${formatPeso(order.total)} by ${method}.\nReference: ${order.paymentReference}\n\nFind it in your ${order.paymentMethod === 'gcash' ? 'GCash' : 'Maya Business'} app, then confirm it in the admin: ${siteUrl}/admin\n\n${textBlock}\n\nDeliver to: ${order.customerName}, ${phone}\n${order.address}${order.addressNotes ? `\nNotes: ${order.addressNotes}` : ''}`;
  const html = wrap(
    `<p><strong>${esc(order.customerName)}</strong> says they paid <strong>${esc(formatPeso(order.total))}</strong> by ${esc(method)}.</p><p style="font-size:18px">Reference: <strong style="font-family:Courier,monospace">${esc(order.paymentReference ?? '')}</strong></p><p>Find it in your app, then <a href="${esc(siteUrl)}/admin">confirm it in the admin</a>.</p>${htmlBlock}<p><strong>Deliver to</strong><br>${esc(order.customerName)}, ${esc(phone)}<br>${esc(order.address)}${order.addressNotes ? `<br>Notes: ${esc(order.addressNotes)}` : ''}</p>`,
  );
  await send(shop, subject, text, html);
}

/** To the customer, once the shop has confirmed their payment. */
export async function sendReceipt(order: OrderView, email: string, siteUrl: string): Promise<void> {
  const { textBlock, htmlBlock } = lines(order, 'Total paid');
  const link = `${siteUrl}/order/${order.id}`;
  const subject = `Kuha Ko order ${order.code}: payment received`;
  const text = `Salamat, ${order.customerName}!\n\nWe’ve received your payment for order ${order.code}.\n\n${textBlock}\n\nDelivering to: ${order.address}\n\nFollow your order: ${link}\n\nKuha Ko · Iloilo City`;
  const html = wrap(
    `<p>Salamat, ${esc(order.customerName)}.</p><p>We’ve received your payment for order <strong>${esc(order.code)}</strong>.</p>${htmlBlock}<p>Delivering to: ${esc(order.address)}</p><p><a href="${esc(link)}">Follow your order</a></p><p style="color:#5E4B3C">Kuha Ko · Iloilo City</p>`,
  );
  await send(email, subject, text, html);
}
