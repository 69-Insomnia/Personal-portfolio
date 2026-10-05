import type { NavigationItem } from '@/types';

export const mainNavigation: NavigationItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  // Placed directly after Services: it is the page a visitor reaches for
  // immediately after deciding the service is relevant, and the one the
  // commercial query cluster ("SEO cost in Nepal") lands on.
  { label: 'Pricing', href: '/pricing' },
  { label: 'Insights', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const footerNavigation: NavigationItem[] = mainNavigation;
