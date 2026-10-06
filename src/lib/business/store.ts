// @polsia:user-owned — Renor Labs Store catalogue and checkout integration point.
//
// A product is catalogued only when it really exists in the founder's Plug&Pay
// shop ("renorlabs"). Nothing here invents a product, price, review or sale.
//
// Buying is a separate, stricter step: a product shows a buy button only when its
// status is 'available' AND its checkout URL is https on a host listed in
// VERIFIED_CHECKOUT_HOSTS. tests/unit/store.test.ts fails the build for any
// product that breaks these rules.

export const STORE_CATEGORIES = [
  {
    id: 'business-kits',
    name: 'Business kits',
    headline: 'Launch kits for electricians.',
    description:
      'Ready-made launch and marketing systems for small trade businesses, starting with electricians.',
  },
  {
    id: 'ai-tools',
    name: 'Digital AI tools',
    headline: 'Prompts, workflows and small tools.',
    description: 'Ready-to-use prompts, workflows and small tools built and tested with Renor.',
  },
  {
    id: 'developer-resources',
    name: 'Developer resources',
    headline: 'Templates and starters for builders.',
    description: 'Templates, starter projects and references for people building with AI.',
  },
  {
    id: 'creator-products',
    name: 'Creator products',
    headline: 'Systems for creators.',
    description:
      'Resources for creators: planning kits, content systems and production checklists.',
  },
] as const;

export type StoreCategoryId = (typeof STORE_CATEGORIES)[number]['id'];

export interface StoreProduct {
  slug: string;
  name: string;
  /** The product line, e.g. "TradeLaunch". Products in one line link to each other. */
  line?: string;
  category: StoreCategoryId;
  /** Who it is made for, in a few words. */
  audience: string;
  /** One sentence: what the buyer gets. */
  summary: string;
  /** The founder's own product description, verbatim from the shop. */
  description: string;
  /** How it is sold, e.g. "One-off digital product". */
  format: string;
  /**
   * The founder-set price, exactly as it should read. Rendered ONLY when the
   * product is 'available' with a verified checkout; never shown as buyable before.
   */
  priceLabel: string;
  /** Verified Plug&Pay checkout URL. Required when status is 'available'. */
  checkoutUrl: string | null;
  status: 'available' | 'coming-soon';
  /** What is inside, one item per line. */
  details: readonly string[];
}

/**
 * Checkout hosts the founder has confirmed. `renorlabs.plugandpay.com` is the
 * founder's Plug&Pay shop, verified through the Plug&Pay connector on 6 October 2026.
 */
export const VERIFIED_CHECKOUT_HOSTS: readonly string[] = ['renorlabs.plugandpay.com'];

/**
 * Both products exist in the renorlabs Plug&Pay shop (verified 6 October 2026), but
 * their checkouts are inactive, so they are listed as coming soon with no checkout URL.
 */
export const PRODUCTS: readonly StoreProduct[] = [
  {
    slug: 'tradelaunch-electrician-business-kit',
    name: 'TradeLaunch: Electrician Business Kit',
    line: 'TradeLaunch',
    category: 'business-kits',
    audience: 'Solo electricians',
    summary:
      'A ready-to-use digital launch system, built to help a solo electrician look professional, respond faster and win more enquiries.',
    description:
      'A ready-to-use digital launch system for electricians: premium website copy and layout, quote/invoice templates, Google review scripts, WhatsApp follow-ups, local marketing content, AI-assisted admin prompts and a clear setup guide. Built to help a solo electrician look professional, respond faster and win more enquiries without hiring an agency.',
    format: 'One-off digital product',
    priceLabel: '£29.00 incl. tax',
    checkoutUrl: null,
    status: 'coming-soon',
    details: [
      'Premium website copy and layout',
      'Quote and invoice templates',
      'Google review scripts',
      'WhatsApp follow-up messages',
      'Local marketing content',
      'AI-assisted admin prompts',
      'A clear setup guide',
    ],
  },
  {
    slug: 'tradelaunch-90-day-local-growth-pack',
    name: 'TradeLaunch: 90-Day Local Growth Pack',
    line: 'TradeLaunch',
    category: 'business-kits',
    audience: 'Electricians',
    summary:
      'An expansion pack of 90 days of local content ideas and repeatable weekly marketing actions, designed to make consistent promotion easier.',
    description:
      'An expansion pack for electricians with 90 days of local content ideas, review-request variations, referral messages, seasonal campaign prompts and repeatable weekly marketing actions designed to make consistent promotion easier.',
    format: 'One-off digital product',
    priceLabel: '£9.00 incl. tax',
    checkoutUrl: null,
    status: 'coming-soon',
    details: [
      '90 days of local content ideas',
      'Review-request variations',
      'Referral messages',
      'Seasonal campaign prompts',
      'Repeatable weekly marketing actions',
    ],
  },
];

export function productsIn(category: StoreCategoryId): readonly StoreProduct[] {
  return PRODUCTS.filter((product) => product.category === category);
}

export function findProduct(slug: string): StoreProduct | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

/** Other products in the same line, for "also in TradeLaunch" links. */
export function relatedProducts(product: StoreProduct): readonly StoreProduct[] {
  if (!product.line) return [];
  return PRODUCTS.filter((other) => other.line === product.line && other.slug !== product.slug);
}

/** True for an https URL whose host is one of `hosts` or a subdomain of one — never a look-alike. */
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

/** A checkout link is shown only for an https URL on a confirmed checkout host. */
export function isVerifiedCheckout(url: string | null): url is string {
  return isCheckoutOnHosts(url, VERIFIED_CHECKOUT_HOSTS);
}

/** True only when a product can actually be bought today. */
export function isPurchasable(product: StoreProduct): boolean {
  return product.status === 'available' && isVerifiedCheckout(product.checkoutUrl);
}
