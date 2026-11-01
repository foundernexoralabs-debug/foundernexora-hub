// @polsia:user-owned — plans are honest: Free signs you up in the real app, prices are the ones the
// founder approved (31 October 2026), allowances are labelled as planned, no plan promises
// unlimited use, and no paid plan can be bought: none links to a checkout until it goes live.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BILLING_PATH } from '../../src/lib/business/billing';
import { CONTACT_MAILTO, RENOR_APP_URL } from '../../src/lib/business/ecosystem';
import {
  ALLOWANCES_LABEL,
  ALLOWANCES_NOTE,
  allowanceLines,
  earlyListHref,
  PAID_PLANS_NOTICE,
  PLAN_FAQ,
  PLANS,
  PRICES_APPROVED_ON,
  priceList,
} from '../../src/lib/business/plans';

const plan = (id: string) => PLANS.find((entry) => entry.id === id);
const faq = (pattern: RegExp) => PLAN_FAQ.find((item) => pattern.test(item.q));
const CHECKOUT_PATTERN =
  /checkout|plugandpay|stripe|paypal|lemonsqueezy|gumroad|paddle|\/pay\b|\/buy\b/i;
const page = () =>
  readFileSync(path.resolve(__dirname, '../../src/app/(custom)/renor/plans/page.tsx'), 'utf-8');

