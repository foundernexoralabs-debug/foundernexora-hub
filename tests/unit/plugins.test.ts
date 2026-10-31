// @polsia:user-owned — the Renor Plugin Store lists exactly what exists in the founder's shop,
// and can only ever show a buy button for an on-sale product with an active, verified checkout.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { userRedirects } from '../../next.user-config';
import { PluginCard, PurchasePanel } from '../../src/components/custom/plugin-store';
import { PluginJsonLd } from '../../src/components/custom/structured-data';
import { RENOR_LABS_STORE_URL, SOCIAL_CHANNELS } from '../../src/lib/business/ecosystem';
import { NEEDS } from '../../src/lib/business/guide';
import {
  buyHref,
  findPlugin,
  isCheckoutOnHosts,
  isPurchasable,
  isVerifiedCheckout,
  listedPlugins,
  notifyHref,
  PLUGIN_CATEGORIES,
  PLUGINS,
  type Plugin,
  PURCHASE_NOTE,
  pluginsIn,
  relatedPlugins,
  VERIFIED_CHECKOUT_HOSTS,
} from '../../src/lib/business/plugins';
import { navItems } from '../../src/lib/nav';
import { seoRoutes } from '../../src/lib/seo-routes';

const KIT = 'tradelaunch-electrician-business-kit';
const PACK = 'tradelaunch-90-day-local-growth-pack';
const kit = () => findPlugin(KIT) as Plugin;
const pack = () => findPlugin(PACK) as Plugin;
const root = path.resolve(__dirname, '../..');
const read = (file: string) => readFileSync(path.join(root, file), 'utf-8');

