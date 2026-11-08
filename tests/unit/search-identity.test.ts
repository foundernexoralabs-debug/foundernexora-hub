// @vitest-environment node
// @polsia:user-owned — the structured data that tells search engines who Renor is.
//
// Every property used must exist on its schema.org type. The allow-list below was checked against
// the schema.org vocabulary (schemaorg-current-https.jsonld, including inherited properties) on
// 31 October 2026; add a property here only after checking it there.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RenorIdentityJsonLd } from '../../src/components/custom/structured-data';
import { CAPABILITIES, RENOR_APP_ADDRESS } from '../../src/lib/business/capabilities';
import { CHANNELS } from '../../src/lib/business/ecosystem';
import { PLANS } from '../../src/lib/business/plans';
import {
  GITHUB_ACCOUNT_URL,
  identityGraph,
  ORGANIZATION_PROFILES,
  RENOR_ALTERNATE_NAMES,
  SCHEMA_IDS,
  SEARCH_DESCRIPTIONS,
  webPageNodes,
} from '../../src/lib/business/search-identity';

type Node = Record<string, unknown> & { '@type'?: string; '@id'?: string };

const SCHEMA_PROPERTIES: Record<string, readonly string[]> = {
  Organization: [
    'name',
    'url',
    'email',
    'logo',
    'description',
    'brand',
    'founder',
    'sameAs',
    'contactPoint',
    'alternateName',
  ],
  Brand: ['name', 'alternateName', 'url', 'logo', 'slogan', 'description'],
  WebSite: ['url', 'name', 'alternateName', 'inLanguage', 'publisher', 'about'],
  SoftwareApplication: [
    'name',
    'alternateName',
    'description',
    'url',
    'mainEntityOfPage',
    'applicationCategory',
    'applicationSubCategory',
    'operatingSystem',
    'browserRequirements',
    'isAccessibleForFree',
    'inLanguage',
    'featureList',
    'screenshot',
    'creator',
    'publisher',
    'offers',
  ],
  Offer: ['name', 'price', 'priceCurrency', 'url', 'seller'],
  ImageObject: ['url', 'width', 'height', 'caption'],
  Person: ['name', 'jobTitle'],
  ContactPoint: ['contactType', 'email', 'availableLanguage'],
  WebPage: [
    'url',
    'name',
    'description',
    'inLanguage',
    'isPartOf',
    'about',
    'breadcrumb',
    'dateModified',
  ],
  BreadcrumbList: ['itemListElement'],
  ListItem: ['position', 'name', 'item'],
};

/** Every typed object in the graph, nested ones included. */
function typedNodes(value: unknown, found: Node[] = []): Node[] {
  if (Array.isArray(value)) for (const item of value) typedNodes(item, found);
  else if (value && typeof value === 'object') {
    const node = value as Node;
    if (typeof node['@type'] === 'string') found.push(node);
    for (const child of Object.values(node)) typedNodes(child, found);
  }
  return found;
}

const page = webPageNodes({
  path: '/renor/capabilities',
  name: 'Renor AI capabilities',
  description: SEARCH_DESCRIPTIONS.capabilities,
  trail: [{ name: 'Renor AI', path: '/renor' }],
  dateModified: '2026-10-31',
});
const graph = identityGraph(page) as { '@context': string; '@graph': Node[] };
const byType = (type: string) => graph['@graph'].find((node) => node['@type'] === type) as Node;
const app = byType('SoftwareApplication');
const organization = byType('Organization');

