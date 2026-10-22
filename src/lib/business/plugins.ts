// @polsia:user-owned — the Renor Plugin Store catalogue and its purchase rules.
//
// One source for every product the store can show. A product is listed only when it
// really exists in the founder's Plug&Pay shop ("renorlabs") and its review status is
// 'approved'. Nothing here invents a product, price, review, sale or delivery method.
//
// Two independent gates decide whether a buy button may render:
//   1. availability === 'on-sale' AND checkoutActive === true: the founder's decision
//      that a product is open for sale. This is the gate that matters day to day.
//   2. the checkout URL is https on a host in VERIFIED_CHECKOUT_HOSTS: a safety net
//      so a typo or a look-alike domain can never become a payment link.
// renorlabs.plugandpay.com stays in the allowlist because it is the founder's real
// shop; keeping it there is harmless while every product is 'opening-soon', because
// gate 1 already fails. tests/unit/plugins.test.ts fails the build for any product
// that would show a buy button without passing both gates.

import { CONTACT_MAILTO } from '@/lib/business/ecosystem';

/** The shelves visitors filter by. A shelf with no approved product shows an honest empty state. */
export const PLUGIN_CATEGORIES = [
  {
    id: 'business-kits',
    name: 'Business kits',
    description:
      'Ready-to-use launch and marketing systems for small trade businesses, starting with electricians.',
    emptyTitle: 'More business kits are being planned.',
    emptyText: 'A new kit is listed here only once it exists in our shop.',
  },
  {
    id: 'templates',
    name: 'Templates',
    description: 'Starting points you copy into your own work: documents, pages and workflows.',
    emptyTitle: 'Templates are coming next.',
    emptyText:
      'No template is ready yet. One is listed here only when it is finished and its price is confirmed.',
  },
  {
    id: 'renor-extensions',
    name: 'Renor extensions',
    description: 'Add-ons that extend what Renor can do inside your workspace.',
    emptyTitle: 'Renor extensions are coming next.',
    emptyText:
      'Every extension will be reviewed before anyone can install it, so none are listed yet. Developer submissions are not open.',
  },
] as const;

export type PluginCategoryId = (typeof PLUGIN_CATEGORIES)[number]['id'];
export type PluginCategory = (typeof PLUGIN_CATEGORIES)[number];

/** What sort of thing it is. Developer submissions will use the same shape. */
export type PluginKind = 'business-kit' | 'template' | 'renor-extension';

/**
 * Where a product is in its life:
 *  - 'on-sale'      can be bought now (still needs an active, verified checkout)
 *  - 'opening-soon' real and described, but no sale is open
 *  - 'retired'      no longer offered; never listed
 */
export type PluginAvailability = 'on-sale' | 'opening-soon' | 'retired';

/** Only 'approved' entries are ever shown. The others exist for future developer submissions. */
export type PluginReviewStatus = 'approved' | 'in-review' | 'changes-requested' | 'rejected';

export interface PluginPublisher {
  name: string;
  /** 'first-party' is made by FounderLab; 'developer' is a reviewed outside submission. */
  kind: 'first-party' | 'developer';
}

export interface PluginPrice {
  /** Minor units (pence) of the total a buyer pays. */
  amountMinor: number;
  currency: 'GBP';
  /** Exactly how the price reads on the page, e.g. "£29". No tax wording until it is resolved. */
  label: string;
  billing: 'one-off';
}

export interface Plugin {
  slug: string;
  kind: PluginKind;
  category: PluginCategoryId;
  title: string;
  /** The product line, e.g. "TradeLaunch". Products in one line point to each other. */
  line?: string;
  /** Plug&Pay product id, so the listing can be checked against the shop. */
  plugPayProductId: number;
  price: PluginPrice;
  /** One sentence for cards. Taken from the description, never beyond it. */
  summary: string;
  /** The founder's own description, verbatim from the shop. */
  description: string;
  /** What is inside: each item comes straight from the description. */
  inside: readonly string[];
  /** Who it is for, in one plain sentence drawn from the description. */
  forWho: string;
  /** Short audience tag for cards, e.g. "Solo electricians". */
  audience: string;
  format: 'Digital download';
  availability: PluginAvailability;
  /** The Plug&Pay checkout. Never rendered unless the product is purchasable. */
  checkoutUrl: string | null;
  /** Whether the checkout is switched on in Plug&Pay. */
  checkoutActive: boolean;
  /** A public sales page with the full details, when one is published. */
  salesPageUrl: string | null;
  reviewStatus: PluginReviewStatus;
  publisher: PluginPublisher;
  /** When this entry was last checked against the shop (ISO date). */
  verifiedOn: string;
}

/**
 * Checkout hosts the founder has confirmed: the renorlabs Plug&Pay shop.
 * A host on this list is necessary but never sufficient: see the header comment.
 */
export const VERIFIED_CHECKOUT_HOSTS: readonly string[] = ['renorlabs.plugandpay.com'];

const FOUNDERLAB: PluginPublisher = { name: 'FounderLab', kind: 'first-party' };

