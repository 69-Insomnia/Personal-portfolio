import type { MetadataRoute } from 'next';
import { site } from '@/data/seo';
import { getPosts, getProjects, getServices } from '@/lib/content';
import { isoDate } from '@/utils/dates';

/**
 * The sitemap lists exactly what the site can actually serve, and dates each
 * entry from its real last edit.
 *
 * Both of those are corrections.
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
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts, services] = await Promise.all([
    getProjects(),
    getPosts(),
    getServices(),
  ]);

  /**
   * `lastModified` is left off entirely when there is no real date, rather than
   * set to `undefined` — a present-but-undefined key serialises differently
   * depending on the renderer.
   */
  const stamped = (lastModified: string | undefined): { lastModified?: string } =>
    lastModified ? { lastModified } : {};

  const staticRoutes = [
    { path: '', priority: 1 },
    { path: '/about', priority: 0.8 },
    { path: '/work', priority: 0.8 },
    { path: '/services', priority: 0.8 },
    { path: '/blog', priority: 0.8 },
    { path: '/contact', priority: 0.8 },
  ].map(({ path, priority }) => ({
    url: `${site.url}${path}`,
    // No date: these are code-managed, so the honest answer is that the data
    // does not record one.
    changeFrequency: 'monthly' as const,
    priority,
  }));

  const projectRoutes = projects.map((project) => ({
    url: `${site.url}/work/${project.slug}`,
    ...stamped(isoDate(project.updatedAt)),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const serviceRoutes = services.map((service) => ({
    url: `${site.url}/services/${service.slug}`,
    ...stamped(isoDate(service.updatedAt)),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const postRoutes = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    // An edited post dates from its edit; an untouched one from publication.
    ...stamped(isoDate(post.updatedAt) ?? isoDate(post.date)),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...projectRoutes, ...serviceRoutes, ...postRoutes];
}
