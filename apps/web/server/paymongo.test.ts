// @vitest-environment node
import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyWebhookSignature } from './paymongo';

const secret = 'whsk_test_secret';
const body = '{"data":{"attributes":{"type":"checkout_session.payment.paid"}}}';
const sig = (t: string, b = body, key = secret) => createHmac('sha256', key).update(`${t}.${b}`).digest('hex');

describe('PayMongo webhook signature', () => {
  it('accepts a correct test-mode signature', () => {
    expect(verifyWebhookSignature(body, `t=1496734173,te=${sig('1496734173')},li=`, secret, false)).toBe(true);
  });
  it('uses li for live keys', () => {
    const header = `t=1492224173,te=,li=${sig('1492224173')}`;
    expect(verifyWebhookSignature(body, header, secret, true)).toBe(true);
    expect(verifyWebhookSignature(body, header, secret, false)).toBe(false);
  });
  it('rejects a changed body, timestamp, secret or missing header', () => {
    const header = `t=1496734173,te=${sig('1496734173')},li=`;
    expect(verifyWebhookSignature(body.replace('paid', 'PAID'), header, secret, false)).toBe(false);
    expect(verifyWebhookSignature(body, header.replace('t=1496734173', 't=1496734174'), secret, false)).toBe(false);
    expect(verifyWebhookSignature(body, header, 'whsk_other', false)).toBe(false);
    expect(verifyWebhookSignature(body, null, secret, false)).toBe(false);
    expect(verifyWebhookSignature(body, header, '', false)).toBe(false);
    expect(verifyWebhookSignature(body, 'garbage', secret, false)).toBe(false);
  });
});