/** Read from the Plug&Pay API on 22 October 2026. Both checkouts are inactive. */
export const PLUGINS: readonly Plugin[] = [
  {
    slug: 'tradelaunch-electrician-business-kit',
    kind: 'business-kit',
    category: 'business-kits',
    title: 'TradeLaunch: Electrician Business Kit',
    line: 'TradeLaunch',
    plugPayProductId: 416837,
    price: { amountMinor: 2900, currency: 'GBP', label: '£29', billing: 'one-off' },
    summary:
      'A ready-to-use digital launch system, built to help a solo electrician look professional, respond faster and win more enquiries.',
    description:
      'A ready-to-use digital launch system for electricians: premium website copy and layout, quote/invoice templates, Google review scripts, WhatsApp follow-ups, local marketing content, AI-assisted admin prompts and a clear setup guide. Built to help a solo electrician look professional, respond faster and win more enquiries without hiring an agency.',
    inside: [
      'Premium website copy and layout',
      'Quote and invoice templates',
      'Google review scripts',
      'WhatsApp follow-ups',
      'Local marketing content',
      'AI-assisted admin prompts',
      'A clear setup guide',
    ],
    forWho:
      'Solo electricians who want to look professional, respond faster and win more enquiries without hiring an agency.',
    audience: 'Solo electricians',
    format: 'Digital download',
    availability: 'opening-soon',
    checkoutUrl: 'https://renorlabs.plugandpay.com/checkout/tradelaunch-electrician-business-kit',
    checkoutActive: false,
    salesPageUrl: 'https://renorlabs.plugandpay.com/electrician-business-kit-uk',
    reviewStatus: 'approved',
    publisher: FOUNDERLAB,
    verifiedOn: '2026-10-22',
  },
  {
    slug: 'tradelaunch-90-day-local-growth-pack',
    kind: 'business-kit',
    category: 'business-kits',
    title: 'TradeLaunch: 90-Day Local Growth Pack',
    line: 'TradeLaunch',
    plugPayProductId: 416843,
    price: { amountMinor: 900, currency: 'GBP', label: '£9', billing: 'one-off' },
    summary:
      'An expansion pack with 90 days of local content ideas and repeatable weekly marketing actions, designed to make consistent promotion easier.',
    description:
      'An expansion pack for electricians with 90 days of local content ideas, review-request variations, referral messages, seasonal campaign prompts and repeatable weekly marketing actions designed to make consistent promotion easier.',
    inside: [
      '90 days of local content ideas',
      'Review-request variations',
      'Referral messages',
      'Seasonal campaign prompts',
      'Repeatable weekly marketing actions',
    ],
    forWho: 'Electricians who want consistent local promotion to be easier to keep up.',
    audience: 'Electricians',
    format: 'Digital download',
    availability: 'opening-soon',
    checkoutUrl: 'https://renorlabs.plugandpay.com/checkout/tradelaunch-90-day-local-growth-pack',
    checkoutActive: false,
    // The sales page is still a draft in Plug&Pay, so there is nothing public to link to.
    salesPageUrl: null,
    reviewStatus: 'approved',
    publisher: FOUNDERLAB,
    verifiedOn: '2026-10-22',
  },
];

/** What the store shows: approved and not retired. */
export function listedPlugins(all: readonly Plugin[] = PLUGINS): readonly Plugin[] {
  return all.filter(
    (plugin) => plugin.reviewStatus === 'approved' && plugin.availability !== 'retired',
  );
}

export function pluginsIn(category: PluginCategoryId): readonly Plugin[] {
  return listedPlugins().filter((plugin) => plugin.category === category);
}

export function findPlugin(slug: string): Plugin | undefined {
  return listedPlugins().find((plugin) => plugin.slug === slug);
}

export function categoryOf(id: PluginCategoryId): PluginCategory {
  return PLUGIN_CATEGORIES.find((category) => category.id === id) ?? PLUGIN_CATEGORIES[0];
}

/** Products in the same line first, then the same shelf; never the product itself. */
export function relatedPlugins(plugin: Plugin): readonly Plugin[] {
  const others = listedPlugins().filter((other) => other.slug !== plugin.slug);
  const sameLine = others.filter((other) => plugin.line && other.line === plugin.line);
  const sameShelf = others.filter(
    (other) => other.category === plugin.category && !sameLine.includes(other),
  );
  return [...sameLine, ...sameShelf];
}

/** True for an https URL whose host is one of `hosts` or a subdomain of one, never a look-alike. */
export function isCheckoutOnHosts(url: string | null, hosts: readonly string[]): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      parsed.username === '' &&
      parsed.password === '' &&
      hosts.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))
    );
  } catch {
    return false;
  }
}

/** A checkout URL on a confirmed checkout host. */
export function isVerifiedCheckout(url: string | null): url is string {
  return isCheckoutOnHosts(url, VERIFIED_CHECKOUT_HOSTS);
}

/** True only when a product can be bought right now. The only way a buy button renders. */
export function isPurchasable(plugin: Plugin): boolean {
  return (
    plugin.reviewStatus === 'approved' &&
    plugin.availability === 'on-sale' &&
    plugin.checkoutActive &&
    isVerifiedCheckout(plugin.checkoutUrl)
  );
}

/** The checkout URL when the product is purchasable, otherwise null. */
export function buyHref(plugin: Plugin): string | null {
  return isPurchasable(plugin) ? plugin.checkoutUrl : null;
}

/** A mailto that asks to hear when a product opens, with the subject filled in. */
export function notifyHref(plugin: Plugin): string {
  return `${CONTACT_MAILTO}?subject=${encodeURIComponent(`Notify me when ${plugin.title} opens`)}`;
}

export function availabilityLabel(plugin: Plugin): string {
  if (isPurchasable(plugin)) return 'On sale';
  if (plugin.availability === 'retired') return 'No longer offered';
  return 'Opening soon';
}

/** How buying works, said once and reused. Delivery is not confirmed yet, so it is not described. */
export const PURCHASE_NOTE =
  'When sales open, you buy through our checkout partner Plug&Pay. Delivery details are confirmed before sales open.';

/** Plugin Store purchases are not Renor subscriptions. */
export const SEPARATE_FROM_PLANS =
  'Plugin Store products are one-off purchases, separate from Renor plans. Buying one never starts a subscription, and no Renor plan includes them.';

export const REFUND_NOTE = 'Digital-download refund terms are published before sales open.';
