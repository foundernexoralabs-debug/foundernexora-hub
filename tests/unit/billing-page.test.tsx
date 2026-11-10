// @polsia:user-owned — /renor/billing states the founder's billing policy of 31 October 2026 in
// full (rules 1–12 and the seller line), says paid plans are not on sale yet, and stays clear of
// what is still open: no VAT or tax claim, no card statement descriptor, no personal details and
// no checkout link. Terms and Privacy point to it instead of promising terms "before they apply".
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PrivacyPage from '../../src/app/(custom)/privacy/page';
import BillingPage, { metadata } from '../../src/app/(custom)/renor/billing/page';
import TermsPage from '../../src/app/(custom)/terms/page';
import {
  BILLING_PATH,
  BILLING_SUMMARY,
  BILLING_TITLE,
  SELLER_IDENTITY,
} from '../../src/lib/business/billing';
import { CONTACT_EMAIL } from '../../src/lib/business/ecosystem';
import { FOUNDER } from '../../src/lib/business/founder';
import { navItems } from '../../src/lib/nav';

/** Visible text of server-rendered markup: tags become spaces, entities decoded, spaces collapsed. */
const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/ ([,.:;])/g, '$1')
    .trim();

const render = (Page: () => React.ReactElement) => renderToStaticMarkup(createElement(Page));
const billingHtml = render(BillingPage);
const billing = textOf(billingHtml);
/** The policy itself: the reading column, without the related-pages band under it. */
const policy = textOf(billingHtml.slice(0, billingHtml.indexOf('aria-labelledby="explore-title"')));

describe('/renor/billing states every rule of the policy', () => {
  it.each([
    [
      '1. prices, monthly, in pounds sterling',
      /priced per month in pounds sterling: Free £0, Pro £12, Plus £29 and Max £79/,
    ],
    ['2. billed monthly in advance', /billed monthly, in advance/],
    [
      '2. renews on the same date until cancelled',
      /renews automatically on the same date each month until you cancel/,
    ],
    [
      '2. Stripe handles payments; no card numbers',
      /handled by Stripe.*Renor never sees or stores your card number/,
    ],
    [
      '3. cancel any time, in the app or by email',
      new RegExp(
        `Cancel any time.*Settings → Plan → Manage billing, or email ${CONTACT_EMAIL.replace('.', '\\.')}`,
      ),
    ],
    [
      '3. paid features to the end of the paid month, then Free',
      /paid features stay until the end of the month you have already paid for, then your account moves to Free/,
    ],
    ['3. work is kept', /Your projects and work are kept/],
    [
      '4. 14-day refund on a first subscription',
      /Cancel within 14 days of first paying for a paid plan and you get a refund/,
    ],
    [
      '4. refund of the unused days, proportional amount kept',
      /refund is for the unused days of that month: we keep a proportional amount for the days you have already had/,
    ],
    [
      '4. applies to consumers and businesses',
      /applies to everyone, whether you buy as a consumer or for a business/,
    ],
    [
      '5. no part-month refunds after 14 days, except law or failure',
      /After 14 days\. We do not refund part-months, except where the law requires a refund\./,
    ],
    ['5. fix it or refund', /If Renor fails to provide the service, we fix it or refund you/],
    [
      '6. upgrades at once, pro rata',
      /Upgrades take effect at once.*difference in price, pro rata/,
    ],
    ['6. downgrades at the next renewal', /Downgrades take effect at your next renewal/],
    [
      '7. no overage charges; AI work pauses',
      /AI work pauses until your weekly reset or until you upgrade\. There are no overage charges/,
    ],
    [
      '8. 30 days’ notice of price changes',
      /we email you at least 30 days before the new price applies.*cancel before then/,
    ],
    [
      '9. failed payments retry, remind, then Free',
      /Stripe tries it again and emails you a reminder\. If it still fails, your plan returns to Free\. Your work is kept/,
    ],
    [
      '10. Renor ending a plan refunds the unused part',
      /If Renor ends your paid plan or stops the service, we refund the unused part of the month/,
    ],
    [
      '11. refunds to the original method, 5–10 working days',
      /Refunds go back to the payment method you paid with\. Banks usually show them within 5 to 10 working days/,
    ],
    ['12. statutory rights not affected', /Nothing on this page affects your statutory rights/],
  ])('%s', (_rule, pattern) => {
    expect(policy).toMatch(pattern);
  });

  it('names the seller in the approved words, and is dated 31 October 2026', () => {
    expect(policy).toContain(SELLER_IDENTITY);
    expect(policy).toContain('Last updated 31 October 2026.');
  });

  it('says paid plans are not on sale yet before any rule', () => {
    const notice = policy.indexOf('Paid plans are not on sale yet.');
    expect(notice).toBeGreaterThan(-1);
    expect(notice).toBeLessThan(policy.indexOf('Renor has four plans'));
    expect(policy).toMatch(/These rules apply from the day checkout goes live/);
  });

  it('carries the page title and a description that matches the rules', () => {
    expect(billing).toContain(BILLING_TITLE);
    expect(String(metadata.description)).toMatch(/cancel any time.*14-day refund.*no overage/i);
    expect(metadata.alternates?.canonical).toBe(BILLING_PATH);
  });
});

