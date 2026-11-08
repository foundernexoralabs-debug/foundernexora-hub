// @polsia:user-owned — the "Explore FounderLab" next-steps system.
//
// One registry of every place a visitor can go, and, for each page, the few
// destinations that are most useful from there. Pages render <ExploreBand page="…" />,
// so no page ends in a dead end and no two pages end with the same generic block.
// tests/unit/explore.test.ts checks every internal href resolves to a real page.
import { BILLING_PATH } from '@/lib/business/billing';
import { RENOR_APP_URL } from '@/lib/business/ecosystem';

export type DestinationId =
  | 'renor'
  | 'capabilities'
  | 'renor-app'
  | 'renor-beta'
  | 'launch-kit'
  | 'plans'
  | 'billing'
  | 'plugins'
  | 'plugin-buying'
  | 'projects'
  | 'zero-to-proof'
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
  | 'card'
  | 'folder'
  | 'route'
  | 'building'
  | 'mail'
  | 'accessibility'
  | 'lock'
  | 'file'
  | 'megaphone'
  | 'checklist';

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
  capabilities: {
    title: 'What Renor can do',
    text: 'Every capability, room by room, marked live, preview or planned. Checked against the app.',
    href: '/renor/capabilities',
    icon: 'checklist',
  },
  'renor-app': {
    title: 'Open Renor',
    text: 'Try the web preview in your browser. Free to start, no payment.',
    href: RENOR_APP_URL,
    external: true,
    icon: 'external',
  },
  'renor-beta': {
    title: 'Try new features first',
    text: 'Tell us what you want to build. The founder reads every request and replies.',
    href: '/renor#early-access',
    icon: 'mail',
  },
  'launch-kit': {
    title: 'Launch kit',
    text: 'Graphics, real screenshots, short descriptions and the 60-second film storyboard.',
    href: '/launch-kit',
    icon: 'megaphone',
  },
  plans: {
    title: 'Plans',
    text: 'Free, Pro, Plus and Max, with weekly AI credits. Free is open today; paid plans open when checkout goes live.',
    href: '/renor/plans',
    icon: 'layers',
  },
  billing: {
    title: 'Billing and refunds',
    text: 'Monthly billing, cancel any time, a 14-day refund window and no overage charges.',
    href: BILLING_PATH,
    icon: 'card',
  },
  plugins: {
    title: 'Plugin Store',
    text: 'Ready-to-use digital kits, starting with TradeLaunch for electricians. Opening soon.',
    href: '/plugins',
    icon: 'bag',
  },
  'plugin-buying': {
    title: 'How buying works',
    text: 'Plugin Store checkout, delivery and refunds: published before the first product is sold.',
    href: '/plugins#buying',
    icon: 'receipt',
  },
  projects: {
    title: 'Projects',
    text: 'Everything FounderLab is building, from live to researched, with honest status.',
    href: '/projects',
    icon: 'folder',
  },
  'zero-to-proof': {
    title: 'Zero to Proof',
    text: 'The build log: what was built, what broke and what was actually proven.',
    href: '/zero-to-proof',
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
    text: 'The terms for using this website, who sells Renor plans, and where product terms live.',
    href: '/terms',
    icon: 'file',
  },
};

export type ExplorePage =
  | 'home'
  | 'renor'
  | 'capabilities'
  | 'launch-kit'
  | 'storyboard'
  | 'plans'
  | 'billing'
  | 'plugins'
  | 'product'
  | 'projects'
  | 'zero-to-proof'
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
    destinations: ['renor-app', 'plans', 'plugins', 'company'],
  },
  renor: {
    title: 'Try it, then see where it is going.',
    destinations: ['renor-app', 'capabilities', 'plans', 'zero-to-proof'],
  },
  capabilities: {
    title: 'Seen enough? Try it, or help shape it.',
    destinations: ['renor-app', 'renor', 'plans', 'renor-beta'],
  },
  'launch-kit': {
    title: 'See Renor for yourself.',
    destinations: ['renor', 'renor-beta', 'renor-app', 'plugins'],
  },
  storyboard: {
    title: 'Everything else for the launch.',
    destinations: ['launch-kit', 'renor', 'renor-beta', 'zero-to-proof'],
  },
  plans: {
    title: 'Start free today, and know exactly how paying works.',
    destinations: ['renor-app', 'billing', 'renor', 'contact'],
  },
  billing: {
    title: 'Related policies.',
    destinations: ['plans', 'terms', 'privacy', 'contact'],
  },
  plugins: {
    title: 'More from FounderLab.',
    destinations: ['plans', 'renor', 'projects', 'contact'],
  },
  product: {
    title: 'Before you go.',
    destinations: ['plugins', 'plugin-buying', 'contact', 'company'],
  },
  projects: {
    title: 'Go deeper into the work.',
    destinations: ['renor', 'plugins', 'zero-to-proof', 'company'],
  },
  'zero-to-proof': {
    title: 'See what the journey has built.',
    destinations: ['renor-app', 'renor', 'projects', 'contact'],
  },
  company: {
    title: 'See the work behind the words.',
    destinations: ['renor', 'projects', 'zero-to-proof', 'contact'],
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
    destinations: ['terms', 'billing', 'accessibility', 'contact'],
  },
  terms: {
    title: 'Related policies.',
    destinations: ['privacy', 'billing', 'plugin-buying', 'contact'],
  },
  'not-found': {
    title: 'Try one of these instead.',
    destinations: ['renor', 'plugins', 'projects', 'contact'],
  },
};
