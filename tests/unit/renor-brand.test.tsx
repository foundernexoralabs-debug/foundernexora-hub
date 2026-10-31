// @polsia:user-owned — the website reads Renor, and the series is spelled Zero to Proof.
//
// Founder, 31 October 2026: the header brand is Renor beside the living orb; the footer credits
// the company ("Renor · by FounderLab"); titles and link previews name Renor; the
// build-in-public series is "Zero to Proof" everywhere, and the old /zero-to-prove address
// redirects to /zero-to-proof permanently.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { userNextConfig, userRedirects } from '../../next.user-config';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('../../src/components/custom/founder-orb.css', () => ({}));

const { SiteFooter, SiteNav } = await import('../../src/components/custom/site-nav');
const { navItems } = await import('../../src/lib/nav');
const { pageMetadata } = await import('../../src/lib/business/seo');

const root = path.resolve(__dirname, '../..');
const read = (file: string) => readFileSync(path.join(root, file), 'utf-8');

/** Visible text of server-rendered markup: tags become spaces, whitespace collapses. */
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .replace(/ ([,.])/g, '$1')
    .trim();

/** "Zero to Prove", "zero-to-prove", "ZeroToProve"; but not the word "proven". */
const MISSPELT_SERIES = /zero[\s_-]*to[\s_-]*prove(?!n)/i;

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return filesUnder(full);
    return /\.(tsx?|mjs|css|md|html|json|txt|xml)$/.test(entry) ? [full] : [];
  });
}

