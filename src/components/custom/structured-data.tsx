// @polsia:user-owned — schema.org structured data (JSON-LD) for search engines.
// A data block, not executable script, so the strict script-src CSP does not apply to it.
import { CONTACT_EMAIL } from '@/lib/business/ecosystem';
import { siteDescription, siteName, siteUrl } from '@/lib/site';

function JsonLd({ data }: { data: Record<string, unknown> }) {
  // `<` is escaped so the JSON can never close the script element early.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  // biome-ignore lint/security/noDangerouslySetInnerHtml: serialised, escaped JSON-LD built from constants
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** FounderLab as an Organization (maker of the Renor brand), plus the WebSite it publishes. */
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
            name: siteName,
            url: siteUrl,
            email: CONTACT_EMAIL,
            logo: `${siteUrl}/icon.svg`,
            description: siteDescription,
            brand: { '@type': 'Brand', name: 'Renor' },
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
