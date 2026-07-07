// @polsia:user-owned — app navigation

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
  { label: 'Home',         href: '/',            group: 'primary',   order: 0 },
  { label: 'Apps',         href: '/#apps',       group: 'primary',   order: 1 },
  { label: 'FounderLab AI',href: '/#founderlab', group: 'primary',   order: 2 },
  { label: 'Try FounderLab AI', href: 'https://founderlab-ai0-1.vercel.app', group: 'secondary', order: 0 },
];
