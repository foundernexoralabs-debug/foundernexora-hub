// @polsia:user-owned — every page ends with relevant, working next steps, and the
// footer reaches every part of the company from every page.
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { RENOR_APP_URL } from '../../src/lib/business/ecosystem';
import {
  DESTINATIONS,
  type DestinationId,
  EXPLORE,
  type ExplorePage,
} from '../../src/lib/business/explore';
import { navItems } from '../../src/lib/nav';

const appDir = path.resolve(__dirname, '../../src/app');

function routes(dir = appDir, prefix = ''): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (!statSync(full).isDirectory()) return entry === 'page.tsx' ? [prefix || '/'] : [];
    if (entry === 'api' || entry.startsWith('_')) return [];
    return routes(full, prefix + (/^\(.*\)$/.test(entry) ? '' : `/${entry}`));
  });
}
const ROUTES = new Set(routes());

/** The route each band is rendered on, so a page never suggests itself. */
const PAGE_ROUTE: Partial<Record<ExplorePage, string>> = {
  home: '/',
  renor: '/renor',
  plans: '/renor/plans',
  store: '/store',
  projects: '/projects',
  'zero-to-prove': '/zero-to-prove',
  company: '/company',
  contact: '/contact',
  accessibility: '/accessibility',
  privacy: '/privacy',
  terms: '/terms',
};

describe('Explore FounderLab destinations', () => {
  it('internal destinations resolve to real pages; external ones are the verified Renor app', () => {
    for (const [id, destination] of Object.entries(DESTINATIONS)) {
      if (destination.external) {
        expect(destination.href, id).toBe(RENOR_APP_URL);
        expect(destination.href.startsWith('https://'), id).toBe(true);
      } else {
        expect(ROUTES.has(destination.href.split('#')[0] || '/'), id).toBe(true);
      }
    }
  });

  it('each page offers three or four distinct next steps, never itself', () => {
    for (const [page, set] of Object.entries(EXPLORE) as [
      ExplorePage,
      (typeof EXPLORE)[ExplorePage],
    ][]) {
      expect(set.destinations.length, page).toBeGreaterThanOrEqual(3);
      expect(set.destinations.length, page).toBeLessThanOrEqual(4);
      expect(new Set(set.destinations).size, page).toBe(set.destinations.length);
      const own = PAGE_ROUTE[page];
      for (const id of set.destinations) expect(DESTINATIONS[id].href, page).not.toBe(own);
    }
  });

  it('pages do not all end with the same block', () => {
    const signatures = new Set(Object.values(EXPLORE).map((set) => set.destinations.join(',')));
    expect(signatures.size).toBeGreaterThan(Object.keys(EXPLORE).length / 2);
  });

  it('every destination is suggested somewhere', () => {
    const used = new Set<DestinationId>(Object.values(EXPLORE).flatMap((set) => set.destinations));
    for (const id of Object.keys(DESTINATIONS))
      expect(used.has(id as DestinationId), id).toBe(true);
  });
});

describe('footer', () => {
  it('links every part of the company, including Accessibility and the Renor app', () => {
    const footer = navItems.filter((item) => item.group === 'footer').map((item) => item.href);
    for (const href of [
      '/renor',
      '/renor/plans',
      RENOR_APP_URL,
      '/store',
      '/store#policies',
      '/projects',
      '/zero-to-prove',
      '/company',
      '/contact',
      '/accessibility',
      '/privacy',
      '/terms',
    ]) {
      expect(footer, href).toContain(href);
    }
  });
});
