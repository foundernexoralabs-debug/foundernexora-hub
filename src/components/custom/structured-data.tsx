// @polsia:user-owned — schema.org structured data (JSON-LD) for search engines.
// A data block, not executable script, so the strict script-src CSP does not apply to it.
import { buyHref, categoryOf, type Plugin } from '@/lib/business/plugins';
import { identityGraph, webPageNodes } from '@/lib/business/search-identity';
import { siteUrl } from '@/lib/site';

function JsonLd({ data }: { data: Record<string, unknown> }) {
  // `<` is escaped so the JSON can never close the script element early.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  // biome-ignore lint/security/noDangerouslySetInnerHtml: serialised, escaped JSON-LD built from constants
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/**
 * Who Renor is, for search engines: FounderLab (the Organization) makes Renor (a WebApplication,
 * also known as Renor AI), published on the Renor website. Built in src/lib/business/search-identity.ts.
 * Pass `page` to add the page itself and its breadcrumb trail.
 */
export function RenorIdentityJsonLd({ page }: { page?: Parameters<typeof webPageNodes>[0] }) {
  return <JsonLd data={identityGraph(page ? webPageNodes(page) : [])} />;
}

const STORE_NAME = 'Renor Plugin Store';

/** The Plugin Store as a CollectionPage listing its products, in catalogue order. */
export function PluginStoreJsonLd({ plugins }: { plugins: readonly Plugin[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${siteUrl}/plugins#page`,
        url: `${siteUrl}/plugins`,
        name: STORE_NAME,
        inLanguage: 'en',
        isPartOf: { '@id': `${siteUrl}/#website` },
        publisher: { '@id': `${siteUrl}/#organization` },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: plugins.length,
          itemListElement: plugins.map((plugin, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}/plugins/${plugin.slug}`,
            name: plugin.title,
          })),
        },
      }}
    />
  );
}

/**
 * A product page: the Product and its breadcrumb trail. The `offers` block is published
 * ONLY while the product is purchasable, so search engines are never told it is for sale early.
 */
export function PluginJsonLd({ plugin }: { plugin: Plugin }) {
  const url = `${siteUrl}/plugins/${plugin.slug}`;
  const category = categoryOf(plugin.category);
  const checkout = buyHref(plugin);
  const offers = checkout
    ? {
        offers: {
          '@type': 'Offer',
          url: checkout,
          price: (plugin.price.amountMinor / 100).toFixed(2),
          priceCurrency: plugin.price.currency,
          availability: 'https://schema.org/InStock',
          seller: { '@id': `${siteUrl}/#organization` },
        },
      }
    : {};
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Product',
            '@id': `${url}#product`,
            url,
            name: plugin.title,
            description: plugin.description,
            category: category.name,
            brand: { '@type': 'Brand', name: plugin.line ?? 'Renor' },
            manufacturer: { '@id': `${siteUrl}/#organization` },
            ...offers,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: STORE_NAME, item: `${siteUrl}/plugins` },
              {
                '@type': 'ListItem',
                position: 2,
                name: category.name,
                item: `${siteUrl}/plugins?category=${category.id}`,
              },
              { '@type': 'ListItem', position: 3, name: plugin.title, item: url },
            ],
          },
        ],
      }}
    />
  );
}
