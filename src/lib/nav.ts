// @polsia:user-owned — Renor website navigation. One list drives the top bar, the footer and the sitemap.
import { RENOR_APP_URL, RENOR_LABS_STORE_URL } from '@/lib/business/ecosystem';

/** The app's public guides (no sign-in needed). Checked 8 November 2026. */
export const RENOR_GUIDES_URL = `${RENOR_APP_URL}/start`;

export type NavGroup = 'primary' | 'secondary' | 'footer';

export interface NavItem {
  label: string;
  href: string;
  group: NavGroup;
  /** Primary: collapses items into one dropdown. Footer: the column heading. */
  menu?: string;
  requiresAuth?: boolean;
  order?: number;
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/', group: 'primary', order: 0 },
  // Top bar: Renor ⌄, Vision, Plugins ⌄, Company ⌄. Everything else is one click away in a menu.
  { label: 'Renor AI', href: '/renor', group: 'primary', menu: 'Renor', order: 1 },
  {
    label: 'Capabilities',
    href: '/renor/capabilities',
    group: 'primary',
    menu: 'Renor',
    order: 1.5,
  },
  { label: 'Pricing', href: '/renor/plans', group: 'primary', menu: 'Renor', order: 2 },
  { label: 'Guides', href: RENOR_GUIDES_URL, group: 'primary', menu: 'Renor', order: 2.5 },
  { label: 'Vision', href: '/vision', group: 'primary', order: 2.8 },
  { label: 'Plugin Store', href: '/plugins', group: 'primary', menu: 'Plugins', order: 3 },
  {
    label: 'Shop on Renor Labs',
    href: RENOR_LABS_STORE_URL,
    group: 'primary',
    menu: 'Plugins',
    order: 3.5,
  },
  { label: 'About', href: '/company', group: 'primary', menu: 'Company', order: 6 },
  { label: 'Co-Create London', href: '/cocreate', group: 'primary', menu: 'Company', order: 6.2 },
  { label: 'Press kit', href: '/launch-kit', group: 'primary', menu: 'Company', order: 6.4 },
  { label: 'Zero to Proof', href: '/zero-to-proof', group: 'primary', menu: 'Company', order: 6.6 },
  { label: 'Projects', href: '/projects', group: 'primary', menu: 'Company', order: 6.8 },
  { label: 'Contact', href: '/contact', group: 'primary', menu: 'Company', order: 7 },
  { label: 'Open Renor', href: RENOR_APP_URL, group: 'secondary', order: 0 },
  // Footer columns: every part of the company, on every page.
  { label: 'Renor AI', href: '/renor', group: 'footer', menu: 'Renor', order: 0 },
  {
    label: 'Capabilities',
    href: '/renor/capabilities',
    group: 'footer',
    menu: 'Renor',
    order: 0.5,
  },
  { label: 'Pricing', href: '/renor/plans', group: 'footer', menu: 'Renor', order: 1 },
  { label: 'Vision', href: '/vision', group: 'footer', menu: 'Renor', order: 1.2 },
  { label: 'Guides', href: RENOR_GUIDES_URL, group: 'footer', menu: 'Renor', order: 1.4 },
  { label: 'Open the app', href: RENOR_APP_URL, group: 'footer', menu: 'Renor', order: 2 },
  { label: 'Plugin Store', href: '/plugins', group: 'footer', menu: 'Plugin Store', order: 3 },
  {
    label: 'Electrician Business Kit',
    href: '/plugins/tradelaunch-electrician-business-kit',
    group: 'footer',
    menu: 'Plugin Store',
    order: 4,
  },
  {
    label: 'How buying works',
    href: '/plugins#buying',
    group: 'footer',
    menu: 'Plugin Store',
    order: 5,
  },
  {
    label: 'Renor Labs shop',
    href: RENOR_LABS_STORE_URL,
    group: 'footer',
    menu: 'Plugin Store',
    order: 5.5,
  },
  { label: 'About', href: '/company', group: 'footer', menu: 'Company', order: 6 },
  { label: 'Co-Create London', href: '/cocreate', group: 'footer', menu: 'Company', order: 6.3 },
  { label: 'Press kit', href: '/launch-kit', group: 'footer', menu: 'Company', order: 6.5 },
  {
    label: 'Film storyboard',
    href: '/launch-kit/storyboard',
    group: 'footer',
    menu: 'Company',
    order: 6.7,
  },
  { label: 'Projects', href: '/projects', group: 'footer', menu: 'Company', order: 7 },
  { label: 'Zero to Proof', href: '/zero-to-proof', group: 'footer', menu: 'Company', order: 8 },
  { label: 'Contact', href: '/contact', group: 'footer', menu: 'Company', order: 9 },
  { label: 'Privacy', href: '/privacy', group: 'footer', menu: 'Legal', order: 10 },
  { label: 'Terms', href: '/terms', group: 'footer', menu: 'Legal', order: 11 },
  {
    label: 'Billing and refunds',
    href: '/renor/billing',
    group: 'footer',
    menu: 'Legal',
    order: 11.5,
  },
  { label: 'Accessibility', href: '/accessibility', group: 'footer', menu: 'Legal', order: 12 },
];
