// @polsia:user-owned — schema.org structured data (JSON-LD) for search engines.
// A data block, not executable script, so the strict script-src CSP does not apply to it.
import { companyName } from '@/lib/brand';
import { CONTACT_EMAIL, SOCIAL_CHANNELS } from '@/lib/business/ecosystem';
import { buyHref, categoryOf, type Plugin } from '@/lib/business/plugins';
import { siteDescription, siteName, siteUrl } from '@/lib/site';

function JsonLd({ data }: { data: Record<string, unknown> }) {
  // `<` is escaped so the JSON can never close the script element early.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  // biome-ignore lint/security/noDangerouslySetInnerHtml: serialised, escaped JSON-LD built from constants
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** FounderLab as an Organization (maker of the Renor brand), plus the Renor WebSite it publishes. */
export function OrganizationJsonLd() {
  const organizationId = `${siteUrl}/#organization`;
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': organizationId,
            name: companyName,
            url: siteUrl,
            email: CONTACT_EMAIL,
            logo: `${siteUrl}/icon.svg`,
            description: siteDescription,
            brand: { '@type': 'Brand', name: 'Renor' },
            sameAs: SOCIAL_CHANNELS.map((channel) => channel.url),
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              email: CONTACT_EMAIL,
              availableLanguage: 'English',
            },
          },
          {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            url: siteUrl,
            name: siteName,
            inLanguage: 'en',
            publisher: { '@id': organizationId },
          },
        ],
      }}
    />
  );
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
