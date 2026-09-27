// @polsia:user-owned — app navigation

import { RENOR_APP_URL } from '@/lib/business/company-links';

export type NavGroup = 'primary' | 'secondary' | 'footer';

export interface NavItem {
  label: string;
  href: string;
  group: NavGroup;
  menu?: string;
  requiresAuth?: boolean;
  order?: number;
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/', group: 'primary', order: 0 },
  { label: 'Renor', href: '/#renor', group: 'primary', order: 1 },
  { label: 'Access', href: '/#access', group: 'primary', order: 2 },
  { label: 'Company system', href: '/#system', group: 'primary', order: 3 },
  { label: 'Open Renor', href: RENOR_APP_URL, group: 'secondary', order: 0 },
];
