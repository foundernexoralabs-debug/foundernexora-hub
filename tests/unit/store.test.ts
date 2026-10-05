// @polsia:user-owned — the store can only ever link to a confirmed checkout.
import { describe, expect, it } from 'vitest';
import {
  isCheckoutOnHosts,
  isVerifiedCheckout,
  PRODUCTS,
  STORE_CATEGORIES,
  VERIFIED_CHECKOUT_HOSTS,
} from '../../src/lib/business/store';

describe('Renor Labs Store', () => {
  it('publishes no product until it is real: every available product has a price and a verified checkout', () => {
    for (const product of PRODUCTS) {
      expect(STORE_CATEGORIES.map((category) => category.id)).toContain(product.category);
      if (product.status === 'available') {
        expect(product.priceLabel.trim(), product.slug).not.toBe('');
        expect(isVerifiedCheckout(product.checkoutUrl), product.slug).toBe(true);
      }
    }
    expect(new Set(PRODUCTS.map((product) => product.slug)).size).toBe(PRODUCTS.length);
  });

  it('opens with no products and no checkout hosts until the founder supplies them', () => {
    // Update these in the same commit that adds a real product and its Plug&Pay domain.
    expect(PRODUCTS).toHaveLength(0);
    expect(VERIFIED_CHECKOUT_HOSTS).toHaveLength(0);
  });

  it('refuses any checkout link while no host is confirmed: http, look-alike domains and junk alike', () => {
    for (const url of [
      null,
      '',
      'not a url',
      'http://checkout.example.com/p/1',
      'https://checkout.example.com/p/1',
      'javascript:alert(1)',
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
