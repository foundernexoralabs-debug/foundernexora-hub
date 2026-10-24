// @vitest-environment node
// @polsia:user-owned — the Renor Guide's knowledge base obeys the site's honesty rules.
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHANNELS, RENOR_APP_URL } from '../../src/lib/business/ecosystem';
import { PLANS } from '../../src/lib/business/plans';
import { findPlugin } from '../../src/lib/business/plugins';
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

  it('labels every paid-plan price as proposed', () => {
    for (const plan of PLANS.filter((p) => p.price.amount > 0)) {
      const mentions = KNOWLEDGE.filter((entry) => entry.answer.includes(plan.price.label));
      expect(mentions.length, plan.name).toBeGreaterThan(0);
      for (const entry of mentions.filter((e) => e.id.startsWith('plan')))
        expect(entry.answer, entry.id).toMatch(/proposed/i);
    }
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
