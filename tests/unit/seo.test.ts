// @polsia:user-owned — every page's link preview carries the full Open Graph set.
import { describe, expect, it } from 'vitest';
import { pageMetadata } from '../../src/lib/business/seo';

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
