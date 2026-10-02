import type { NavigationItem } from '@/types';

export const mainNavigation: NavigationItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'Insights', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const footerNavigation: NavigationItem[] = mainNavigation;
