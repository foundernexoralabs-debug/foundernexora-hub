// @polsia:user-owned — the store can only ever link to a confirmed checkout.
import { describe, expect, it } from 'vitest';
import {
  findProduct,
  isCheckoutOnHosts,
  isPurchasable,
  isVerifiedCheckout,
  PRODUCTS,
  relatedProducts,
  STORE_CATEGORIES,
  VERIFIED_CHECKOUT_HOSTS,
} from '../../src/lib/business/store';

describe('Renor Labs Store catalogue', () => {
  it('every product is in a real category, has a unique slug, and is complete', () => {
    const categoryIds: string[] = STORE_CATEGORIES.map((category) => category.id);
    for (const product of PRODUCTS) {
      expect(categoryIds, product.slug).toContain(product.category);
      expect(product.slug, product.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      for (const field of [product.name, product.summary, product.description, product.format]) {
        expect(field.trim(), product.slug).not.toBe('');
      }
      expect(product.details.length, product.slug).toBeGreaterThan(0);
    }
    expect(new Set(PRODUCTS.map((product) => product.slug)).size).toBe(PRODUCTS.length);
  });

  it('every available product has a price and a verified checkout', () => {
    for (const product of PRODUCTS.filter((entry) => entry.status === 'available')) {
      expect(product.priceLabel.trim(), product.slug).not.toBe('');
      expect(isVerifiedCheckout(product.checkoutUrl), product.slug).toBe(true);
    }
  });

  it('coming-soon products carry no checkout link and cannot be bought', () => {
    for (const product of PRODUCTS.filter((entry) => entry.status === 'coming-soon')) {
      expect(product.checkoutUrl, product.slug).toBeNull();
      expect(isPurchasable(product), product.slug).toBe(false);
    }
  });

  it('lists exactly the two TradeLaunch products from the renorlabs Plug&Pay shop, both coming soon', () => {
    // Plug&Pay checkouts for both are inactive (verified 6 October 2026). Change this in
    // the same commit that activates a checkout and adds its URL.
    expect(PRODUCTS.map((product) => product.name)).toEqual([
      'TradeLaunch: Electrician Business Kit',
      'TradeLaunch: 90-Day Local Growth Pack',
    ]);
    for (const product of PRODUCTS) {
      expect(product.status, product.slug).toBe('coming-soon');
      expect(product.category, product.slug).toBe('business-kits');
    }
    expect(findProduct('tradelaunch-electrician-business-kit')?.priceLabel).toBe(
      '£29.00 incl. tax',
    );
    expect(findProduct('tradelaunch-90-day-local-growth-pack')?.priceLabel).toBe('£9.00 incl. tax');
  });

  it('links products in the same line to each other, never to themselves', () => {
    const kit = findProduct('tradelaunch-electrician-business-kit');
    expect(kit).toBeDefined();
    if (!kit) return;
    expect(relatedProducts(kit).map((product) => product.slug)).toEqual([
      'tradelaunch-90-day-local-growth-pack',
    ]);
  });

  it('keeps the existing shelves alongside Business kits', () => {
    expect(STORE_CATEGORIES.map((category) => category.id)).toEqual([
      'business-kits',
      'ai-tools',
      'developer-resources',
      'creator-products',
    ]);
  });
});

describe('checkout hosts', () => {
  it("confirms only the founder's Plug&Pay shop", () => {
    expect(VERIFIED_CHECKOUT_HOSTS).toEqual(['renorlabs.plugandpay.com']);
  });

  it('accepts an https checkout on the renorlabs shop', () => {
    expect(isVerifiedCheckout('https://renorlabs.plugandpay.com/checkout/electrician-kit')).toBe(
      true,
    );
  });

  it('refuses other Plug&Pay shops, look-alikes, http and junk', () => {
    for (const url of [
      null,
      '',
      'not a url',
      'javascript:alert(1)',
      'http://renorlabs.plugandpay.com/checkout/electrician-kit',
      'https://plugandpay.com/checkout/electrician-kit',
      'https://othershop.plugandpay.com/checkout/electrician-kit',
      'https://evil-renorlabs.plugandpay.com/checkout/electrician-kit',
      'https://renorlabs.plugandpay.com.evil.test/checkout/electrician-kit',
      'https://renorlabs-plugandpay.com/checkout/electrician-kit',
      'https://renorlabs.plugandpay.com@evil.test/checkout/electrician-kit',
      'https://user:pass@renorlabs.plugandpay.com/checkout/electrician-kit',
      'https://checkout.example.com/p/1',
    ]) {
      expect(isVerifiedCheckout(url), String(url)).toBe(false);
    }
  });

  it('host matching accepts the confirmed host and its subdomains only', () => {
    const hosts = ['pay.example'];
    expect(isCheckoutOnHosts('https://pay.example/p/desk-kit', hosts)).toBe(true);
    expect(isCheckoutOnHosts('https://shop.pay.example/p/desk-kit', hosts)).toBe(true);
    for (const url of [
      'http://pay.example/p/desk-kit',
      'https://pay.example.evil.test/p/desk-kit',
      'https://evilpay.example/p/desk-kit',
      'https://pay.example@evil.test/p/desk-kit',
      'https://user:pass@pay.example/p/desk-kit',
    ]) {
      expect(isCheckoutOnHosts(url, hosts), url).toBe(false);
    }
  });
});
