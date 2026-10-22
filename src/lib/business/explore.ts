// @polsia:user-owned — the "Explore FounderLab" next-steps system.
//
// One registry of every place a visitor can go, and, for each page, the few
// destinations that are most useful from there. Pages render <ExploreBand page="…" />,
// so no page ends in a dead end and no two pages end with the same generic block.
// tests/unit/explore.test.ts checks every internal href resolves to a real page.
import { RENOR_APP_URL } from '@/lib/business/ecosystem';

export type DestinationId =
  | 'renor'
  | 'renor-app'
  | 'plans'
  | 'store'
  | 'store-policies'
  | 'projects'
  | 'zero-to-prove'
  | 'company'
  | 'contact'
  | 'accessibility'
  | 'privacy'
  | 'terms';

export type DestinationIcon =
  | 'sparkles'
  | 'external'
  | 'layers'
  | 'bag'
  | 'receipt'
  | 'folder'
  | 'route'
  | 'building'
  | 'mail'
  | 'accessibility'
  | 'lock'
  | 'file';

export interface Destination {
  title: string;
  text: string;
  /** Internal route (optionally with #anchor) or a verified https URL. */
  href: string;
  /** External destinations open in a new tab. */
  external?: boolean;
  icon: DestinationIcon;
}

export const DESTINATIONS: Record<DestinationId, Destination> = {
  renor: {
    title: 'Renor',
    text: 'The AI workspace for chat, code, websites and projects, with every feature’s status.',
    href: '/renor',
    icon: 'sparkles',
  },
  'renor-app': {
    title: 'Open Renor',
    text: 'Try the web preview in your browser. Free to start, no payment.',
    href: RENOR_APP_URL,
    external: true,
    icon: 'external',
  },
  plans: {
    title: 'Plans',
    text: 'Free, Pro and Advanced, as proposed. Nothing is on sale and no price is set.',
    href: '/renor/plans',
    icon: 'layers',
  },
  store: {
    title: 'Renor Labs Store',
    text: 'Practical digital products, starting with TradeLaunch kits for electricians.',
    href: '/store',
    icon: 'bag',
  },
  'store-policies': {
    title: 'Store policies',
    text: 'What you receive, refunds and payments: set out before anything goes on sale.',
    href: '/store#policies',
    icon: 'receipt',
  },
  projects: {
    title: 'Projects',
    text: 'Everything FounderLab is building, from live to researched, with honest status.',
    href: '/projects',
    icon: 'folder',
  },
  'zero-to-prove': {
    title: 'Zero to Prove',
    text: 'The build log: what was built, what broke and what was actually proven.',
    href: '/zero-to-prove',
    icon: 'route',
  },
  company: {
    title: 'About FounderLab',
    text: 'Who we are, what we make, and the rules behind everything we ship.',
    href: '/company',
    icon: 'building',
  },
  contact: {
    title: 'Contact',
    text: 'Email us, send feedback or report a bug. A person reads every message.',
    href: '/contact',
    icon: 'mail',
  },
  accessibility: {
    title: 'Accessibility',
    text: 'What we have checked, the known limits, and how to report a barrier.',
    href: '/accessibility',
    icon: 'accessibility',
  },
  privacy: {
    title: 'Privacy',
    text: 'What this website collects, what it does not, and how Renor handles your work.',
    href: '/privacy',
    icon: 'lock',
  },
  terms: {
    title: 'Terms',
    text: 'The terms for using this website, and where product terms will live.',
    href: '/terms',
    icon: 'file',
  },
};

export type ExplorePage =
  | 'home'
  | 'renor'
  | 'plans'
  | 'store'
  | 'product'
  | 'projects'
  | 'zero-to-prove'
  | 'company'
  | 'contact'
  | 'accessibility'
  | 'privacy'
  | 'terms'
  | 'not-found';

export interface ExploreSet {
  title: string;
  destinations: readonly DestinationId[];
}

/** The next steps that matter most from each page — never the page itself. */
export const EXPLORE: Record<ExplorePage, ExploreSet> = {
  home: {
    title: 'Everything FounderLab makes, one step away.',
    destinations: ['renor-app', 'plans', 'store', 'company'],
  },
  renor: {
    title: 'Try it, then see where it is going.',
    destinations: ['renor-app', 'plans', 'zero-to-prove', 'contact'],
  },
  plans: {
    title: 'Start free today, and follow what comes next.',
    destinations: ['renor-app', 'renor', 'zero-to-prove', 'contact'],
  },
  store: {
    title: 'More from FounderLab.',
    destinations: ['renor', 'projects', 'zero-to-prove', 'contact'],
  },
  product: {
    title: 'Before you go.',
    destinations: ['store', 'store-policies', 'contact', 'company'],
  },
  projects: {
    title: 'Go deeper into the work.',
    destinations: ['renor', 'store', 'zero-to-prove', 'company'],
  },
  'zero-to-prove': {
    title: 'See what the journey has built.',
    destinations: ['renor-app', 'renor', 'projects', 'contact'],
  },
  company: {
    title: 'See the work behind the words.',
    destinations: ['renor', 'projects', 'zero-to-prove', 'contact'],
  },
  contact: {
    title: 'Find what you need without waiting.',
    destinations: ['company', 'renor-app', 'accessibility', 'privacy'],
  },
  accessibility: {
    title: 'Related help and policies.',
    destinations: ['contact', 'privacy', 'terms', 'renor'],
  },
  privacy: {
    title: 'Related policies.',
    destinations: ['terms', 'store-policies', 'accessibility', 'contact'],
  },
  terms: {
    title: 'Related policies.',
    destinations: ['privacy', 'store-policies', 'accessibility', 'contact'],
  },
  'not-found': {
    title: 'Try one of these instead.',
    destinations: ['renor', 'store', 'projects', 'contact'],
  },
};
