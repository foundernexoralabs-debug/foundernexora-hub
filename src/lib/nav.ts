// @polsia:user-owned — FounderLab navigation. One list drives the top bar, the footer and the sitemap.
import { RENOR_APP_URL } from '@/lib/business/ecosystem';

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
  // Top bar: five slots — Renor ⌄, Store, Projects, Zero to Prove, Company ⌄.
  { label: 'Renor AI', href: '/renor', group: 'primary', menu: 'Renor', order: 1 },
  { label: 'Plans', href: '/renor/plans', group: 'primary', menu: 'Renor', order: 2 },
  { label: 'Store', href: '/store', group: 'primary', order: 3 },
  { label: 'Projects', href: '/projects', group: 'primary', order: 4 },
  { label: 'Zero to Prove', href: '/zero-to-prove', group: 'primary', order: 5 },
  { label: 'About', href: '/company', group: 'primary', menu: 'Company', order: 6 },
  { label: 'Contact', href: '/contact', group: 'primary', menu: 'Company', order: 7 },
  { label: 'Open Renor', href: RENOR_APP_URL, group: 'secondary', order: 0 },
  // Footer columns: every part of the company, on every page.
  { label: 'Renor AI', href: '/renor', group: 'footer', menu: 'Renor', order: 0 },
  { label: 'Plans', href: '/renor/plans', group: 'footer', menu: 'Renor', order: 1 },
  { label: 'Open the app', href: RENOR_APP_URL, group: 'footer', menu: 'Renor', order: 2 },
  { label: 'Renor Labs Store', href: '/store', group: 'footer', menu: 'Store', order: 3 },
  {
    label: 'TradeLaunch kits',
    href: '/store#business-kits',
    group: 'footer',
    menu: 'Store',
    order: 4,
  },
  { label: 'Store policies', href: '/store#policies', group: 'footer', menu: 'Store', order: 5 },
  { label: 'About', href: '/company', group: 'footer', menu: 'Company', order: 6 },
  { label: 'Projects', href: '/projects', group: 'footer', menu: 'Company', order: 7 },
  { label: 'Zero to Prove', href: '/zero-to-prove', group: 'footer', menu: 'Company', order: 8 },
  { label: 'Contact', href: '/contact', group: 'footer', menu: 'Company', order: 9 },
  { label: 'Privacy', href: '/privacy', group: 'footer', menu: 'Legal', order: 10 },
  { label: 'Terms', href: '/terms', group: 'footer', menu: 'Legal', order: 11 },
  { label: 'Accessibility', href: '/accessibility', group: 'footer', menu: 'Legal', order: 12 },
];
