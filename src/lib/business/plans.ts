// @polsia:user-owned — Renor's Free, Pro and Max plans, for the public plans page.
//
// Free is real: its button opens Renor, where you create an account.
// Pro and Max are PROPOSED, NOT ON SALE. No prices are set, no checkout provider
// is configured or approved, and no payment can be taken, so their buttons only
// add you to an early list by email. tests/unit/plans.test.ts fails the build if
// a paid plan ever links to a checkout or shows an invented price.
// Each feature line says whether it works in the preview today or is planned.
// The allowances themselves are enforced by the Renor server, not by this page.
import { CONTACT_MAILTO, RENOR_APP_URL } from '@/lib/business/ecosystem';

export type Availability = 'today' | 'planned';

export interface PlanFeature {
  text: string;
  availability: Availability;
}

/**
 * What a plan's button does. `signup` opens the Renor app to create a free
 * account; `early-list` opens an email to join the list for a plan that is not
 * open yet. There is deliberately no `checkout` kind until one is approved.
 */
export interface PlanAction {
  kind: 'signup' | 'early-list';
  label: string;
  href: string;
  /** One honest line under the button: what happens when you click. */
  note: string;
}

export interface Plan {
  id: 'free' | 'pro' | 'max';
  name: string;
  forWho: string;
  price: string;
  /** Free is open today; paid plans stay proposed until their prices are approved. */
  state: 'open' | 'proposed';
  action: PlanAction;
  features: readonly PlanFeature[];
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

/** Said plainly on the page: why Pro and Max cannot be bought yet. */
export const PAID_PLANS_NOTICE =
  'Pro and Max open once their prices are approved. Until then there is no checkout and nothing to pay.';

export const PLANS: readonly Plan[] = [
  {
    id: 'free',
    name: 'Free',
    forWho: 'A genuinely useful starting point.',
    price: 'No payment needed',
    state: 'open',
    action: {
      kind: 'signup',
      label: 'Sign up free',
      href: RENOR_APP_URL,
      note: 'Opens Renor, where you create your free account.',
    },
    features: [
      { text: 'Chat with the AI providers available to your account', availability: 'today' },
      { text: 'A clear daily AI allowance, with the reset time shown', availability: 'planned' },
      {
        text: 'Code AI and Website Builder for small projects, with live preview',
        availability: 'today',
      },
      { text: 'Save, reopen and keep editing your projects', availability: 'today' },
      { text: 'Run Python in your browser, sandboxed with no network', availability: 'today' },
      {
        text: 'Your projects stay open and editable when the AI allowance runs out',
        availability: 'planned',
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    forWho: 'For serious creators and developers.',
    price: 'Price not set',
    state: 'proposed',
    action: earlyList('Pro'),
    features: [
      { text: 'Larger AI allowances', availability: 'planned' },
      {
        text: 'Bigger Code AI and website projects, and longer build sessions',
        availability: 'planned',
      },
      { text: 'Deeper debugging and repair workflows', availability: 'planned' },
      { text: 'More model choices, where the cost allows', availability: 'planned' },
      { text: 'Stronger project history and recovery', availability: 'planned' },
    ],
  },
  {
    id: 'max',
    name: 'Max',
    forWho: 'For heavy, multi-file project work.',
    price: 'Price not set',
    state: 'proposed',
    action: earlyList('Max'),
    features: [
      { text: 'Higher limits for demanding workflows', availability: 'planned' },
      { text: 'Larger multi-file projects and longer automated runs', availability: 'planned' },
      { text: 'Deeper testing and project management', availability: 'planned' },
      { text: 'More execution environments as they become available', availability: 'planned' },
    ],
  },
];

/** Commitments every plan is being designed around, including when an allowance runs out. */
export const PLAN_PRINCIPLES = [
  {
    title: 'Your work is never held hostage',
    text: 'When an AI allowance runs out, your projects stay open: you can still view, edit and preview them. Only new AI work waits for the reset.',
  },
  {
    title: 'Local work is not metered',
    text: 'Editing, previewing and running code in your own browser will not use AI allowance. Only work done by a cloud AI model counts.',
  },
  {
    title: 'No unlimited promises',
    text: 'AI models cost money to run. Allowances are set from measured costs, so the limits we publish are limits we can keep.',
  },
  {
    title: 'Limits you can see',
    text: 'Renor will show what you have used, what is left and when it resets, before you hit a limit rather than after.',
  },
] as const;
