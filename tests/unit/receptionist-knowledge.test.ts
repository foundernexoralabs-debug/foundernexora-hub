// @vitest-environment node
// @polsia:user-owned — the Renor Guide's knowledge base obeys the site's honesty rules.
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BILLING_PATH, SELLER_IDENTITY } from '../../src/lib/business/billing';
import { CHANNELS, RENOR_APP_URL } from '../../src/lib/business/ecosystem';
import { PLANS } from '../../src/lib/business/plans';
import { findPlugin } from '../../src/lib/business/plugins';
import { isOneTime } from '../../src/lib/business/pricing';
import { makesForbiddenClaim } from '../../src/lib/business/receptionist/guard';
import { KNOWLEDGE } from '../../src/lib/business/receptionist/knowledge';

const appDir = path.resolve(__dirname, '../../src/app');

function routes(dir = appDir, prefix = ''): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (!statSync(full).isDirectory()) {
      if (entry === 'page.tsx') found.push(prefix || '/');
      continue;
    }
    if (entry === 'api' || entry.startsWith('_')) continue;
    const segment = /^\(.*\)$/.test(entry) ? '' : `/${entry}`;
    found.push(...routes(full, prefix + segment));
  }
  return found;
}
const ROUTES = new Set(routes());
const CONFIRMED_URLS = new Set([RENOR_APP_URL, ...CHANNELS.map((c) => c.url).filter(Boolean)]);

describe('Renor Guide knowledge base', () => {
  it('has unique ids and non-empty answers', () => {
    const ids = KNOWLEDGE.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const entry of KNOWLEDGE) expect(entry.answer.trim().length, entry.id).toBeGreaterThan(20);
  });

  it('cites a page that exists, or a confirmed https URL, for every answer', () => {
    for (const entry of KNOWLEDGE) {
      const { href } = entry.source;
      if (href.startsWith('/')) {
        const pathname = href.split('#')[0] || '/';
        const plugin = /^\/plugins\/([^/]+)$/.exec(pathname);
        const ok = ROUTES.has(pathname) || Boolean(plugin?.[1] && findPlugin(plugin[1]));
        expect(ok, `${entry.id} → ${href}`).toBe(true);
      } else {
        expect(href.startsWith('https://'), href).toBe(true);
        expect(CONFIRMED_URLS.has(href), `${entry.id} cites an unconfirmed URL ${href}`).toBe(true);
      }
    }
  });

  it('says a paid plan is not on sale wherever it gives its price', () => {
    for (const plan of PLANS.filter((p) => p.price.amount > 0)) {
      const mentions = KNOWLEDGE.filter((entry) => entry.answer.includes(plan.price.label));
      expect(mentions.length, plan.name).toBeGreaterThan(0);
      // "plan…" ids only: a Plugin Store product can share a price label (£29) with a plan.
      for (const entry of mentions.filter((e) => e.id.startsWith('plan')))
        expect(entry.answer, entry.id).toMatch(/not on sale yet/i);
    }
    const overview = KNOWLEDGE.find((entry) => entry.id === 'plans-overview');
    expect(overview?.answer).toMatch(/open when checkout goes live/);
  });

  it('no longer calls the approved prices proposed or unapproved', () => {
    for (const entry of KNOWLEDGE)
      expect(`${entry.title} ${entry.answer}`, entry.id).not.toMatch(/proposed|not approved/i);
  });

  it('answers billing, cancelling and refunds from the billing page', () => {
    const billing = KNOWLEDGE.find((entry) => entry.id === 'billing-refunds');
    expect(billing?.source.href).toBe(BILLING_PATH);
    if (isOneTime()) {
      // One-time pricing (src/lib/business/pricing.ts): single payments and a 14-day refund.
      expect(billing?.answer).toMatch(/nothing renews/i);
      expect(billing?.answer).toMatch(/full refund within 14 days/);
    } else {
      expect(billing?.answer).toMatch(/cancel any time/i);
      expect(billing?.answer).toMatch(/within 14 days of first paying/);
      expect(billing?.answer).toMatch(/no overage charges/);
      expect(billing?.answer).toMatch(/at least 30 days/);
    }
    expect(billing?.answer).toMatch(/not on sale|nothing can be bought/i);
    const seller = KNOWLEDGE.find((entry) => entry.id === 'seller');
    expect(seller?.answer).toContain(SELLER_IDENTITY);
    expect(seller?.source.href.startsWith(BILLING_PATH)).toBe(true);
  });

  it('never claims registration, VAT, an address, certification or unlimited use', () => {
    for (const entry of KNOWLEDGE) expect(makesForbiddenClaim(entry.answer), entry.id).toBe(false);
  });

  it('answers the registration question by declining to confirm it', () => {
    const legal = KNOWLEDGE.find((entry) => entry.id === 'company-legal');
    expect(legal?.answer).toMatch(/can[’']t confirm/);
  });

  it('never calls the Guide a b-o-t', () => {
    const word = ['b', 'o', 't'].join('');
    for (const entry of KNOWLEDGE)
      expect(`${entry.title} ${entry.answer}`, entry.id).not.toMatch(
        new RegExp(`\\b${word}s?\\b`, 'i'),
      );
  });
});
