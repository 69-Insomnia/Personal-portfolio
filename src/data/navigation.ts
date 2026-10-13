import type { NavigationItem } from '@/types';

export const mainNavigation: NavigationItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  /**
   * The money page, given its own nav slot rather than left as the fifth card
   * under Services.
   *
   * A link from the navigation appears on every page of the site, so this one
   * entry is the single strongest internal signal pointing at
   * `/services/ecommerce-growth` — which is the page that has to rank for the
   * target query. Burying it two clicks down was leaving that on the table.
   */
  { label: 'Ecommerce Growth', href: '/services/ecommerce-growth' },
  // Placed after the money page, not before: it is the page a visitor reaches
  // for immediately after deciding the service is relevant, and the one the
  // commercial query cluster ("SEO cost in Nepal") lands on.
  { label: 'Pricing', href: '/pricing' },
  { label: 'Insights', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const footerNavigation: NavigationItem[] = mainNavigation;
