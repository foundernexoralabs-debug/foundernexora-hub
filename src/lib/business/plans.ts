// @polsia:user-owned — Renor's Free, Pro, Plus and Max plans: the single source for the plans page.
//
// Free is real: its button opens Renor, where you create an account.
// Every price and allowance below is a PROPOSAL from the founder (22 October 2026). None is
// approved, no checkout exists, and no payment can be taken, so paid plans only offer an
// early list by email. tests/unit/plans.test.ts fails the build if a plan links to a
// checkout, drops its "Proposed" label, or promises unlimited use.
// The allowances themselves will be enforced by the Renor server, not by this page.
import { CONTACT_MAILTO, RENOR_APP_URL } from '@/lib/business/ecosystem';

/** What a plan's button does. There is deliberately no `checkout` kind until one is approved. */
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
  /** Every price is a proposal until the founder approves it. */
  status: 'proposed';
}

/** Proposed allowances. Numbers, never "unlimited". */
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
  /** Free can be used today; paid plans open once their prices are approved. */
  state: 'open' | 'proposed';
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

const PROPOSED = 'proposed' as const;

/** Said plainly on the page: why Pro, Plus and Max cannot be bought yet. */
export const PAID_PLANS_NOTICE =
  'Pro, Plus and Max open once their prices are approved. Until then there is no checkout and nothing to pay.';

/** The label every price and allowance carries until it is approved. */
export const PROPOSED_LABEL = 'Proposed price';

export const PLANS: readonly Plan[] = [
  {
    id: 'free',
    name: 'Free',
    forWho: 'Try Renor properly, at no cost.',
    price: { amount: 0, label: '£0', period: 'per month', status: PROPOSED },
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
    price: { amount: 12, label: '£12', period: 'per month', status: PROPOSED },
    state: 'proposed',
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
    price: { amount: 29, label: '£29', period: 'per month', status: PROPOSED },
    state: 'proposed',
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
    price: { amount: 79, label: '£79', period: 'per month', status: PROPOSED },
    state: 'proposed',
    action: earlyList('Max'),
    allowances: {
      creditsPerWeek: 6000,
      activeProjects: 100,
      concurrentJobs: 8,
      models: 'Everything in Plus, with the highest priority and background autonomous work',
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

/** Short answers to the questions people ask before choosing a plan. */
export const PLAN_FAQ = [
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
    a: 'AI work pauses until your credits reset, and nothing is lost. Your projects stay open: you can still view, edit and preview them.',
  },
  {
    q: 'Can I upgrade, downgrade or cancel?',
    a: 'How upgrades, downgrades and cancellation work will be explained in full before billing opens. Today no paid plan can be bought, so there is nothing to cancel.',
  },
  {
    q: 'Is any plan unlimited?',
    a: 'No. AI models cost real money to run, so every plan has clear weekly limits. Limits we publish are limits we can keep.',
  },
  {
    q: 'Are these prices final?',
    a: 'No. They are proposed and not yet approved. Final prices are published here before anything can be bought.',
  },
] as const;

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
