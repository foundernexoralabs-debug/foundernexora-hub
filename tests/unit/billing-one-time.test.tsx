// @polsia:user-owned — /renor/billing, /renor/plans and Terms under the one-time pricing flag
// (Free + Lifetime £99 + AI credit packs). The monthly version is pinned in billing-page.test.tsx.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/business/pricing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/lib/business/pricing')>();
  return { ...actual, PRICING_MODEL: 'one-time', isOneTime: () => true };
});
vi.mock('../../src/components/custom/founder-orb.css', () => ({}));

const { default: BillingPage, metadata } = await import(
  '../../src/app/(custom)/renor/billing/page'
);
const { default: PlansPage } = await import('../../src/app/(custom)/renor/plans/page');
const { default: TermsPage } = await import('../../src/app/(custom)/terms/page');

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
const render = (Page: () => React.ReactElement) =>
  textOf(renderToStaticMarkup(createElement(Page)));

describe('one-time pricing', () => {
  it('billing says single payments, nothing renews and a 14-day full refund', () => {
    const text = render(BillingPage);
    expect(text).toContain('Pay once. Nothing renews.');
    expect(text).toMatch(/full refund within 14 days of a purchase, for any reason/);
    expect(text).toMatch(/Nothing is on sale yet/);
    expect(text).not.toMatch(/billed monthly|renews automatically|£12/);
    expect(String(metadata.description)).toMatch(/single payments/);
  });

  it('pricing shows Free, Lifetime £99 once and the credit packs, with nothing for sale', () => {
    const html = renderToStaticMarkup(createElement(PlansPage));
    const text = textOf(html);
    expect(text).toMatch(/Lifetime/);
    expect(text).toMatch(/£99 one payment/);
    expect(text).toMatch(/£5.*£13.*£34/);
    expect(text).not.toMatch(/£12|£29|£79|per month/);
    expect(html).not.toMatch(/checkout\.stripe|buy\.stripe/);
  });

  it('Terms point to the one-time rules and name Renor’s website', () => {
    const text = render(TermsPage);
    expect(text).toMatch(/Lifetime and AI credit packs/);
    expect(text).toContain('This website, renor.app, describes Renor');
    expect(text).not.toMatch(/FounderLab website/);
  });
});
