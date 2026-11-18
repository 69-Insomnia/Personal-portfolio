import type { NavigationItem } from '@/types';

/**
 * Every destination the site's link lists render, in display order.
 *
 * The header takes this list with two entries filtered out (`mainNavigation`
 * below); the footer takes it as-is.
 *
 * `title` is the link's `title` attribute — invisible copy that describes the
 * destination for a tooltip, a text-only browser and a crawler reading anchor
 * context. It never renders as text, so the labels below are untouched.
 */
const siteLinks: NavigationItem[] = [
  {
    label: 'About',
    href: '/about',
    title: 'About Dipendra Guragain, ecommerce growth expert in Kathmandu',
  },
  {
    label: 'Work',
    href: '/work',
    title: 'Ecommerce growth, SEO and web development projects in Nepal',
  },
  {
    label: 'Services',
    href: '/services',
    title: 'Web development, SEO, ecommerce growth and ads services in Nepal',
  },
  /**
   * The money page, given its own slot rather than left as the fifth card
   * under Services.
   *
   * A link from the navigation appears on every page of the site, so this one
   * entry is the single strongest internal signal pointing at
   * `/services/ecommerce-growth` — which is the page that has to rank for the
   * target query. Burying it two clicks down was leaving that on the table.
   *
   * Hidden from the header at the owner's request (2026-11-16); the footer
   * link below is what carries that signal now.
   */
  {
    label: 'Ecommerce Growth',
    href: '/services/ecommerce-growth',
    title: 'Ecommerce growth services in Kathmandu, Nepal',
  },
  // Placed after the money page, not before: it is the page a visitor reaches
  // for immediately after deciding the service is relevant, and the one the
  // commercial query cluster ("SEO cost in Nepal") lands on. Also hidden from
  // the header at the owner's request (2026-11-16), kept in the footer.
  {
    label: 'Pricing',
    href: '/pricing',
    title: 'Pricing for SEO, Google Ads, Meta Ads and web development in Nepal',
  },
  {
    label: 'Blogs',
    href: '/blog',
    title: 'Articles on SEO, ecommerce growth and web development',
  },
  {
    label: 'Contact',
    href: '/contact',
    title: 'Contact Dipendra Guragain in Kathmandu, Nepal',
  },
];

/**
 * The header and the mobile menu.
 *
 * `Ecommerce Growth` and `Pricing` are hidden here at the owner's request —
 * filtered rather than deleted so both pages keep a link on every page
 * through the footer. Restoring the two header slots means removing their
 * hrefs from this filter.
 */
export const mainNavigation: NavigationItem[] = siteLinks.filter(
  (item) => item.href !== '/services/ecommerce-growth' && item.href !== '/pricing',
);

/** The footer keeps the full list, including the two pages the header hides. */
export const footerNavigation: NavigationItem[] = siteLinks;
