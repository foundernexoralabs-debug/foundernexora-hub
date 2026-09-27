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
  { label: 'Home', href: '/', group: 'primary', order: 0 },
  { label: 'Renor', href: '/#renor', group: 'primary', order: 1 },
  { label: 'Access', href: '/#access', group: 'primary', order: 2 },
  { label: 'Company system', href: '/#system', group: 'primary', order: 3 },
  { label: 'Product status', href: '/#renor', group: 'secondary', order: 0 },
];