describe('schema.org shape', () => {
  it('is one schema.org graph with the organisation, brand, website, app and page', () => {
    expect(graph['@context']).toBe('https://schema.org');
    expect(graph['@graph'].map((node) => node['@type'])).toEqual([
      'Organization',
      'Brand',
      'WebSite',
      'SoftwareApplication',
      'WebPage',
      'BreadcrumbList',
    ]);
  });

  it('uses only properties schema.org defines for each type', () => {
    for (const node of typedNodes(graph['@graph'])) {
      const type = node['@type'] as string;
      const allowed = SCHEMA_PROPERTIES[type];
      expect(allowed, `unchecked type ${type}`).toBeDefined();
      for (const key of Object.keys(node)) {
        if (key.startsWith('@')) continue;
        expect(allowed, `${type}.${key}`).toContain(key);
      }
    }
  });

  it('links every @id reference to a node in the graph', () => {
    const ids = new Set(graph['@graph'].map((node) => node['@id']));
    const references = JSON.stringify(graph).match(/\{"@id":"[^"]+"\}/g) ?? [];
    expect(references.length).toBeGreaterThan(5);
    for (const reference of references)
      expect(ids, reference).toContain(JSON.parse(reference)['@id']);
  });

  it('uses absolute https URLs for every link', () => {
    for (const node of typedNodes(graph['@graph'])) {
      for (const key of ['url', 'item', 'mainEntityOfPage'] as const) {
        const value = node[key];
        if (typeof value === 'string')
          expect(value, `${node['@type']}.${key}`).toMatch(/^https?:\/\//);
      }
    }
  });
});

describe('Renor, the web application', () => {
  it('is named Renor, also known as Renor AI and Renor by FounderLab', () => {
    expect(app.name).toBe('Renor');
    expect(app.alternateName).toEqual(['Renor AI', 'Renor by FounderLab']);
    expect([...RENOR_ALTERNATE_NAMES]).toEqual(['Renor AI', 'Renor by FounderLab']);
    expect(app['@id']).toBe(SCHEMA_IDS.app);
  });

  it('is a web app for business and development work, opened at the Renor app address', () => {
    expect(app.url).toBe(RENOR_APP_ADDRESS);
    expect(app.url).toBe('https://app.renor.app');
    expect(app.operatingSystem).toBe('Web');
    expect(app.applicationCategory).toEqual(['BusinessApplication', 'DeveloperApplication']);
    expect(app.creator).toEqual({ '@id': SCHEMA_IDS.organization });
    expect(app.publisher).toEqual({ '@id': SCHEMA_IDS.organization });
  });

  it('claims no rating, review or user count', () => {
    const json = JSON.stringify(graph);
    for (const field of ['aggregateRating', 'review', 'ratingValue', 'userInteractionCount'])
      expect(json).not.toContain(`"${field}"`);
  });

  it('offers only plans people can start today, priced in pounds', () => {
    const offers = app.offers as Node[];
    const open = PLANS.filter((plan) => plan.state === 'open');
    expect(open.length).toBeGreaterThan(0);
    expect(offers).toHaveLength(open.length);
    expect(offers[0]).toMatchObject({ '@type': 'Offer', price: '0.00', priceCurrency: 'GBP' });
    const names = offers.map((offer) => offer.name);
    for (const plan of PLANS.filter((p) => p.state !== 'open'))
      expect(names).not.toContain(`Renor ${plan.name}`);
  });

  it('lists only usable features: nothing planned', () => {
    const features = app.featureList as string[];
    const planned = CAPABILITIES.filter((c) => c.status === 'planned').map((c) => c.name);
    expect(features.length).toBeGreaterThan(10);
    for (const name of planned) expect(features).not.toContain(name);
    for (const name of features)
      expect(CAPABILITIES.find((c) => c.name === name)?.status).not.toBe('planned');
  });
});

describe('FounderLab, the organisation', () => {
  it('is FounderLab, makes the Renor brand, and is not itself named Renor', () => {
    expect(organization.name).toBe('FounderLab');
    expect(organization.brand).toEqual({ '@id': SCHEMA_IDS.brand });
    expect(byType('Brand')).toMatchObject({
      name: 'Renor',
      alternateName: ['Renor AI', 'Renor by FounderLab'],
    });
    expect(byType('WebSite')).toMatchObject({
      name: 'Renor',
      publisher: { '@id': SCHEMA_IDS.organization },
    });
  });

  it('links its own checked profiles, and not the founder’s personal freelance page', () => {
    const sameAs = organization.sameAs as string[];
    expect(sameAs).toEqual([...ORGANIZATION_PROFILES]);
    for (const id of ['youtube', 'tiktok', 'links', 'renor-labs'] as const)
      expect(sameAs).toContain(CHANNELS.find((channel) => channel.id === id)?.url);
    expect(sameAs).toContain(GITHUB_ACCOUNT_URL);
    expect(GITHUB_ACCOUNT_URL).toBe('https://github.com/foundernexoralabs-debug');
    expect(sameAs.some((url) => /fiverr/i.test(url))).toBe(false);
    for (const url of sameAs) expect(url).toMatch(/^https:\/\//);
    expect(new Set(sameAs).size).toBe(sameAs.length);
  });

  it('uses a raster logo of at least 112 pixels', () => {
    expect(organization.logo).toMatchObject({ '@type': 'ImageObject', width: 180, height: 180 });
  });
});

describe('the page and its breadcrumb', () => {
  it('runs Renor → Renor AI → the page', () => {
    const crumbs = byType('BreadcrumbList').itemListElement as Node[];
    expect(crumbs.map((crumb) => crumb.name)).toEqual([
      'Renor',
      'Renor AI',
      'Renor AI capabilities',
    ]);
    expect(crumbs.map((crumb) => crumb.position)).toEqual([1, 2, 3]);
    expect(String(crumbs[2]?.item)).toMatch(/\/renor\/capabilities$/);
    expect(byType('WebPage')).toMatchObject({
      dateModified: '2026-10-31',
      about: { '@id': SCHEMA_IDS.app },
    });
  });
});

describe('rendered JSON-LD', () => {
  it('is one parseable, escaped application/ld+json block', () => {
    const html = renderToStaticMarkup(createElement(RenorIdentityJsonLd, {}));
    const match = html.match(/^<script type="application\/ld\+json">(.*)<\/script>$/s);
    expect(match).not.toBeNull();
    const json = match?.[1] ?? '';
    expect(json).not.toContain('<');
    expect(JSON.parse(json)['@graph']).toHaveLength(4);
  });
});

describe('search copy', () => {
  it('names Renor AI in every description, each short enough to show whole', () => {
    for (const [page, description] of Object.entries(SEARCH_DESCRIPTIONS)) {
      expect(description, page).toContain('Renor AI');
      expect(description.length, page).toBeLessThanOrEqual(160);
      expect(description, page).not.toMatch(/\bbot\b/i);
    }
  });
});
