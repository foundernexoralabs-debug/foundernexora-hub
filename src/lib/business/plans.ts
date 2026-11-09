// @polsia:user-owned — Renor's Free, Pro, Plus and Max plans: the single source for the plans page.
//
// Free is real: its button opens Renor, where you create an account.
// Prices were APPROVED by the founder on 31 October 2026 (£0 / £12 / £29 / £79 a month). The
// allowances are still PLANNED: the credit unit is being set, so they are labelled as planned.
// Paid plans are NOT on sale: no checkout exists until it is verified end to end and the founder
// says go live, so Pro, Plus and Max only offer an early list by email. How billing, cancelling
// and refunds work is on /renor/billing (src/lib/business/billing.ts).
// tests/unit/plans.test.ts fails the build if a plan links to a checkout, a paid plan is offered
// for sale, or any plan promises unlimited use.
// The allowances themselves will be enforced by the Renor server, not by this page.
import { BILLING_PATH, BILLING_TITLE } from '@/lib/business/billing';
import { CONTACT_MAILTO, RENOR_APP_URL } from '@/lib/business/ecosystem';

/** What a plan's button does. There is deliberately no `checkout` kind until checkout goes live. */
export interface PlanAction {
  kind: 'signup' | 'early-list';
  label: string;
  href: string;
  /** One honest line under the button: what happens when you click. */
  note: string;
}

export interface PlanPrice {
  /** Whole pounds per month. */
  amount: number;
  /** How it reads, e.g. "£12". */
  label: string;
  period: 'per month';
  /** Approved by the founder on 31 October 2026. */
  status: 'approved';
}

/** Planned allowances: numbers, never "unlimited". Not final until credit rates are published. */
export interface PlanAllowances {
  creditsPerWeek: number;
  activeProjects: number;
  concurrentJobs: number;
  /** Which models the plan can use, in plain words. */
  models: string;
}

export interface Plan {
  id: 'free' | 'pro' | 'plus' | 'max';
  name: string;
  forWho: string;
  price: PlanPrice;
  /** Free can be used today; paid plans are not on sale until checkout goes live. */
  state: 'open' | 'not-on-sale';
  /** Shown as the recommended plan for most paying users. */
  highlight?: boolean;
  action: PlanAction;
  allowances: PlanAllowances;
}

/** A mailto link to join the early list for a plan, with the subject filled in. */
export function earlyListHref(planName: string): string {
  return `${CONTACT_MAILTO}?subject=${encodeURIComponent(`Renor ${planName}: add me to the early list`)}`;
}

function earlyList(planName: string): PlanAction {
  return {
    kind: 'early-list',
    label: 'Join the early list',
    href: earlyListHref(planName),
    note: `Opens your email app. We write once ${planName} opens. No payment is taken.`,
  };
}

const APPROVED = 'approved' as const;

/** The day the founder approved the prices, as the site writes it. */
export const PRICES_APPROVED_ON = '31 October 2026';

/** Said plainly on the page: why Pro, Plus and Max cannot be bought yet. */
export const PAID_PLANS_NOTICE =
  'Pro, Plus and Max open when checkout goes live. Until then nothing can be bought and nothing is charged.';

/** The heading over every plan's allowances, and the one honest line about why. */
export const ALLOWANCES_LABEL = 'Planned allowances';
export const ALLOWANCES_NOTE =
  'Allowances are planned, not final: credit rates are published before billing opens.';

