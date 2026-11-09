// @polsia:user-owned — no store link on the site can lead to a 404.
//
// On 9 November 2026 both TradeLaunch checkouts and the bare renorlabs.plugandpay.com domain
// returned 404, while the shop home (/home) and the Kit's sales page returned 200. This test
// fails if any Plug&Pay URL the site renders, or writes into its source, is not either one of
// those live store pages or the checkout of a product that is purchasable right now.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PluginCard, PluginRow, PurchasePanel } from '../../src/components/custom/plugin-store';
import { PluginJsonLd, PluginStoreJsonLd } from '../../src/components/custom/structured-data';
import { CHANNELS, RENOR_LABS_STORE_URL } from '../../src/lib/business/ecosystem';
import { DESTINATIONS } from '../../src/lib/business/explore';
import { NEEDS } from '../../src/lib/business/guide';
import {
  buyHref,
  isLinkableStoreUrl,
  isPurchasable,
  LIVE_STORE_PAGES,
  listedPlugins,
  PLUGINS,
  type Plugin,
} from '../../src/lib/business/plugins';
import { navItems } from '../../src/lib/nav';

const root = path.resolve(__dirname, '../..');
const STORE_URL = /https?:\/\/(?:[a-z0-9-]+\.)*plugandpay\.com[^\s'"`<>)\\]*/gi;

const storeUrlsIn = (text: string) => [...text.matchAll(STORE_URL)].map((match) => match[0]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) return sourceFiles(file);
    return /\.(ts|tsx|txt|json|md)$/.test(name) ? [file] : [];
  });
}

/** Everything a product can put on a page: card, row, purchase panel and JSON-LD. */
function renderedProduct(plugin: Plugin): string {
  return [
    renderToStaticMarkup(PluginCard({ plugin })),
    renderToStaticMarkup(PluginRow({ plugin })),
    renderToStaticMarkup(PurchasePanel({ plugin })),
    renderToStaticMarkup(PluginJsonLd({ plugin })),
  ].join('\n');
}

describe('store links (checked 9 November 2026)', () => {
  it('lists only pages that answered 200, and never a checkout', () => {
    expect(LIVE_STORE_PAGES.checkedOn).toBe('2026-11-09');
    expect([...LIVE_STORE_PAGES.urls]).toEqual([
      'https://renorlabs.plugandpay.com/home',
      'https://renorlabs.plugandpay.com/electrician-business-kit-uk',
    ]);
    for (const url of LIVE_STORE_PAGES.urls) expect(url).not.toContain('/checkout/');
  });

  it('refuses the 404s: both inactive checkouts and the bare shop domain', () => {
    for (const plugin of PLUGINS) {
      expect(isPurchasable(plugin), plugin.slug).toBe(false);
      expect(isLinkableStoreUrl(plugin.checkoutUrl ?? ''), plugin.slug).toBe(false);
    }
    expect(isLinkableStoreUrl('https://renorlabs.plugandpay.com/')).toBe(false);
    expect(isLinkableStoreUrl('https://renorlabs.plugandpay.com')).toBe(false);
  });

  it('allows a checkout only once its product is purchasable', () => {
    const open: Plugin = {
      ...(PLUGINS[0] as Plugin),
      availability: 'on-sale',
      checkoutActive: true,
    };
    expect(isLinkableStoreUrl(open.checkoutUrl ?? '', [open])).toBe(true);
    expect(buyHref(open)).toBe(open.checkoutUrl);
  });

  it('every store URL a product renders belongs to a live page or an active product', () => {
    const html = listedPlugins().map(renderedProduct).join('\n');
    const store = renderToStaticMarkup(PluginStoreJsonLd({ plugins: listedPlugins() }));
    const urls = storeUrlsIn(html + store);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(isLinkableStoreUrl(url), url).toBe(true);
    expect(html).not.toContain('/checkout/');
  });

  it('every store URL in the navigation, footer, channels, guide and explore cards is live', () => {
    const urls = [
      ...navItems.map((item) => item.href),
      ...CHANNELS.map((channel) => channel.url ?? ''),
      ...NEEDS.flatMap((need) => need.actions.map((action) => action.href)),
      ...Object.values(DESTINATIONS).map((destination) => destination.href),
    ].flatMap(storeUrlsIn);
    expect(urls).toContain(RENOR_LABS_STORE_URL);
    for (const url of urls) expect(isLinkableStoreUrl(url), url).toBe(true);
  });

  it('no source file links a Plug&Pay URL that is not live (checkout data excepted)', () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(path.join(root, 'src'))) {
      for (const line of readFileSync(file, 'utf-8').split('\n')) {
        // The checkout URLs are data, rendered only through buyHref() once purchasable.
        if (/^\s*checkoutUrl:/.test(line)) continue;
        for (const url of storeUrlsIn(line))
          if (!isLinkableStoreUrl(url)) offenders.push(`${path.relative(root, file)}: ${url}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
