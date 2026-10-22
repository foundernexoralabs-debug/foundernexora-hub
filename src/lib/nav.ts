// @polsia:user-owned — FounderLab navigation. One list drives the top bar, the footer and the sitemap.
import { RENOR_APP_URL, RENOR_LABS_STORE_URL } from '@/lib/business/ecosystem';

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
  // Top bar: five slots — Renor ⌄, Plugins ⌄, Projects, Zero to Prove, Company ⌄.
  { label: 'Renor AI', href: '/renor', group: 'primary', menu: 'Renor', order: 1 },
  { label: 'Plans', href: '/renor/plans', group: 'primary', menu: 'Renor', order: 2 },
  { label: 'Plugin Store', href: '/plugins', group: 'primary', menu: 'Plugins', order: 3 },
  {
    label: 'Shop on Renor Labs',
    href: RENOR_LABS_STORE_URL,
    group: 'primary',
    menu: 'Plugins',
    order: 3.5,
  },
  { label: 'Projects', href: '/projects', group: 'primary', order: 4 },
  { label: 'Zero to Prove', href: '/zero-to-prove', group: 'primary', order: 5 },
  { label: 'About', href: '/company', group: 'primary', menu: 'Company', order: 6 },
  { label: 'Contact', href: '/contact', group: 'primary', menu: 'Company', order: 7 },
  { label: 'Open Renor', href: RENOR_APP_URL, group: 'secondary', order: 0 },
  // Footer columns: every part of the company, on every page.
  { label: 'Renor AI', href: '/renor', group: 'footer', menu: 'Renor', order: 0 },
  { label: 'Plans', href: '/renor/plans', group: 'footer', menu: 'Renor', order: 1 },
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
  { label: 'Projects', href: '/projects', group: 'footer', menu: 'Company', order: 7 },
  { label: 'Zero to Prove', href: '/zero-to-prove', group: 'footer', menu: 'Company', order: 8 },
  { label: 'Contact', href: '/contact', group: 'footer', menu: 'Company', order: 9 },
  { label: 'Privacy', href: '/privacy', group: 'footer', menu: 'Legal', order: 10 },
  { label: 'Terms', href: '/terms', group: 'footer', menu: 'Legal', order: 11 },
  { label: 'Accessibility', href: '/accessibility', group: 'footer', menu: 'Legal', order: 12 },
];
