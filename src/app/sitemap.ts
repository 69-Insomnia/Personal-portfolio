import type { MetadataRoute } from 'next';
import { site } from '@/data/seo';
import { getPosts, getProjects, getSeoMap, getServices, seoKey } from '@/lib/content';
import { isoDate } from '@/utils/dates';

/**
 * The sitemap lists exactly what the site can actually serve *and* wants
 * indexed, and dates each entry from its real last edit.
 *
 * **Only live URLs.** This used to build its slug list by taking the union of
 * the slugs in `src/data` and the slugs in Supabase. Those two are not always
 * the same set: `readAll` filters on `published = true`, and every page reads
 * through the same filter, so a project unpublished in the database has no
 * page. The union listed it anyway, which submits a URL that returns 404 — the
 * thing Search Console reports as "Submitted URL not found". Reading through
 * the same functions the pages use removes the possibility, because there is
 * now one definition of what exists rather than two.
 *
 * **Only URLs that want indexing.** This is the part `seo_meta` made
 * necessary. Being live and being indexable stopped being the same question
 * the moment a page could carry `noindex`, and both exclusions below are cases
 * where listing a URL would contradict what the page itself says:
 *
 *  - `noindex` — submitting a URL that is marked noindex asks Google to index
 *    something the page has explicitly refused. Search Console reports it as
 *    an error, and it is the most common way a sitemap starts producing
 *    warnings rather than coverage.
 *  - A `canonical_override` pointing elsewhere — the page has told Google its
 *    real copy lives at another URL, usually on another domain. Listing this
 *    copy here asks for it to be treated as the original, which is the exact
 *    opposite of what its canonical says.
 *
 * **Real dates.** Every entry used to carry `lastModified: new Date()`, the
 * build time. That is not a lie a crawler can detect directly, but it makes the
 * field worthless: `lastmod` is only worth reading if it changes when the
 * content changes, and a value that is always "just now" teaches Google to
 * ignore it. Supabase maintains a real `updated_at` per row (the
 * `touch_updated_at` trigger in `supabase/combined.sql`), and blog posts carry
 * a publish date even on the static fallback.
 *
 * Where no real date exists the property is omitted rather than guessed, which
 * is the documented-correct thing to do — `lastmod` is optional, and an
 * inaccurate one is worse than an absent one. A project rendered from the
 * static fallback has no edit history at all; it carries only a four-digit
 * `year`, and expanding that to `YYYY-01-01` would assert a specific day the
 * data never claimed.
 *
 * `changeFrequency` and `priority` are left as they were. Google ignores both,
 * so changing them would be churn for its own sake.
 */

/**
 * The routes that have no database table, paired with the stable name
 * `seo_meta` uses to attach overrides to them (`entity_type = 'page'`).
 *
 * The slug is a name rather than a URL fragment because the home page has no
 * fragment to use — `''` would be a valid key and a poor one to read in the
 * admin panel. Exported so the admin's page list and this file cannot disagree
 * about what a static page is called.
 */
export const STATIC_PAGE_SLUGS = [
  { path: '', slug: 'home', priority: 1 },
  { path: '/about', slug: 'about', priority: 0.8 },
  { path: '/work', slug: 'work', priority: 0.8 },
  { path: '/services', slug: 'services', priority: 0.8 },
  // Higher than the other subpages: this one targets a commercial query
  // cluster ("SEO cost in Nepal") where the intent is late-stage and the
  // competitor set is thin, which makes it the most winnable non-service page
  // on the site. Priority is ignored by Google, so this is documentation of
  // intent rather than a ranking lever.
  { path: '/pricing', slug: 'pricing', priority: 0.9 },
  { path: '/blog', slug: 'blog', priority: 0.8 },
  { path: '/contact', slug: 'contact', priority: 0.8 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, services, seo] = await Promise.all([
    getProjects(),
    getPosts(),
    getServices(),
    getSeoMap(),
  ]);

  /**
   * True when this URL should stay out of the sitemap.
   *
   * A missing entry means "no `seo_meta` row", which is the normal state for a
   * page nobody has opened in the admin panel — and it has to resolve to
   * *included*, because that is what the site did before this table existed.
   * `getSeoMap` returns an empty map when the database is unreachable, so the
   * same fallback covers a backend outage: the sitemap degrades to listing
   * everything published, which is exactly the previous behaviour.
   */
  const excluded = (
    type: 'project' | 'post' | 'service' | 'page',
    slug: string,
  ): boolean => {
    const meta = seo.get(seoKey(type, slug));
    return Boolean(meta?.noindex || meta?.canonicalOverride);
  };

  /**
   * `lastModified` is left off entirely when there is no real date, rather than
   * set to `undefined` — a present-but-undefined key serialises differently
   * depending on the renderer.
   */
  const stamped = (lastModified: string | undefined): { lastModified?: string } =>
    lastModified ? { lastModified } : {};

  const staticRoutes = STATIC_PAGE_SLUGS.filter(
    ({ slug }) => !excluded('page', slug),
  ).map(({ path, priority }) => ({
    url: `${site.url}${path}`,
    // No date: these are code-managed, so the honest answer is that the data
    // does not record one.
    changeFrequency: 'monthly' as const,
    priority,
  }));

  const projectRoutes = projects
    .filter((project) => !excluded('project', project.slug))
    .map((project) => ({
      url: `${site.url}/work/${project.slug}`,
      ...stamped(isoDate(project.updatedAt)),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  const serviceRoutes = services
    .filter((service) => !excluded('service', service.slug))
    .map((service) => ({
      url: `${site.url}/services/${service.slug}`,
      ...stamped(isoDate(service.updatedAt)),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  const postRoutes = posts
    .filter((post) => !excluded('post', post.slug))
    .map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      // An edited post dates from its edit; an untouched one from publication.
      ...stamped(isoDate(post.updatedAt) ?? isoDate(post.date)),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

  return [...staticRoutes, ...projectRoutes, ...serviceRoutes, ...postRoutes];
}
