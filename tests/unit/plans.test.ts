// @polsia:user-owned — plans are honest: Free signs you up in the real app, every price is
// labelled as proposed, no plan promises unlimited use, and none links to a checkout.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONTACT_MAILTO, RENOR_APP_URL } from '../../src/lib/business/ecosystem';
import {
  allowanceLines,
  earlyListHref,
  PAID_PLANS_NOTICE,
  PLAN_FAQ,
  PLANS,
  PROPOSED_LABEL,
} from '../../src/lib/business/plans';

const plan = (id: string) => PLANS.find((entry) => entry.id === id);
const CHECKOUT_PATTERN =
  /checkout|plugandpay|stripe|paypal|lemonsqueezy|gumroad|paddle|\/pay\b|\/buy\b/i;
const page = () =>
  readFileSync(path.resolve(__dirname, '../../src/app/(custom)/renor/plans/page.tsx'), 'utf-8');

describe('plans', () => {
  it('are Free, Pro, Plus and Max, in that order', () => {
    expect(PLANS.map((entry) => entry.name)).toEqual(['Free', 'Pro', 'Plus', 'Max']);
  });

  it('carry the proposed prices £0 / £12 / £29 / £79 per month, every one marked proposed', () => {
    expect(PLANS.map((entry) => [entry.price.label, entry.price.amount])).toEqual([
      ['£0', 0],
      ['£12', 12],
      ['£29', 29],
      ['£79', 79],
    ]);
    for (const entry of PLANS) {
      expect(entry.price.status, entry.name).toBe('proposed');
      expect(entry.price.period, entry.name).toBe('per month');
    }
    expect(PROPOSED_LABEL).toBe('Proposed price');
    expect(page()).toContain('{PROPOSED_LABEL}');
    expect(page()).toContain('Proposed allowances');
  });

  it('express allowances as numbers: weekly credits, projects, concurrent jobs and models', () => {
    expect(PLANS.map((entry) => entry.allowances.creditsPerWeek)).toEqual([50, 600, 1800, 6000]);
    expect(PLANS.map((entry) => entry.allowances.activeProjects)).toEqual([2, 10, 30, 100]);
    expect(PLANS.map((entry) => entry.allowances.concurrentJobs)).toEqual([1, 2, 4, 8]);
    expect(plan('free')?.allowances.models).toMatch(/efficient models/i);
    expect(plan('pro')?.allowances.models).toMatch(/stronger models/i);
    expect(plan('plus')?.allowances.models).toMatch(/strongest models.*reasoning.*coding/i);
    expect(plan('max')?.allowances.models).toMatch(/highest priority.*background autonomous/i);
    const plus = plan('plus');
    expect(plus && allowanceLines(plus)[0]?.value).toBe('1,800 per week');
  });

  it('never promise unlimited use', () => {
    expect(JSON.stringify(PLANS)).not.toMatch(/unlimited|no limits?\b|limitless/i);
    const unlimited = PLAN_FAQ.find((item) => /unlimited/i.test(item.q));
    expect(unlimited?.a).toMatch(/^No\./);
  });

  it('Free is open and its button goes to sign-up in the Renor app', () => {
    expect(plan('free')?.state).toBe('open');
    expect(plan('free')?.action).toMatchObject({ kind: 'signup', href: RENOR_APP_URL });
  });

  it('Pro, Plus and Max only join an early list by email, with the subject filled in', () => {
    for (const id of ['pro', 'plus', 'max']) {
      const entry = plan(id);
      expect(entry?.state, id).toBe('proposed');
      expect(entry?.action.kind, id).toBe('early-list');
      expect(entry?.action.label, id).toBe('Join the early list');
      expect(entry?.action.href.startsWith(`${CONTACT_MAILTO}?subject=`), id).toBe(true);
      const subject = decodeURIComponent(entry?.action.href.split('?subject=')[1] ?? '');
      expect(subject, id).toBe(`Renor ${entry?.name}: add me to the early list`);
      expect(entry?.action.note, id).toMatch(/no payment/i);
    }
    expect(earlyListHref('Plus')).toContain('subject=Renor%20Plus');
  });

  it('no plan links to a checkout or payment page', () => {
    for (const entry of PLANS) {
      expect(entry.action.href, entry.name).not.toMatch(CHECKOUT_PATTERN);
      expect(entry.action.label, entry.name).not.toMatch(/buy|pay|checkout|subscribe|upgrade/i);
    }
    expect(page()).not.toMatch(/checkoutUrl|VERIFIED_CHECKOUT_HOSTS|plugandpay/i);
  });

  it('the FAQ answers resets, running out, plan changes and unlimited use', () => {
    const text = PLAN_FAQ.map((item) => `${item.q} ${item.a}`).join('\n');
    expect(text).toMatch(/Every week/);
    expect(text).toMatch(/pauses until your credits reset, and nothing is lost/);
    expect(text).toMatch(/upgrades, downgrades and cancellation .* before billing opens/);
    expect(PAID_PLANS_NOTICE).toMatch(/open once their prices are approved/);
    expect(page()).toContain('PLAN_FAQ');
    expect(page()).toContain('PAID_PLANS_NOTICE');
  });

  it('nothing still calls the top plan "Advanced"', () => {
    expect(JSON.stringify(PLANS)).not.toMatch(/"Advanced"/);
  });
});
