// @polsia:user-owned — who Renor is, said once, for search engines (schema.org JSON-LD).
//
// Other products have names close to Renor's. Search engines tell them apart by the entities a
// site declares, so every Renor page states the same four facts as one linked graph:
//   - Renor (also "Renor AI" and "Renor by FounderLab") is a web application, an AI workspace;
//   - FounderLab is the organisation that makes and publishes it;
//   - renor.app is Renor's website, published by FounderLab;
//   - the profiles in `sameAs` are FounderLab's own, each opened and checked by a person.
// Only true things go in: no ratings, reviews or user counts (Renor has none to show yet), and
// an offer only for a plan people can actually start today. tests/unit/search-identity.test.ts
// checks the shape against schema.org and those rules.
import { companyName, siteDescription, siteName } from '@/lib/brand';
import { RENOR_APP_ADDRESS, usableCapabilityNames } from '@/lib/business/capabilities';
import { CHANNELS, type Channel, CONTACT_EMAIL, PUBLIC_REPO_URL } from '@/lib/business/ecosystem';
import { FOUNDER } from '@/lib/business/founder';
import { DESCRIPTIONS, TOUR, tourImage } from '@/lib/business/launch';
import { PLANS } from '@/lib/business/plans';
import { siteUrl } from '@/lib/site';

/** The names people search for, in order of how often they are used. */
export const RENOR_ALTERNATE_NAMES = ['Renor AI', `${siteName} by ${companyName}`] as const;

/**
 * Meta descriptions for the pages people land on from a search for Renor. Each names Renor AI
 * and what it is, in under 160 characters so search results show it whole.
 */
export const SEARCH_DESCRIPTIONS = {
  home: 'Renor AI is an operator, not a chatbot: tell it the outcome and it plans, does the work, checks it and shows the proof. Your models or ours. Free to start.',
  renor:
    'Renor AI by FounderLab is one workspace for chat, code, websites, notes and tasks. It builds apps and sites, then checks them against your brief.',
  capabilities:
    'Everything Renor AI can do today, each with its honest status: live, preview or planned. Chat, Code AI, the Website Builder, voice, notes, tasks and plans.',
} as const;

/** Stable node ids, so every page describes the same entities. */
export const SCHEMA_IDS = {
  organization: `${siteUrl}/#organization`,
  brand: `${siteUrl}/#brand`,
  website: `${siteUrl}/#website`,
  app: `${siteUrl}/#renor`,
} as const;

/** Plan prices are in pounds sterling. */
const PRICE_CURRENCY = 'GBP';

/**
 * FounderLab's own public profiles. Opened and checked on 31 October 2026: the Zero to Proof
 * YouTube channel and TikTok account, the official links page ("Renor — Official Links") and the
 * Renor Labs shop. The founder's personal freelance profile is left out: it is a person, not the
 * company.
 */
const PROFILE_CHANNELS: readonly Channel['id'][] = ['youtube', 'tiktok', 'links', 'renor-labs'];

/** The GitHub account that publishes this website's code (public; display name founderlab-AI). */
export const GITHUB_ACCOUNT_URL = `https://github.com/${new URL(PUBLIC_REPO_URL).pathname.split('/')[1]}`;

export const ORGANIZATION_PROFILES: readonly string[] = [
  ...PROFILE_CHANNELS.flatMap((id) => {
    const url = CHANNELS.find((channel) => channel.id === id)?.url;
    return url ? [url] : [];
  }),
  GITHUB_ACCOUNT_URL,
];

/** Raster logo (180 × 180) from src/app/apple-icon.png: search engines want 112 px or more. */
const LOGO = {
  '@type': 'ImageObject',
  url: `${siteUrl}/apple-icon.png`,
  width: 180,
  height: 180,
} as const;

type Node = Record<string, unknown>;

