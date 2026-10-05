// @polsia:user-owned — Renor Labs Store catalogue and checkout integration point.
//
// The store is prepared, not open. PRODUCTS is empty on purpose: a product is
// added only when it is finished, priced by the founder, and has a real
// checkout link. Nothing here invents a product, price, review or sale.
//
// To publish a product: add it to PRODUCTS with status 'available' and a
// checkout URL on a host listed in VERIFIED_CHECKOUT_HOSTS (the Plug&Pay
// checkout domain, added once the founder confirms it). tests/unit/store.test.ts
// fails the build for any product that breaks these rules.

export const STORE_CATEGORIES = [
  {
    id: 'ai-tools',
    name: 'Digital AI tools',
    description: 'Ready-to-use prompts, workflows and small tools built and tested with Renor.',
  },
  {
    id: 'developer-resources',
    name: 'Developer resources',
    description: 'Templates, starter projects and references for people building with AI.',
  },
  {
    id: 'creator-products',
    name: 'Creator products',
    description:
      'Resources for creators: planning kits, content systems and production checklists.',
  },
] as const;

export type StoreCategoryId = (typeof STORE_CATEGORIES)[number]['id'];

export interface StoreProduct {
  slug: string;
  name: string;
  category: StoreCategoryId;
  /** One sentence: what the buyer gets. */
  summary: string;
  /** What exactly is delivered, e.g. "12-page PDF and 3 Notion templates". */
  deliverable: string;
  /** The founder-approved price, exactly as it should read, e.g. "€19". */
  priceLabel: string;
  /** Verified Plug&Pay checkout URL. Required when status is 'available'. */
  checkoutUrl: string | null;
  status: 'available' | 'coming-soon';
  details: readonly string[];
}

/** Checkout hosts the founder has confirmed. Empty until the Plug&Pay domain is supplied. */
export const VERIFIED_CHECKOUT_HOSTS: readonly string[] = [];

export const PRODUCTS: readonly StoreProduct[] = [];

export function productsIn(category: StoreCategoryId): readonly StoreProduct[] {
  return PRODUCTS.filter((product) => product.category === category);
}

export function findProduct(slug: string): StoreProduct | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
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
