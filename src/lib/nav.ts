// @polsia:user-owned — Company-first navigation; official preview link verified with Vercel.
import { RENOR_WEB_PREVIEW_URL } from '@/lib/business/renor-links';

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
  { label: 'Company', href: '/#company', group: 'primary', order: 1 },
  { label: 'Projects', href: '/#projects', group: 'primary', order: 2 },
  { label: 'Renor', href: '/renor', group: 'primary', order: 3 },
  { label: 'Progress', href: '/#updates', group: 'footer', order: 0 },
  { label: 'Open Renor preview', href: RENOR_WEB_PREVIEW_URL, group: 'secondary', order: 0 },
];
