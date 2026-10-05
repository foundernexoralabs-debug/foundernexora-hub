// @polsia:user-owned — Renor's proposed Free / Pro / Advanced plans, for the public plans page.
//
// PROPOSED, NOT ON SALE. No prices are set and no billing exists. Each line says
// whether it works in the preview today or is planned, so the page never
// advertises an unfinished benefit as if it were available. The allowances
// themselves are enforced by the Renor server, not by this page.

export type Availability = 'today' | 'planned';

export interface PlanFeature {
  text: string;
  availability: Availability;
}

export interface Plan {
  id: 'free' | 'pro' | 'advanced';
  name: string;
  forWho: string;
  price: string;
  features: readonly PlanFeature[];
}

export const PLANS: readonly Plan[] = [
  {
    id: 'free',
    name: 'Free',
    forWho: 'A genuinely useful starting point.',
    price: 'No payment needed',
    features: [
      { text: 'Chat with the AI providers available to your account', availability: 'today' },
      { text: 'A clear daily AI allowance, with the reset time shown', availability: 'planned' },
      {
        text: 'Code AI and Website Builder for small projects, with live preview',
        availability: 'today',
      },
      { text: 'Save, reopen and keep editing your projects', availability: 'today' },
      { text: 'Run Python in your browser, with no AI allowance used', availability: 'planned' },
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
    id: 'advanced',
    name: 'Advanced',
    forWho: 'For heavy, multi-file project work.',
    price: 'Price not set',
    features: [
      { text: 'Higher limits for demanding workflows', availability: 'planned' },
      { text: 'Larger multi-file projects and longer automated runs', availability: 'planned' },
      { text: 'Advanced testing and project management', availability: 'planned' },
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