describe('catalogue integrity (Plug&Pay API, 22 October 2026)', () => {
  it('lists exactly the two real TradeLaunch products, by exact title and Plug&Pay id', () => {
    expect(PLUGINS.map((plugin) => [plugin.title, plugin.plugPayProductId])).toEqual([
      ['TradeLaunch: Electrician Business Kit', 416837],
      ['TradeLaunch: 90-Day Local Growth Pack', 416843],
    ]);
    expect(listedPlugins()).toHaveLength(2);
  });

  it('shows the exact prices, as one-off totals with no tax wording', () => {
    expect(kit().price).toEqual({
      amountMinor: 2900,
      currency: 'GBP',
      label: '£29',
      billing: 'one-off',
    });
    expect(pack().price).toEqual({
      amountMinor: 900,
      currency: 'GBP',
      label: '£9',
      billing: 'one-off',
    });
    const copy = JSON.stringify(PLUGINS);
    expect(copy).not.toMatch(/\bVAT\b|incl\.? tax|excl\.? tax|24\.17/i);
  });

  it('keeps the founder descriptions verbatim', () => {
    expect(kit().description).toBe(
      'A ready-to-use digital launch system for electricians: premium website copy and layout, quote/invoice templates, Google review scripts, WhatsApp follow-ups, local marketing content, AI-assisted admin prompts and a clear setup guide. Built to help a solo electrician look professional, respond faster and win more enquiries without hiring an agency.',
    );
    expect(pack().description).toBe(
      'An expansion pack for electricians with 90 days of local content ideas, review-request variations, referral messages, seasonal campaign prompts and repeatable weekly marketing actions designed to make consistent promotion easier.',
    );
  });

  it('never lists an "inside" item that is not in the description', () => {
    const words = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 3);
    for (const plugin of PLUGINS) {
      const described = new Set(words(plugin.description.replace(/\//g, ' and ')));
      for (const item of plugin.inside) {
        for (const word of words(item))
          expect(described.has(word), `${plugin.slug}: ${item}`).toBe(true);
      }
    }
  });

  it('records both checkouts as inactive and both products as opening soon', () => {
    expect(kit()).toMatchObject({
      availability: 'opening-soon',
      checkoutActive: false,
      checkoutUrl: 'https://renorlabs.plugandpay.com/checkout/tradelaunch-electrician-business-kit',
      salesPageUrl: 'https://renorlabs.plugandpay.com/electrician-business-kit-uk',
    });
    expect(pack()).toMatchObject({
      availability: 'opening-soon',
      checkoutActive: false,
      checkoutUrl: 'https://renorlabs.plugandpay.com/checkout/tradelaunch-90-day-local-growth-pack',
      salesPageUrl: null,
    });
  });

  it('every entry is complete, uniquely slugged and a digital download', () => {
    const ids: string[] = PLUGIN_CATEGORIES.map((category) => category.id);
    for (const plugin of PLUGINS) {
      expect(ids, plugin.slug).toContain(plugin.category);
      expect(plugin.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(plugin.format).toBe('Digital download');
      expect(plugin.inside.length, plugin.slug).toBeGreaterThan(0);
      for (const field of [plugin.title, plugin.summary, plugin.description, plugin.forWho])
        expect(field.trim(), plugin.slug).not.toBe('');
    }
    expect(new Set(PLUGINS.map((plugin) => plugin.slug)).size).toBe(PLUGINS.length);
  });

  it('has the three shelves; Templates and Renor extensions are honestly empty', () => {
    expect(PLUGIN_CATEGORIES.map((category) => category.name)).toEqual([
      'Business kits',
      'Templates',
      'Renor extensions',
    ]);
    expect(pluginsIn('business-kits')).toHaveLength(2);
    expect(pluginsIn('templates')).toHaveLength(0);
    expect(pluginsIn('renor-extensions')).toHaveLength(0);
  });

  it('relates the two TradeLaunch products to each other, never to themselves', () => {
    expect(relatedPlugins(kit()).map((plugin) => plugin.slug)).toEqual([PACK]);
    expect(relatedPlugins(pack()).map((plugin) => plugin.slug)).toEqual([KIT]);
  });
});

describe('only approved products are shown', () => {
  it('hides entries in review, rejected or retired', () => {
    const base = kit();
    const entries: Plugin[] = [
      { ...base, slug: 'a', reviewStatus: 'in-review' },
      { ...base, slug: 'b', reviewStatus: 'rejected' },
      { ...base, slug: 'c', availability: 'retired' },
      { ...base, slug: 'd' },
    ];
    expect(listedPlugins(entries).map((plugin) => plugin.slug)).toEqual(['d']);
  });
});

describe('buy buttons', () => {
  it('no product can be bought today, so none has a checkout link', () => {
    for (const plugin of PLUGINS) {
      expect(isPurchasable(plugin), plugin.slug).toBe(false);
      expect(buyHref(plugin), plugin.slug).toBeNull();
    }
  });

  it('needs on-sale AND an active checkout AND a verified host', () => {
    const base = kit();
    expect(isPurchasable({ ...base, availability: 'on-sale', checkoutActive: true })).toBe(true);
    expect(isPurchasable({ ...base, availability: 'on-sale', checkoutActive: false })).toBe(false);
    expect(isPurchasable({ ...base, availability: 'opening-soon', checkoutActive: true })).toBe(
      false,
    );
    expect(
      isPurchasable({
        ...base,
        availability: 'on-sale',
        checkoutActive: true,
        checkoutUrl: 'https://evil.example/checkout',
      }),
    ).toBe(false);
    expect(
      isPurchasable({
        ...base,
        availability: 'on-sale',
        checkoutActive: true,
        reviewStatus: 'in-review',
      }),
    ).toBe(false);
  });

  it('renders no checkout link and no "Buy" label for an inactive product', () => {
    for (const plugin of PLUGINS) {
      const html =
        renderToStaticMarkup(PurchasePanel({ plugin })) +
        renderToStaticMarkup(PluginCard({ plugin }));
      expect(html, plugin.slug).not.toContain('/checkout/');
      expect(html, plugin.slug).not.toMatch(/Buy now/);
      expect(html, plugin.slug).toContain('Opening soon');
      expect(html, plugin.slug).toContain('Notify me');
      expect(html, plugin.slug).toContain(plugin.price.label);
      expect(html, plugin.slug).not.toMatch(/\bVAT\b|incl\.? tax/i);
    }
  });

  it('the Kit links to its live sales page; the Pack (draft page) does not', () => {
    const kitHtml = renderToStaticMarkup(PurchasePanel({ plugin: kit() }));
    expect(kitHtml).toContain(
      'href="https://renorlabs.plugandpay.com/electrician-business-kit-uk"',
    );
    expect(kitHtml).toContain('See full details');
    const packHtml = renderToStaticMarkup(PurchasePanel({ plugin: pack() }));
    expect(packHtml).not.toContain('See full details');
    expect(packHtml).not.toContain('plugandpay.com');
  });

  it('an on-sale product with an active, verified checkout does get its buy button', () => {
    const plugin: Plugin = { ...kit(), availability: 'on-sale', checkoutActive: true };
    const html = renderToStaticMarkup(PurchasePanel({ plugin }));
    expect(html).toContain('Buy now');
    expect(html).toContain(`href="${plugin.checkoutUrl}"`);
  });

  it('Notify me is a mailto with the product named in the subject', () => {
    const href = notifyHref(kit());
    expect(href.startsWith('mailto:founder.nexoralabs@gmail.com?subject=')).toBe(true);
    expect(decodeURIComponent(href.split('subject=')[1] ?? '')).toBe(
      'Notify me when TradeLaunch: Electrician Business Kit opens',
    );
  });

  it('does not promise how delivery works before it is confirmed', () => {
    expect(PURCHASE_NOTE).toMatch(/Plug&Pay/);
    expect(PURCHASE_NOTE).toMatch(/Delivery details are confirmed before sales open/);
  });
});

describe('checkout hosts', () => {
  it("confirms only the founder's Plug&Pay shop", () => {
    expect(VERIFIED_CHECKOUT_HOSTS).toEqual(['renorlabs.plugandpay.com']);
    expect(isVerifiedCheckout('https://renorlabs.plugandpay.com/checkout/x')).toBe(true);
  });

  it('refuses other shops, look-alikes, http and junk', () => {
    for (const url of [
      null,
      '',
      'not a url',
      'javascript:alert(1)',
      'http://renorlabs.plugandpay.com/checkout/x',
      'https://plugandpay.com/checkout/x',
      'https://othershop.plugandpay.com/checkout/x',
      'https://evil-renorlabs.plugandpay.com/checkout/x',
      'https://renorlabs.plugandpay.com.evil.test/checkout/x',
      'https://renorlabs.plugandpay.com@evil.test/checkout/x',
      'https://user:pass@renorlabs.plugandpay.com/checkout/x',
    ]) {
      expect(isVerifiedCheckout(url), String(url)).toBe(false);
    }
  });

  it('host matching accepts the confirmed host and its subdomains only', () => {
    const hosts = ['pay.example'];
    expect(isCheckoutOnHosts('https://pay.example/p', hosts)).toBe(true);
    expect(isCheckoutOnHosts('https://shop.pay.example/p', hosts)).toBe(true);
    expect(isCheckoutOnHosts('https://evilpay.example/p', hosts)).toBe(false);
  });
});

describe('the move from /store to /plugins', () => {
  it('redirects /store and /store/:slug permanently', () => {
    expect(userRedirects.filter((redirect) => redirect.source.startsWith('/store'))).toEqual([
      { source: '/store', destination: '/plugins', permanent: true },
      { source: '/store/:slug', destination: '/plugins/:slug', permanent: true },
    ]);
  });

  it('nothing links to /store any more', () => {
    for (const item of navItems) expect(item.href, item.label).not.toMatch(/^\/store\b/);
    for (const need of NEEDS)
      for (const action of need.actions) expect(action.href).not.toMatch(/^\/store\b/);
    for (const file of [
      'src/lib/business/explore.ts',
      'src/lib/business/ecosystem.ts',
      'src/components/custom/plugin-store.tsx',
      'src/app/(custom)/plugins/page.tsx',
      'src/app/(custom)/plugins/[slug]/page.tsx',
      'src/app/(custom)/privacy/page.tsx',
      'src/app/(custom)/terms/page.tsx',
    ])
      expect(read(file), file).not.toMatch(/["'`]\/store\b/);
  });

  it('keeps a "Plugins" menu in the top bar and the Plugin Store in the footer', () => {
    const top = navItems.filter((item) => item.group === 'primary' && item.menu === 'Plugins');
    expect(top.map((item) => [item.label, item.href])).toEqual([
      ['Plugin Store', '/plugins'],
      ['Shop on Renor Labs', RENOR_LABS_STORE_URL],
    ]);
    expect(navItems.some((item) => item.group === 'footer' && item.href === '/plugins')).toBe(true);
  });

  it('links the Renor Labs shop home (never the 404 bare domain) from one constant', () => {
    expect(RENOR_LABS_STORE_URL).toBe('https://renorlabs.plugandpay.com/home');
    const footer = navItems.filter((item) => item.group === 'footer').map((item) => item.href);
    expect(footer).toContain(RENOR_LABS_STORE_URL);
    expect(SOCIAL_CHANNELS.map((channel) => channel.url)).toContain(RENOR_LABS_STORE_URL);
    const card = NEEDS.find((need) => need.id === 'plugins');
    expect(card?.actions.map((action) => action.href)).toContain(RENOR_LABS_STORE_URL);
    expect(read('src/app/(custom)/plugins/page.tsx')).toContain('RENOR_LABS_STORE_URL');
    for (const file of ['src/lib/nav.ts', 'src/lib/business/guide.ts'])
      expect(read(file), file).not.toMatch(/renorlabs\.plugandpay\.com\/?['"]/);
  });

  it('puts every product page in the sitemap under /plugins', async () => {
    expect((await seoRoutes()).map((route) => route.path)).toEqual([
      `/plugins/${KIT}`,
      `/plugins/${PACK}`,
    ]);
  });
});

describe('product structured data', () => {
  const jsonOf = (plugin: Plugin) => {
    const html = renderToStaticMarkup(PluginJsonLd({ plugin }));
    return JSON.parse(html.replace(/^<script[^>]*>|<\/script>$/g, '')) as {
      '@graph': Record<string, unknown>[];
    };
  };

  it('describes each product, with no offer while it cannot be bought', () => {
    for (const plugin of PLUGINS) {
      const product = jsonOf(plugin)['@graph'][0];
      expect(product?.['@type']).toBe('Product');
      expect(product?.name).toBe(plugin.title);
      expect(product).not.toHaveProperty('offers');
    }
  });

  it('publishes an offer once a product is on sale with a verified checkout', () => {
    const plugin: Plugin = { ...kit(), availability: 'on-sale', checkoutActive: true };
    expect(jsonOf(plugin)['@graph'][0]?.offers).toMatchObject({
      price: '29.00',
      priceCurrency: 'GBP',
      url: plugin.checkoutUrl,
    });
  });
});