describe('header', () => {
  const html = renderToStaticMarkup(createElement(SiteNav));
  const header = html.slice(html.indexOf('<header'), html.indexOf('</header>') + 9);
  const homeLink = header.match(/<a [^>]*aria-label="Renor home"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';

  it('brands the home link Renor, beside the living orb mark', () => {
    expect(homeLink).not.toBe('');
    expect(homeLink).toContain('class="fl-orb-mark size-[30px]"');
    expect(textOf(homeLink)).toBe('Renor');
  });

  it('never shows FounderLab in the header', () => {
    expect(textOf(header)).not.toMatch(/FounderLab/i);
    expect(header).not.toMatch(/aria-label="FounderLab/);
  });

  it('links the series as Zero to Proof, at /zero-to-proof', () => {
    expect(header).toMatch(/<a [^>]*href="\/zero-to-proof"[^>]*>Zero to Proof<\/a>/);
    expect(header).not.toMatch(MISSPELT_SERIES);
  });
});

describe('footer', () => {
  const html = renderToStaticMarkup(createElement(SiteFooter));
  const text = textOf(html);

  it('reads "Renor · by FounderLab" beside the orb, and the home link is named Renor', () => {
    expect(text.startsWith('Renor · by FounderLab ')).toBe(true);
    expect(html).toMatch(/<a [^>]*aria-label="Renor home"[^>]*><span aria-hidden="true"/);
  });

  it('credits FounderLab as the company and holds the copyright for it', () => {
    expect(text).toContain('FounderLab builds Renor, the AI workspace');
    expect(text).toContain(`© ${new Date().getFullYear()} FounderLab. Renor is in preview.`);
    expect(text).not.toMatch(/Renor builds Renor/);
  });

  it('spells the series Zero to Proof and links /zero-to-proof', () => {
    expect(text).toContain('and Zero to Proof, our build in public');
    expect(html).toMatch(/<a [^>]*href="\/zero-to-proof"[^>]*>Zero to Proof<\/a>/);
    expect(html).not.toMatch(MISSPELT_SERIES);
  });
});

describe('titles and link previews', () => {
  it('append Renor to every page title and name Renor as the Open Graph site', () => {
    const meta = pageMetadata({ title: 'Projects', description: 'All projects.', path: '/x' });
    expect(meta.openGraph).toMatchObject({ siteName: 'Renor', title: 'Projects · Renor' });
    expect(JSON.stringify(meta.openGraph)).toContain('"alt":"Renor by FounderLab"');
  });

  it('do not repeat Renor when the title already names it', () => {
    const meta = pageMetadata({ title: 'Renor plans — Free', description: 'Plans.', path: '/p' });
    expect(meta.title).toEqual({ absolute: 'Renor plans — Free' });
    expect(meta.openGraph?.title).toBe('Renor plans — Free');
    expect(meta.twitter?.title).toBe('Renor plans — Free');
    // A word that merely starts with the name is not the name.
    const other = pageMetadata({ title: 'Renormalising', description: 'x', path: '/q' });
    expect(other.title).toBe('Renormalising');
  });

  it('give the home page a Renor title and the series page a Zero to Proof title', () => {
    expect(read('src/app/(setup)/page.tsx')).toContain(
      "title: 'Renor by FounderLab — an AI workspace for people who make things',",
    );
    const series = read('src/app/(custom)/zero-to-proof/page.tsx');
    expect(series).toContain("title: 'Zero to Proof — building Renor in public',");
    expect(series).toContain("path: '/zero-to-proof',");
    expect(series).toContain('eyebrow="Zero to Proof"');
  });

  it('keep FounderLab, not Renor, as the organisation in structured data', () => {
    const source = read('src/components/custom/structured-data.tsx');
    expect(source).toMatch(
      /'@type': 'Organization',\s*'@id': organizationId,\s*name: companyName,/,
    );
    expect(source).toMatch(/'@type': 'WebSite',[\s\S]*?name: siteName,/);
  });
});

describe('Zero to Proof spelling', () => {
  it('nav and footer items say Zero to Proof and point at /zero-to-proof', () => {
    const series = navItems.filter((item) => /zero/i.test(item.label));
    expect(series.map((item) => item.group).sort()).toEqual(['footer', 'primary']);
    for (const item of series)
      expect(item).toMatchObject({ label: 'Zero to Proof', href: '/zero-to-proof' });
  });

  it('the page lives at /zero-to-proof, and the misspelt route is gone', () => {
    expect(existsSync(path.join(root, 'src/app/(custom)/zero-to-proof/page.tsx'))).toBe(true);
    expect(existsSync(path.join(root, 'src/app/(custom)/zero-to-prove'))).toBe(false);
  });

  it('no source, document or public file carries the misspelling', () => {
    const files = [
      ...filesUnder(path.join(root, 'src')),
      ...filesUnder(path.join(root, 'docs')),
      ...filesUnder(path.join(root, 'public')),
      path.join(root, 'README.md'),
    ];
    for (const file of files) {
      expect(MISSPELT_SERIES.test(readFileSync(file, 'utf-8')), path.relative(root, file)).toBe(
        false,
      );
    }
  });
});

describe('the old /zero-to-prove address', () => {
  it('redirects permanently to /zero-to-proof', async () => {
    const entry = { source: '/zero-to-prove', destination: '/zero-to-proof', permanent: true };
    expect(userRedirects).toContainEqual(entry);
    expect(await userNextConfig.redirects?.()).toContainEqual(entry);
  });

  it('is the only place the old spelling survives in the Next config', () => {
    const config = read('next.user-config.ts')
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('*'));
    expect(config.filter((line) => MISSPELT_SERIES.test(line))).toEqual([
      "  { source: '/zero-to-prove', destination: '/zero-to-proof', permanent: true },",
    ]);
  });
});

describe('sitemap', () => {
  it('lists /zero-to-proof and not the misspelt address', async () => {
    vi.stubEnv('SKIP_ENV_VALIDATION', '1');
    const { default: sitemap } = await import('../../src/app/sitemap');
    const paths = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    expect(paths).toContain('/zero-to-proof');
    expect(paths.some((p) => MISSPELT_SERIES.test(p))).toBe(false);
    vi.unstubAllEnvs();
  });
});
