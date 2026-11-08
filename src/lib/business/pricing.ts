// @polsia:user-owned — which pricing the website shows: ONE flag for the founder.
//
// Two models exist:
//   'one-time' — Free + Lifetime £99 (one payment) + one-time AI credit packs, monthly plans
//                paused. Built in the app on branch launch-x/integration-v (docs/plans-lifetime.md,
//                7 November 2026), in Stripe test mode, NOT on sale and not merged yet.
//   'monthly'  — Free / Pro £12 / Plus £29 / Max £79 a month, approved 31 October 2026
//                (src/lib/business/plans.ts). Also not on sale.
// Flip PRICING_MODEL and every page follows: /renor/plans, the homepage, /renor/billing, Terms,
// the Renor Guide's facts and /llms.txt. Nothing can be bought under either model until checkout
// is verified and the founder says go live: there is deliberately no checkout link here.
import { CONTACT_MAILTO, RENOR_APP_URL } from '@/lib/business/ecosystem';

export type PricingModel = 'one-time' | 'monthly';

/** THE FLAG. Founder's choice before merging; see the PR description. */
export const PRICING_MODEL: PricingModel = 'one-time';

export function isOneTime(model: PricingModel = PRICING_MODEL): boolean {
  return model === 'one-time';
}

/** Where the numbers come from, for anyone checking them. */
export const ONE_TIME_SOURCE = {
  decided: '7 November 2026',
  doc: 'docs/plans-lifetime.md in the Renor app (branch launch-x/integration-v)',
} as const;

export interface OneTimeOffer {
  id: 'free' | 'lifetime';
  name: string;
  price: string;
  period: string;
  forWho: string;
  state: 'open' | 'not-on-sale';
  highlight?: boolean;
  includes: readonly string[];
  action: { label: string; href: string; note: string };
}

function earlyList(subject: string) {
  return `${CONTACT_MAILTO}?subject=${encodeURIComponent(subject)}`;
}

export const ONE_TIME_OFFERS: readonly OneTimeOffer[] = [
  {
    id: 'free',
    name: 'Free',
    price: '£0',
    period: 'for ever',
    forWho: 'Everything you need to try Renor properly.',
    state: 'open',
    includes: [
      '100 hosted AI credits a week',
      'AI on a local model (Ollama) uses no credits',
      '150 requests a week on your own API keys',
      'Chat, Code AI, Website Builder, notes and tasks',
      'All 12 interface languages',
    ],
    action: {
      label: 'Open Renor free',
      href: RENOR_APP_URL,
      note: 'Opens Renor, where you create your free account.',
    },
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '£99',
    period: 'one payment',
    forWho: 'Pay once. Run Renor on your own models for as long as Renor is offered.',
    state: 'not-on-sale',
    highlight: true,
    includes: [
      'Every feature, and every future update',
      'AI on a local model (Ollama, LM Studio) with no credits used',
      '1,000 requests a week on your own API keys, no credits',
      'The same 100 hosted AI credits a week as Free',
      'Priority access to new features',
    ],
    action: {
      label: 'Join the early list',
      href: earlyList('Renor Lifetime: add me to the early list'),
      note: 'Opens your email app. We write once Lifetime opens. No payment is taken.',
    },
  },
];

export interface CreditPack {
  id: 'small' | 'medium' | 'large';
  credits: number;
  price: string;
}

/** One-time hosted AI credit packs, for people with no machine or keys of their own. */
export const CREDIT_PACKS: readonly CreditPack[] = [
  { id: 'small', credits: 2000, price: '£5' },
  { id: 'medium', credits: 6000, price: '£13' },
  { id: 'large', credits: 16000, price: '£34' },
];

export const CREDIT_PACK_NOTE =
  'One payment each. Pack credits never expire and are used only after the week’s free credits run out.';

/** Said plainly wherever prices appear. */
export const ONE_TIME_NOTICE =
  'Lifetime and credit packs open when checkout goes live. Until then nothing can be bought and nothing is charged. Monthly plans are paused.';

/** Short answers for the one-time model. */
export const ONE_TIME_FAQ: readonly { q: string; a: string }[] = [
  {
    q: 'Is this a subscription?',
    a: 'No. Free costs nothing. Lifetime and credit packs are single payments: nothing renews and nothing is charged again.',
  },
  {
    q: 'Why is Lifetime about my own models?',
    a: 'A local model or your own API key costs Renor almost nothing to serve, so one payment can cover it for years. Renor’s hosted AI costs real money every time it runs, so it comes as a free weekly allowance plus packs you buy once.',
  },
  {
    q: 'What is an AI credit?',
    a: 'Credits measure the hosted AI work Renor does for you. Harder tasks and stronger models use more. Local models and your own keys use none.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Yes. Ask within 14 days of a purchase, for any reason, from the account that paid. After that we refund where the law requires it or where something did not work as described.',
  },
  {
    q: 'Is anything unlimited?',
    a: 'Only what costs nobody anything: AI on your own local model. Everything else has clear, published limits.',
  },
];

/** The one-line summary used by the homepage, the Guide and /llms.txt. */
export function pricingSummary(model: PricingModel = PRICING_MODEL): string {
  return isOneTime(model)
    ? 'Free to start. Lifetime is £99 once, and AI credit packs are one-time too: no subscription. Not on sale yet.'
    : 'Free to start. Pro £12, Plus £29 and Max £79 a month. Paid plans are not on sale yet.';
}
