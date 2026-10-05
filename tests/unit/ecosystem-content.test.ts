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
  STATUS,
} from '../../src/lib/business/ecosystem';
import { PLANS } from '../../src/lib/business/plans';
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
  const pathname = href.split('#')[0] || '/';
  if (ROUTES.has(pathname)) return true;
  // Dynamic segments such as /store/[slug] serve their own catalogue; a static link must not point into one.
  return false;
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
      '/store',
      '/zero-to-prove',
      '/projects',
      '/company',
      '/contact',
      '/privacy',
      '/terms',
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

  it('does not guess YouTube or TikTok handles: they stay unlinked until the founder confirms them', () => {
    // Change this expectation in the same commit that adds a confirmed channel URL.
    expect(CHANNELS.find((channel) => channel.id === 'youtube')?.url).toBeNull();
    expect(CHANNELS.find((channel) => channel.id === 'tiktok')?.url).toBeNull();
  });
});

describe('claims', () => {
  it('every project and Renor area uses a defined status', () => {
    for (const item of [...PROJECTS, ...RENOR_AREAS])
      expect(Object.keys(STATUS)).toContain(item.status);
  });

  it('no paid plan shows a price while billing does not exist', () => {
    for (const plan of PLANS) {
      expect(plan.price, plan.name).not.toMatch(/[€$£]\s?\d|\d+\s?(?:€|\$|£|EUR|USD|GBP)|\/\s?mo/i);
    }
    expect(PLANS.find((plan) => plan.id === 'pro')?.price).toBe('Price not set');
    expect(PLANS.find((plan) => plan.id === 'advanced')?.price).toBe('Price not set');
  });

  it('paid plans advertise nothing as available today', () => {
    for (const plan of PLANS.filter((entry) => entry.id !== 'free')) {
      for (const feature of plan.features)
        expect(feature.availability, `${plan.name}: ${feature.text}`).toBe('planned');
    }
  });

  it('every screenshot referenced on the site exists in public/', () => {
    for (const area of RENOR_AREAS) {
      if (area.screenshot)
        expect(existsSync(path.join(publicDir, area.screenshot.src)), area.screenshot.src).toBe(
          true,
        );
    }
  });

  it('milestones are real dates, newest first', () => {
    const times = MILESTONES.map((milestone) => Date.parse(`${milestone.date}T00:00:00Z`));
    for (const time of times) expect(Number.isNaN(time)).toBe(false);
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });
});