describe('/renor/billing stays clear of what is still open', () => {
  it('shows no founder name, home address or phone number', () => {
    expect(policy).not.toContain(FOUNDER.name);
    expect(SELLER_IDENTITY).not.toContain(FOUNDER.name);
    // A UK postcode, a street line or a phone number would all be personal details here.
    expect(policy).not.toMatch(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/);
    expect(policy).not.toMatch(/\b\d+\s+\w+\s+(Street|St|Road|Rd|Lane|Avenue|Close|Drive)\b/);
    expect(policy).not.toMatch(/\+?\d[\d\s().-]{8,}\d/);
    expect(billingHtml).not.toMatch(/href="tel:/);
  });

  it('makes no VAT, tax or statement-descriptor claim', () => {
    expect(policy).not.toMatch(/\bVAT\b|\btax(es)?\b|\bdescriptor\b|bank statement|AETHER/i);
    expect(BILLING_SUMMARY).not.toMatch(/\bVAT\b|\btax\b/i);
  });

  it('never uses the b-o-t word', () => {
    const word = ['b', 'o', 't'].join('');
    expect(billing).not.toMatch(new RegExp(`\\b${word}s?\\b`, 'i'));
  });

  it('links nowhere but this site and the contact email: no checkout', () => {
    const hrefs = [...billingHtml.matchAll(/href="([^"]+)"/g)].map((match) => match[1] ?? '');
    expect(hrefs.length).toBeGreaterThan(5);
    for (const href of hrefs)
      expect(
        href.startsWith('/') || href.startsWith('#') || href === `mailto:${CONTACT_EMAIL}`,
        href,
      ).toBe(true);
    expect(billingHtml).not.toMatch(/checkout\.stripe|buy\.stripe|plugandpay/i);
  });

  it('is linked from the footer, under Legal', () => {
    expect(navItems).toContainEqual(
      expect.objectContaining({ href: BILLING_PATH, group: 'footer', menu: 'Legal' }),
    );
  });
});

describe('Terms and Privacy agree with the billing page', () => {
  const terms = textOf(render(TermsPage));
  const privacy = textOf(render(PrivacyPage));

  it('Terms points paid-plan billing to the billing page and names the seller', () => {
    expect(render(TermsPage)).toContain(`href="${BILLING_PATH}"`);
    expect(terms).toContain(BILLING_TITLE);
    expect(terms).toContain(SELLER_IDENTITY);
    expect(terms).toContain('Last updated 10 November 2026.');
    expect(terms).not.toMatch(/will be published before they apply/);
  });

  it('Terms keeps Plugin Store download refunds as published before the first sale', () => {
    expect(terms).toMatch(
      /Renor Plugin Store are separate, and will be published before the first product is sold\. That includes the refund terms for digital downloads/,
    );
  });

  it('Privacy says how card payments are handled and links the billing page', () => {
    expect(privacy).toMatch(
      /payments are handled by Stripe.*Renor never sees or stores your card number/,
    );
    expect(render(PrivacyPage)).toContain(`href="${BILLING_PATH}"`);
    expect(privacy).not.toMatch(/before any paid plan exists/);
  });

  it('neither page makes a VAT claim or uses the b-o-t word', () => {
    const word = ['b', 'o', 't'].join('');
    for (const text of [terms, privacy]) {
      expect(text).not.toMatch(/\bVAT\b/);
      expect(text).not.toMatch(new RegExp(`\\b${word}s?\\b`, 'i'));
    }
  });
});
