// Order emails through Resend (https://resend.com/docs/api-reference/emails/send-email).
// RESEND_API_KEY and RESEND_EMAIL_DOMAIN come from the Vercel Marketplace integration;
// mail is sent from orders@<that domain> (override with EMAIL_FROM). The domain must
// be verified in Resend (DNS records) before mail is delivered.
// SHOP_EMAIL gets a note for every paid order; the customer gets a receipt if they
// gave an email. Email never blocks an order: failures are logged, not thrown.
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

function lines(order: OrderView) {
  const items = order.items.map((i) => {
    const opts = i.choices.map((c) => c.value).join(', ');
    return { text: `${i.quantity} × ${i.name}${opts ? ` (${opts})` : ''}`, amount: formatPeso(i.lineTotal) };
  });
  const totals = [
    { text: 'Subtotal', amount: formatPeso(order.subtotal) },
    { text: 'Delivery', amount: formatPeso(order.deliveryFee) },
    { text: 'Total paid', amount: formatPeso(order.total) },
  ];
  const textBlock = [...items, ...totals].map((l) => `${l.text}  ${l.amount}`).join('\n');
  const row = (l: { text: string; amount: string }, bold = false) =>
    `<tr><td style="padding:4px 12px 4px 0;${bold ? 'font-weight:700' : ''}">${esc(l.text)}</td><td style="padding:4px 0;text-align:right;${bold ? 'font-weight:700' : ''}">${esc(l.amount)}</td></tr>`;
  const htmlBlock = `<table style="border-collapse:collapse;font:15px/1.5 Helvetica,Arial,sans-serif;color:#3B2A20">${items.map((l) => row(l)).join('')}${totals.map((l, i) => row(l, i === 2)).join('')}</table>`;
  return { textBlock, htmlBlock };
}

const wrap = (body: string) =>
  `<div style="font:15px/1.6 Helvetica,Arial,sans-serif;color:#3B2A20;max-width:520px">${body}</div>`;

export async function sendOrderEmails(order: OrderView, contact: { phone: string; email: string | null }, siteUrl: string): Promise<void> {
  const { textBlock, htmlBlock } = lines(order);
  const link = `${siteUrl}/order/${order.id}`;
  const jobs: Promise<void>[] = [];

  const shop = process.env.SHOP_EMAIL;
  if (shop) {
    const subject = `New order ${order.code}: ${formatPeso(order.total)}`;
    const text = `New paid order ${order.code}\n\n${textBlock}\n\nDeliver to: ${order.customerName}, ${contact.phone}\n${order.address}${order.addressNotes ? `\nNotes: ${order.addressNotes}` : ''}\n\nManage it at ${siteUrl}/admin`;
    const html = wrap(
      `<p><strong>New paid order ${esc(order.code)}</strong></p>${htmlBlock}<p><strong>Deliver to</strong><br>${esc(order.customerName)}, ${esc(contact.phone)}<br>${esc(order.address)}${order.addressNotes ? `<br>Notes: ${esc(order.addressNotes)}` : ''}</p><p><a href="${esc(siteUrl)}/admin">Open the shop admin</a></p>`,
    );
    jobs.push(send(shop, subject, text, html));
  }

  if (contact.email) {
    const subject = `Kuha Ko order ${order.code}: thank you`;
    const text = `Salamat, ${order.customerName}!\n\nWe’ve got your order ${order.code} and payment.\n\n${textBlock}\n\nDelivering to: ${order.address}\n\nFollow your order: ${link}\n\nKuha Ko · Iloilo City`;
    const html = wrap(
      `<p>Salamat, ${esc(order.customerName)}!</p><p>We’ve got your order <strong>${esc(order.code)}</strong> and payment.</p>${htmlBlock}<p>Delivering to: ${esc(order.address)}</p><p><a href="${esc(link)}">Follow your order</a></p><p style="color:#5E4B3C">Kuha Ko · Iloilo City</p>`,
    );
    jobs.push(send(contact.email, subject, text, html));
  }

  await Promise.all(jobs);
}
