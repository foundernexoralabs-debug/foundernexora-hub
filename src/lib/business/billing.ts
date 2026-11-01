// @polsia:user-owned — billing, cancellation and refunds for Renor's paid plans: the facts other
// pages and the Renor Guide reuse. The full wording lives on /renor/billing; this file holds the
// route, the date and the short lines that must read the same everywhere they appear.
//
// Source: the founder's billing policy of 31 October 2026. Prices are approved; paid plans are
// not on sale until checkout is verified and the founder says go live. Deliberately absent (open,
// flagged for professional confirmation): any VAT or tax statement, and the card statement
// descriptor. tests/unit/billing-page.test.ts keeps them out, along with any personal details.

/** Where the billing, cancellation and refunds page lives. */
export const BILLING_PATH = '/renor/billing';

/** The page's own title, used by links to it so they all read the same. */
export const BILLING_TITLE = 'Billing, cancellation and refunds';

/** Who sells Renor's paid plans. No personal name, home address or phone, by design. */
export const SELLER_IDENTITY =
  'Renor is run by its founder as a sole trader in the United Kingdom, trading as Renor (by FounderLab). Our full business name and address are shown on every invoice.';

/** The rules people ask about most, in one breath. Every line is stated in full on the page. */
export const BILLING_SUMMARY =
  'You pay monthly in advance and can cancel any time; paid features stay until the end of the month you paid for. Cancel within 14 days of first paying for a paid plan and we refund the unused days. There are no overage charges, and any price change is emailed at least 30 days before it applies.';