export function organizationNode(): Node {
  return {
    '@type': 'Organization',
    '@id': SCHEMA_IDS.organization,
    name: companyName,
    url: siteUrl,
    email: CONTACT_EMAIL,
    logo: LOGO,
    description: siteDescription,
    brand: { '@id': SCHEMA_IDS.brand },
    founder: { '@type': 'Person', name: FOUNDER.name, jobTitle: FOUNDER.role },
    sameAs: [...ORGANIZATION_PROFILES],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: CONTACT_EMAIL,
      availableLanguage: 'English',
    },
  };
}

export function brandNode(): Node {
  return {
    '@type': 'Brand',
    '@id': SCHEMA_IDS.brand,
    name: siteName,
    alternateName: [...RENOR_ALTERNATE_NAMES],
    url: siteUrl,
    logo: LOGO,
    slogan: 'Think it. Build it. Keep it.',
  };
}

export function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': SCHEMA_IDS.website,
    url: `${siteUrl}/`,
    name: siteName,
    alternateName: [...RENOR_ALTERNATE_NAMES],
    inLanguage: 'en',
    publisher: { '@id': SCHEMA_IDS.organization },
    about: { '@id': SCHEMA_IDS.app },
  };
}

/** Offers only for plans anyone can start today (Free). Paid plans are not on sale. */
function openOffers(): Node[] {
  return PLANS.filter((plan) => plan.state === 'open').map((plan) => ({
    '@type': 'Offer',
    name: `${siteName} ${plan.name}`,
    price: plan.price.amount.toFixed(2),
    priceCurrency: PRICE_CURRENCY,
    url: `${siteUrl}/renor/plans`,
    seller: { '@id': SCHEMA_IDS.organization },
  }));
}

export function renorAppNode(): Node {
  return {
    '@type': 'WebApplication',
    '@id': SCHEMA_IDS.app,
    name: siteName,
    alternateName: [...RENOR_ALTERNATE_NAMES],
    description: DESCRIPTIONS[50],
    url: RENOR_APP_ADDRESS,
    mainEntityOfPage: `${siteUrl}/renor`,
    applicationCategory: ['BusinessApplication', 'DeveloperApplication'],
    applicationSubCategory: 'AI workspace',
    operatingSystem: 'Web',
    browserRequirements: 'Requires a modern web browser with JavaScript enabled.',
    isAccessibleForFree: true,
    inLanguage: 'en',
    featureList: usableCapabilityNames(),
    screenshot: TOUR.map((shot) => ({
      '@type': 'ImageObject',
      url: `${siteUrl}${tourImage(shot, 'light')}`,
      width: shot.width,
      height: shot.height,
      caption: shot.title,
    })),
    creator: { '@id': SCHEMA_IDS.organization },
    publisher: { '@id': SCHEMA_IDS.organization },
    offers: openOffers(),
  };
}

/** The identity graph every Renor page carries: organisation, brand, website and the app. */
export function identityGraph(extra: readonly Node[] = []): Node {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode(), brandNode(), websiteNode(), renorAppNode(), ...extra],
  };
}

/** A page of the Renor website, with its breadcrumb trail from the home page. */
export function webPageNodes({
  path,
  name,
  description,
  trail,
  dateModified,
}: {
  path: string;
  name: string;
  description: string;
  /** Ancestors between the home page and this page, e.g. [{ name: 'Renor AI', path: '/renor' }]. */
  trail: readonly { name: string; path: string }[];
  /** ISO date the page's facts were last checked. */
  dateModified?: string;
}): Node[] {
  const url = `${siteUrl}${path}`;
  const crumbs = [{ name: siteName, path: '/' }, ...trail, { name, path }];
  return [
    {
      '@type': 'WebPage',
      '@id': `${url}#page`,
      url,
      name,
      description,
      inLanguage: 'en',
      isPartOf: { '@id': SCHEMA_IDS.website },
      about: { '@id': SCHEMA_IDS.app },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      ...(dateModified ? { dateModified } : {}),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.path === '/' ? `${siteUrl}/` : `${siteUrl}${crumb.path}`,
      })),
    },
  ];
}
