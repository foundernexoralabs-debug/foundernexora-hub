// @polsia:user-owned — the public site's honesty rules, as tests.
// A broken internal link, an http link, an invented price or a missing
// screenshot fails the build instead of reaching a visitor.
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CHANNELS,
  MILESTONES,
  PROJECTS,
  PUBLIC_REPO_URL,
  RENOR_APP_URL,
  RENOR_AREAS,
  SOCIAL_CHANNELS,
  STATUS,
} from '../../src/lib/business/ecosystem';
import { PLANS } from '../../src/lib/business/plans';
import { findPlugin } from '../../src/lib/business/plugins';
import { navItems } from '../../src/lib/nav';

const appDir = path.resolve(__dirname, '../../src/app');
const publicDir = path.resolve(__dirname, '../../public');

/** Every URL path the App Router serves from a page.tsx (route groups and dynamic segments resolved). */
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

function servesInternal(href: string): boolean {
  const pathname = href.split(/[?#]/)[0] || '/';
  if (ROUTES.has(pathname)) return true;
  // /plugins/[slug] serves only catalogued products, so a link into it must name a real one.
  const plugin = /^\/plugins\/([^/]+)$/.exec(pathname);
  return Boolean(plugin?.[1] && ROUTES.has('/plugins/[slug]') && findPlugin(plugin[1]));
}

describe('internal links', () => {
  it('every page the nav, projects and footer link to exists', () => {
    const hrefs = [
      ...navItems.map((item) => item.href),
      ...PROJECTS.map((project) => project.href),
    ].filter((href) => href.startsWith('/'));
    for (const href of hrefs) expect(servesInternal(href), href).toBe(true);
  });

  it('the core company pages exist', () => {
    for (const route of [
      '/',
      '/renor',
      '/renor/plans',
      '/plugins',
      '/zero-to-prove',
      '/projects',
      '/company',
      '/contact',
      '/privacy',
      '/terms',
      '/accessibility',
    ]) {
      expect(ROUTES.has(route), route).toBe(true);
    }
  });
});

describe('external links', () => {
  it('are https, and social channels are either verified URLs or explicitly unlinked', () => {
    const external = [
      RENOR_APP_URL,
      PUBLIC_REPO_URL,
      ...navItems.map((item) => item.href),
      ...PROJECTS.map((project) => project.href),
    ].filter((href) => /^[a-z]+:/i.test(href));
    for (const url of external) expect(url.startsWith('https://'), url).toBe(true);
    for (const channel of CHANNELS) {
      if (channel.url !== null) expect(channel.url.startsWith('https://'), channel.name).toBe(true);
    }
  });

  it('links exactly the channels the founder confirmed on 21 October 2026', () => {
    const urlOf = (id: string) => CHANNELS.find((channel) => channel.id === id)?.url;
    expect(urlOf('youtube')).toBe('https://www.youtube.com/@zero2proof');
    expect(urlOf('tiktok')).toBe('https://www.tiktok.com/@sajadi90');
    expect(urlOf('links')).toBe('https://zero-to-proof-links.vercel.app');
    expect(urlOf('fiverr')).toBe('https://www.fiverr.com/abi_bim');
  });

  it('lists the social links and the Renor Labs shop for the footer and Contact, all confirmed', () => {
    expect(SOCIAL_CHANNELS.map((channel) => channel.id)).toEqual([
      'youtube',
      'tiktok',
      'links',
      'fiverr',
      'renor-labs',
    ]);
    for (const channel of SOCIAL_CHANNELS) expect(channel.url.startsWith('https://')).toBe(true);
  });
});

describe('claims', () => {
  it('every project and Renor area uses a defined status', () => {
    for (const item of [...PROJECTS, ...RENOR_AREAS])
      expect(Object.keys(STATUS)).toContain(item.status);
  });

  it('every plan price is a proposal while billing does not exist', () => {
    for (const plan of PLANS) expect(plan.price.status, plan.name).toBe('proposed');
  });

  it('only Free is open; every paid plan is still proposed', () => {
    for (const plan of PLANS.filter((entry) => entry.id !== 'free'))
      expect(plan.state, plan.name).toBe('proposed');
  });

  it('every screenshot referenced on the site exists in public/', () => {
    for (const area of RENOR_AREAS) {
      if (area.screenshot)
        expect(existsSync(path.join(publicDir, area.screenshot.src)), area.screenshot.src).toBe(
          true,
        );
    }
  });

  it('known gaps stay disclosed next to the features they limit', () => {
    // Remove a line here only in the same commit that ships the missing piece.
    const limits = (id: string) => RENOR_AREAS.find((area) => area.id === id)?.limits ?? '';
    expect(limits('builder')).toMatch(/no photography or imagery/i);
    expect(limits('builder')).toMatch(/ZIP/);
    expect(limits('code')).toMatch(/GitHub Pages only/);
    expect(limits('code')).toMatch(/not yet on large/i);
  });

  it('no feature is still labelled as waiting for a release candidate', () => {
    const copy = JSON.stringify([RENOR_AREAS, MILESTONES, PLANS]);
    expect(copy).not.toMatch(/release candidate|public preview/i);
  });

  it('milestones are real dates, newest first', () => {
    const times = MILESTONES.map((milestone) => Date.parse(`${milestone.date}T00:00:00Z`));
    for (const time of times) expect(Number.isNaN(time)).toBe(false);
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });
});

describe('public contact email', () => {
  it('is the founder-confirmed address, linked as mailto', async () => {
    const { CONTACT_EMAIL, CONTACT_MAILTO } = await import('../../src/lib/business/ecosystem');
    expect(CONTACT_EMAIL).toBe('founder.nexoralabs@gmail.com');
    expect(CONTACT_MAILTO).toBe('mailto:founder.nexoralabs@gmail.com');
  });
});
