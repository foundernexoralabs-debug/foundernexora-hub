// @vitest-environment node
// @polsia:user-owned — search indexing stays off until the founder says yes, and the
// sitemap lists every public page (including /accessibility) for the day it does.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const root = path.resolve(__dirname, '../..');
let previous: Record<string, string | undefined> = {};

beforeEach(() => {
  previous = {
    SEO_INDEXABLE: process.env.SEO_INDEXABLE,
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
  };
  process.env.SKIP_ENV_VALIDATION = '1';
  vi.resetModules();
});

afterEach(() => {
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  vi.resetModules();
});

describe('robots.txt', () => {
  it('disallows the whole site when SEO_INDEXABLE is not set', async () => {
    delete process.env.SEO_INDEXABLE;
    const { default: robots } = await import('../../src/app/robots');
    expect(robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } });
  });

  it('stays closed for any value other than the literal "true"', async () => {
    for (const value of ['', 'false', '1', 'yes', 'TRUE']) {
      process.env.SEO_INDEXABLE = value;
      vi.resetModules();
      const { default: robots } = await import('../../src/app/robots');
      expect(robots().rules, value).toEqual({ userAgent: '*', disallow: '/' });
    }
  });

  it('is not switched on by any committed config', () => {
    // Deploy configuration committed to the repo. (Docs and comments may mention the
    // variable; only a config that would actually set it matters.)
    const files = [
      'polsia.toml',
      'next.config.ts',
      'next.user-config.ts',
      'package.json',
      '.env.example',
      'vercel.json',
    ];
    for (const file of files) {
      let text: string;
      try {
        text = readFileSync(path.join(root, file), 'utf-8');
      } catch {
        continue;
      }
      expect(/SEO_INDEXABLE\s*[=:]\s*['"]?true/i.test(text), file).toBe(false);
    }
  });

  it('documents that turning indexing on needs the founder’s yes', () => {
    const text = readFileSync(path.join(root, 'src/lib/robots-config.ts'), 'utf-8');
    expect(text).toMatch(/founder's explicit yes/);
  });
});

describe('sitemap.xml', () => {
  it('lists the accessibility statement alongside the core pages', async () => {
    const { default: sitemap } = await import('../../src/app/sitemap');
    const paths = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    for (const route of ['/', '/renor', '/renor/plans', '/store', '/contact', '/accessibility'])
      expect(paths, route).toContain(route);
  });

  it('never lists an anchor or an external URL', async () => {
    const { default: sitemap } = await import('../../src/app/sitemap');
    const { siteUrl } = await import('../../src/lib/site');
    for (const entry of await sitemap()) {
      expect(entry.url.startsWith(siteUrl), entry.url).toBe(true);
      expect(entry.url).not.toContain('#');
    }
  });
});
