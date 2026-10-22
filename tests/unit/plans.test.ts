// @polsia:user-owned — plans are honest: Free signs you up in the real app, and no paid
// plan pretends it can be bought while no checkout is configured or approved.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONTACT_MAILTO, RENOR_APP_URL } from '../../src/lib/business/ecosystem';
import { earlyListHref, PAID_PLANS_NOTICE, PLANS } from '../../src/lib/business/plans';

const plan = (id: string) => PLANS.find((entry) => entry.id === id);
const CHECKOUT_PATTERN =
  /checkout|plugandpay|stripe|paypal|lemonsqueezy|gumroad|paddle|\/pay\b|\/buy\b/i;

describe('plans', () => {
  it('are Free, Pro and Max, in that order', () => {
    expect(PLANS.map((entry) => entry.name)).toEqual(['Free', 'Pro', 'Max']);
  });

  it('Free is open and its button goes to sign-up in the Renor app', () => {
    expect(plan('free')?.state).toBe('open');
    expect(plan('free')?.action).toMatchObject({ kind: 'signup', href: RENOR_APP_URL });
  });

  it('Pro and Max stay proposed, with no price invented', () => {
    for (const id of ['pro', 'max']) {
      expect(plan(id)?.state, id).toBe('proposed');
      expect(plan(id)?.price, id).toBe('Price not set');
    }
  });

  it('Pro and Max only join an early list by email, with the subject filled in', () => {
    for (const id of ['pro', 'max']) {
      const action = plan(id)?.action;
      expect(action?.kind, id).toBe('early-list');
      expect(action?.label, id).toBe('Join the early list');
      expect(action?.href.startsWith(`${CONTACT_MAILTO}?subject=`), id).toBe(true);
      const subject = decodeURIComponent(action?.href.split('?subject=')[1] ?? '');
      expect(subject, id).toMatch(new RegExp(`Renor ${plan(id)?.name}`));
      expect(action?.note, id).toMatch(/no payment/i);
    }
    expect(earlyListHref('Pro')).toContain('subject=Renor%20Pro');
  });

  it('no plan links to a checkout or payment page', () => {
    for (const entry of PLANS) {
      expect(entry.action.href, entry.name).not.toMatch(CHECKOUT_PATTERN);
      expect(entry.action.label, entry.name).not.toMatch(/buy|pay|checkout|subscribe|upgrade/i);
    }
  });

  it('the plans page says plainly that paid plans open once prices are approved', () => {
    expect(PAID_PLANS_NOTICE).toMatch(/open once their prices are approved/);
    const page = readFileSync(
      path.resolve(__dirname, '../../src/app/(custom)/renor/plans/page.tsx'),
      'utf-8',
    );
    expect(page).toContain('PAID_PLANS_NOTICE');
    expect(page).not.toMatch(/checkoutUrl|VERIFIED_CHECKOUT_HOSTS|plugandpay/i);
  });

  it('nothing on the site still calls the top plan "Advanced"', () => {
    const copy = JSON.stringify(PLANS);
    expect(copy).not.toMatch(/"Advanced"/);
  });
});
