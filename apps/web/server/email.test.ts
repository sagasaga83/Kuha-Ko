// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { fromAddress } from './email';

describe('email sender', () => {
  it('sends from orders@ the Resend domain, unless EMAIL_FROM overrides it', () => {
    expect(fromAddress({ RESEND_EMAIL_DOMAIN: 'send.kuha-ko.com' })).toBe('Kuha Ko <orders@send.kuha-ko.com>');
    expect(fromAddress({ RESEND_EMAIL_DOMAIN: 'send.kuha-ko.com', EMAIL_FROM: 'Kuha Ko <hi@kuha-ko.com>' })).toBe('Kuha Ko <hi@kuha-ko.com>');
    expect(fromAddress({})).toBe('Kuha Ko <onboarding@resend.dev>');
  });
});
