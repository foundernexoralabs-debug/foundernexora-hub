// @polsia:user-owned — programmatic SEO URLs for /sitemap.xml: dynamic [slug]
// pages that aren't in the nav menu. Edit this file, never src/app/sitemap.ts
// (framework-owned). Return one entry per page with an app-absolute `path`.
import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/lib/business/store';

/** App-absolute `path` (e.g. /items/aatrox) + optional Next sitemap fields. */
export type SeoRoute = { path: string } & Omit<MetadataRoute.Sitemap[number], 'url'>;

/** Every Renor Labs Store product page, generated from the catalogue. */
export async function seoRoutes(): Promise<SeoRoute[]> {
  return PRODUCTS.map((product) => ({ path: `/store/${product.slug}`, priority: 0.6 }));
}
