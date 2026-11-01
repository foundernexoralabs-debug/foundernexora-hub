// @polsia:user-owned — every page's link preview carries the full Open Graph set.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { pageMetadata, siteVerification, verificationToken } from '../../src/lib/business/seo';

describe('pageMetadata', () => {
  it('sets canonical, og:url, og:type, og:site_name, the social image and Twitter for the page', () => {
    const meta = pageMetadata({
      title: 'Plans',
      description: 'Proposed plans.',
      path: '/renor/plans',
    });
    expect(meta.title).toBe('Plans');
    expect(meta.alternates?.canonical).toBe('/renor/plans');
    expect(meta.openGraph).toMatchObject({
      type: 'website',
      siteName: 'Renor',
      url: '/renor/plans',
      title: 'Plans · Renor',
      description: 'Proposed plans.',
    });
    expect(JSON.stringify(meta.openGraph)).toContain('/opengraph-image');
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'Plans · Renor',
    });
  });

  it('keeps an absolute title exactly as given', () => {
    const meta = pageMetadata({
      title: 'Renor by FounderLab',
      description: 'Home.',
      path: '/',
      absolute: true,
    });
    expect(meta.title).toEqual({ absolute: 'Renor by FounderLab' });
    expect(meta.openGraph?.title).toBe('Renor by FounderLab');
  });
});

describe('pageMetadata with its own image', () => {
  it('leaves images unset so the route’s opengraph-image and twitter-image files apply', () => {
    const meta = pageMetadata({
      title: 'Kit',
      description: 'A kit.',
      path: '/plugins/kit',
      ownImage: true,
    });
    expect(meta.openGraph).not.toHaveProperty('images');
    expect(meta.twitter).not.toHaveProperty('images');
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  });
});

describe('search-engine ownership tags', () => {
  const GOOGLE = 'aBcD1234_-efGHijklMNopQRstuVWxyz0123456789Q';
  const BING = '0123456789ABCDEF0123456789ABCDEF';

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders nothing when neither variable is set', () => {
    vi.stubEnv('GOOGLE_SITE_VERIFICATION', '');
    vi.stubEnv('BING_SITE_VERIFICATION', '');
    expect(siteVerification()).toBeUndefined();
    const meta = pageMetadata({ title: 'Plans', description: 'x', path: '/renor/plans' });
    expect(meta).not.toHaveProperty('verification');
  });

  it('adds Google and Bing tags to every page when the deploy sets them', () => {
    vi.stubEnv('GOOGLE_SITE_VERIFICATION', GOOGLE);
    vi.stubEnv('BING_SITE_VERIFICATION', BING);
    const meta = pageMetadata({ title: 'Home', description: 'x', path: '/', absolute: true });
    expect(meta.verification).toEqual({ google: GOOGLE, other: { 'msvalidate.01': BING } });
  });

  it('sets one engine without the other', () => {
    expect(siteVerification({ GOOGLE_SITE_VERIFICATION: GOOGLE })).toEqual({ google: GOOGLE });
    expect(siteVerification({ BING_SITE_VERIFICATION: BING })).toEqual({
      other: { 'msvalidate.01': BING },
    });
  });

  it('accepts the token, the whole meta tag or the DNS value, whichever was pasted', () => {
    expect(verificationToken(`  ${GOOGLE}\n`)).toBe(GOOGLE);
    expect(verificationToken(`<meta name="google-site-verification" content="${GOOGLE}" />`)).toBe(
      GOOGLE,
    );
    expect(verificationToken(`<meta name='msvalidate.01' content='${BING}'>`)).toBe(BING);
    expect(verificationToken(`google-site-verification=${GOOGLE}`)).toBe(GOOGLE);
  });

  it('ignores a value that is not a token, so no broken tag is rendered', () => {
    for (const value of [undefined, '', '   ', 'paste token here', 'a"b', 'short', 'x'.repeat(200)])
      expect(verificationToken(value), String(value)).toBeUndefined();
  });

  it('documents both variables, with no real value, in .env.example', () => {
    const example = readFileSync(path.resolve(__dirname, '../../.env.example'), 'utf-8');
    expect(example).toMatch(/^GOOGLE_SITE_VERIFICATION=$/m);
    expect(example).toMatch(/^BING_SITE_VERIFICATION=$/m);
    expect(example).toContain('docs/seo/search-console.md');
  });
});