describe('plans', () => {
  it('are Free, Pro, Plus and Max, in that order', () => {
    expect(PLANS.map((entry) => entry.name)).toEqual(['Free', 'Pro', 'Plus', 'Max']);
  });

  it('carry the approved prices £0 / £12 / £29 / £79 per month, every one marked approved', () => {
    expect(PLANS.map((entry) => [entry.price.label, entry.price.amount])).toEqual([
      ['£0', 0],
      ['£12', 12],
      ['£29', 29],
      ['£79', 79],
    ]);
    for (const entry of PLANS) {
      expect(entry.price.status, entry.name).toBe('approved');
      expect(entry.price.period, entry.name).toBe('per month');
    }
    expect(PRICES_APPROVED_ON).toBe('31 October 2026');
    expect(priceList()).toBe('Free £0, Pro £12, Plus £29 and Max £79');
  });

  it('no longer calls any price proposed or unapproved, on the page or in the data', () => {
    const everything = `${page()}\n${JSON.stringify(PLANS)}\n${JSON.stringify(PLAN_FAQ)}\n${PAID_PLANS_NOTICE}`;
    expect(everything).not.toMatch(/proposed|not approved|PROPOSED_LABEL/i);
  });

  it('label allowances as planned, with one honest line about credit rates', () => {
    expect(ALLOWANCES_LABEL).toBe('Planned allowances');
    expect(ALLOWANCES_NOTE).toMatch(/credit rates are published before billing opens/);
    expect(page()).toContain('{ALLOWANCES_LABEL}');
    expect(page()).toContain('{ALLOWANCES_NOTE}');
  });

  it('express allowances as numbers: weekly credits, projects, concurrent jobs and models', () => {
    expect(PLANS.map((entry) => entry.allowances.creditsPerWeek)).toEqual([50, 600, 1800, 6000]);
    expect(PLANS.map((entry) => entry.allowances.activeProjects)).toEqual([2, 10, 30, 100]);
    expect(PLANS.map((entry) => entry.allowances.concurrentJobs)).toEqual([1, 2, 4, 8]);
    for (const entry of PLANS) {
      const { creditsPerWeek, activeProjects, concurrentJobs } = entry.allowances;
      for (const value of [creditsPerWeek, activeProjects, concurrentJobs])
        expect(Number.isInteger(value) && value > 0, entry.name).toBe(true);
    }
    expect(plan('free')?.allowances.models).toMatch(/efficient models/i);
    expect(plan('pro')?.allowances.models).toMatch(/stronger models/i);
    expect(plan('plus')?.allowances.models).toMatch(/strongest models.*reasoning.*coding/i);
    expect(plan('max')?.allowances.models).toMatch(/highest priority.*background autonomous/i);
    const plus = plan('plus');
    expect(plus && allowanceLines(plus)[0]?.value).toBe('1,800 per week');
  });

  it('never promise unlimited use', () => {
    expect(JSON.stringify(PLANS)).not.toMatch(/unlimited|no limits?\b|limitless/i);
    expect(faq(/unlimited/i)?.a).toMatch(/^No\./);
  });

  it('Free is open and its button goes to sign-up in the Renor app', () => {
    expect(plan('free')?.state).toBe('open');
    expect(plan('free')?.action).toMatchObject({ kind: 'signup', href: RENOR_APP_URL });
  });

  it('Pro, Plus and Max are not on sale: they only join an early list by email', () => {
    for (const id of ['pro', 'plus', 'max']) {
      const entry = plan(id);
      expect(entry?.state, id).toBe('not-on-sale');
      expect(entry?.action.kind, id).toBe('early-list');
      expect(entry?.action.label, id).toBe('Join the early list');
      expect(entry?.action.href.startsWith(`${CONTACT_MAILTO}?subject=`), id).toBe(true);
      const subject = decodeURIComponent(entry?.action.href.split('?subject=')[1] ?? '');
      expect(subject, id).toBe(`Renor ${entry?.name}: add me to the early list`);
      expect(entry?.action.note, id).toMatch(/no payment/i);
    }
    expect(earlyListHref('Plus')).toContain('subject=Renor%20Plus');
    expect(PAID_PLANS_NOTICE).toMatch(/open when checkout goes live/);
    expect(PAID_PLANS_NOTICE).toMatch(/nothing can be bought and nothing is charged/);
    expect(page()).toContain('Paid plans are not on sale yet.');
    expect(page()).toContain('PAID_PLANS_NOTICE');
  });

  it('no plan links to a checkout or payment page', () => {
    for (const entry of PLANS) {
      expect(entry.action.href, entry.name).not.toMatch(CHECKOUT_PATTERN);
      expect(entry.action.label, entry.name).not.toMatch(/buy|pay|checkout|subscribe|upgrade/i);
    }
    expect(page()).not.toMatch(/checkoutUrl|VERIFIED_CHECKOUT_HOSTS|plugandpay|stripe\.com/i);
  });

  it('the FAQ answers resets, running out, plan changes and unlimited use', () => {
    const text = PLAN_FAQ.map((item) => `${item.q} ${item.a}`).join('\n');
    expect(text).toMatch(/Every week/);
    expect(text).toMatch(/pauses until your credits reset or you upgrade, and nothing is lost/);
    expect(text).toMatch(/no overage charges/);
    expect(page()).toContain('PLAN_FAQ');
  });

  it('says the prices are final (approved), and the allowances are not yet', () => {
    const answer = faq(/prices final/i)?.a ?? '';
    expect(answer).toMatch(/^Yes\./);
    expect(answer).toContain(PRICES_APPROVED_ON);
    expect(answer).toContain('Pro £12, Plus £29 and Max £79');
    expect(answer).toMatch(/at least 30 days/);
    expect(answer).toMatch(/allowances are still planned/);
  });

  it('answers upgrading, downgrading and cancelling with the billing rules, and links the billing page', () => {
    const item = faq(/upgrade, downgrade or cancel/i);
    expect(item?.a).toMatch(/Cancel any time/);
    expect(item?.a).toMatch(/end of the month you paid for/);
    expect(item?.a).toMatch(/within 14 days of first paying .* refund the unused days/);
    expect(item?.a).toMatch(/Upgrades start straight away.*pro rata/);
    expect(item?.a).toMatch(/downgrades start at your next renewal/);
    expect(item?.link?.href).toBe(BILLING_PATH);
    // The page renders FAQ links, and links the billing page from the notice and the FAQ intro.
    expect(page()).toContain('item.link.href');
    expect(page().match(/href=\{BILLING_PATH\}/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('nothing still calls the top plan "Advanced"', () => {
    expect(JSON.stringify(PLANS)).not.toMatch(/"Advanced"/);
  });
});
