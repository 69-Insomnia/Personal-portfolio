/**
 * The routes that have no database table of their own.
 *
 * These seven pages are code — their content lives in the route files under
 * `src/app/` and in `src/data/*` — so there is no row to attach SEO overrides
 * to. `seo_meta` attaches them by `entity_type = 'page'` and a stable name
 * instead, and `GET /admin/seo/pages` edits those rows.
 *
 * ## Why this list lives here and not in `sitemap.ts`
 *
 * It used to be defined in `src/app/sitemap.ts` and exported from there, with a
 * comment saying it was exported "so the admin's page list and this file cannot
 * disagree about what a static page is called." The admin never used it,
 * because importing a constant out of a route file into a component is a
 * layering inversion — `sitemap.ts` is a Next.js metadata route, not a data
 * module, and reaching into it for a list of pages means the admin panel
 * depends on how the sitemap happens to be built. It moved here instead, where
 * both can import it without either depending on the other.
 *
 * ## Why `slug` is a name rather than a URL fragment
 *
 * The home page has no fragment to use — `''` would be a valid key and a poor
 * one to read in a database column or an admin URL. So each page carries a
 * stable short name, and `seo_meta.entity_slug` holds that. `path` is the URL
 * the page actually serves at, which is what the sitemap and the admin's
 * canonical preview need.
 *
 * The names are load-bearing: they are what the seeded `seo_meta` rows in
 * `supabase/migrations/*.sql` already use, so renaming one orphans the row
 * rather than migrating it.
 */

export interface StaticPage {
  /** The URL this page serves at. `''` is the home page. */
  path: string;
  /** Stable `seo_meta.entity_slug` key. Never a URL fragment — see above. */
  slug: string;
  /** Human label, for the admin list and the SEO panel's header. */
  label: string;
  /**
   * Sitemap priority.
   *
   * Ignored by Google, kept as documentation of intent. `/pricing` is higher
   * than the other subpages because it targets a commercial query cluster
   * ("SEO cost in Nepal") where the intent is late-stage and the competitor
   * set is thin, which makes it the most winnable non-service page on the site.
   */
  priority: number;
}

export const staticPages: StaticPage[] = [
  { path: '', slug: 'home', label: 'Home', priority: 1 },
  { path: '/about', slug: 'about', label: 'About', priority: 0.8 },
  { path: '/work', slug: 'work', label: 'Work', priority: 0.8 },
  { path: '/services', slug: 'services', label: 'Services', priority: 0.8 },
  { path: '/pricing', slug: 'pricing', label: 'Pricing', priority: 0.9 },
  { path: '/blog', slug: 'blog', label: 'Blog', priority: 0.8 },
  { path: '/contact', slug: 'contact', label: 'Contact', priority: 0.8 },
];

export function getStaticPage(slug: string): StaticPage | undefined {
  return staticPages.find((page) => page.slug === slug);
}
