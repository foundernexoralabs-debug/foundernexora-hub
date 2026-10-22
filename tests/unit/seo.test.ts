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
      siteName: 'FounderLab',
      url: '/renor/plans',
      title: 'Plans · FounderLab',
      description: 'Proposed plans.',
    });
    expect(JSON.stringify(meta.openGraph)).toContain('/opengraph-image');
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'Plans · FounderLab',
    });
  });

  it('keeps an absolute title exactly as given', () => {
    const meta = pageMetadata({
      title: 'FounderLab',
      description: 'Home.',
      path: '/',
      absolute: true,
    });
    expect(meta.title).toEqual({ absolute: 'FounderLab' });
    expect(meta.openGraph?.title).toBe('FounderLab');
  });
});