export const PLANS: readonly Plan[] = [
  {
    id: 'free',
    name: 'Free',
    forWho: 'Try Renor properly, at no cost.',
    price: { amount: 0, label: '£0', period: 'per month', status: APPROVED },
    state: 'open',
    action: {
      kind: 'signup',
      label: 'Sign up free',
      href: RENOR_APP_URL,
      note: 'Opens Renor, where you create your free account.',
    },
    allowances: {
      creditsPerWeek: 50,
      activeProjects: 2,
      concurrentJobs: 1,
      models: 'Efficient models for everyday chat, code and websites',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    forWho: 'For regular creators and developers.',
    price: { amount: 12, label: '£12', period: 'per month', status: APPROVED },
    state: 'not-on-sale',
    action: earlyList('Pro'),
    allowances: {
      creditsPerWeek: 600,
      activeProjects: 10,
      concurrentJobs: 2,
      models: 'Everything in Free, plus stronger models',
    },
  },
  {
    id: 'plus',
    name: 'Plus',
    forWho: 'For daily building and harder problems.',
    price: { amount: 29, label: '£29', period: 'per month', status: APPROVED },
    state: 'not-on-sale',
    highlight: true,
    action: earlyList('Plus'),
    allowances: {
      creditsPerWeek: 1800,
      activeProjects: 30,
      concurrentJobs: 4,
      models: 'Everything in Pro, plus the strongest models for hard reasoning and coding',
    },
  },
  {
    id: 'max',
    name: 'Max',
    forWho: 'For heavy, multi-project work.',
    price: { amount: 79, label: '£79', period: 'per month', status: APPROVED },
    state: 'not-on-sale',
    action: earlyList('Max'),
    allowances: {
      creditsPerWeek: 6000,
      activeProjects: 100,
      concurrentJobs: 8,
      models: 'Everything in Plus, with the highest priority, and background work once it ships',
    },
  },
];

const numberFormat = new Intl.NumberFormat('en-GB');

/** The allowance lines a plan card shows, in order. */
export function allowanceLines(plan: Plan): { id: string; label: string; value: string }[] {
  const { allowances: a } = plan;
  return [
    {
      id: 'credits',
      label: 'AI credits',
      value: `${numberFormat.format(a.creditsPerWeek)} per week`,
    },
    {
      id: 'projects',
      label: 'Active projects',
      value: numberFormat.format(a.activeProjects),
    },
    {
      id: 'jobs',
      label: 'Agent jobs at once',
      value: numberFormat.format(a.concurrentJobs),
    },
    { id: 'models', label: 'Models', value: a.models },
  ];
}

/** "Free £0, Pro £12, Plus £29 and Max £79", read from the plans above. */
export function priceList(): string {
  const items = PLANS.map((plan) => `${plan.name} ${plan.price.label}`);
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

/** A page an FAQ answer points to for the full rules. */
export interface FaqLink {
  href: string;
  label: string;
}

/** Short answers to the questions people ask before choosing a plan. */
export const PLAN_FAQ: readonly { q: string; a: string; link?: FaqLink }[] = [
  {
    q: 'What is an AI credit?',
    a: 'Credits measure the cloud AI work Renor does for you. Harder tasks and stronger models use more of them. Exact rates are published before billing opens.',
  },
  {
    q: 'When do credits reset?',
    a: 'Every week. Renor will show what you have used, what is left and when your next reset is.',
  },
  {
    q: 'What happens when my credits run out?',
    a: 'AI work pauses until your credits reset or you upgrade, and nothing is lost. There are no overage charges. Your projects stay open: you can still view, edit and preview them.',
  },
  {
    q: 'Can I upgrade, downgrade or cancel?',
    a: 'Yes. Cancel any time: paid features stay until the end of the month you paid for, then your account moves to Free with your work kept. Cancel within 14 days of first paying for a paid plan and we refund the unused days. Upgrades start straight away, with the difference charged pro rata for the rest of the month; downgrades start at your next renewal.',
    link: { href: BILLING_PATH, label: BILLING_TITLE },
  },
  {
    q: 'Is any plan unlimited?',
    a: 'No. AI models cost real money to run, so every plan has clear weekly limits. Limits we publish are limits we can keep.',
  },
  {
    q: 'Are these prices final?',
    a: `Yes. The prices were approved on ${PRICES_APPROVED_ON}: ${priceList()} a month, in pounds sterling. Pro, Plus and Max are not on sale yet: they open when checkout goes live. If a price ever changes, you are emailed at least 30 days before it applies. The allowances are still planned until credit rates are published.`,
  },
];

/** Commitments every plan is being designed around, including when credits run out. */
export const PLAN_PRINCIPLES = [
  {
    title: 'Your work is never held hostage',
    text: 'When credits run out, your projects stay open: you can still view, edit and preview them. Only new AI work waits for the reset.',
  },
  {
    title: 'Local work is not metered',
    text: 'Editing, previewing and running code in your own browser will not use credits. Only work done by a cloud AI model counts.',
  },
  {
    title: 'Limits, stated as numbers',
    text: 'AI models cost money to run. Allowances are set from measured costs, so the limits we publish are limits we can keep.',
  },
  {
    title: 'Limits you can see',
    text: 'Renor will show what you have used, what is left and when it resets, before you hit a limit rather than after.',
  },
] as const;
