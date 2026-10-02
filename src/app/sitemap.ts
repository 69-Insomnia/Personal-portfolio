import type { MetadataRoute } from 'next';
import { site } from '@/data/seo';
import { projects } from '@/data/projects';
import { blogPosts } from '@/data/blog';
import { services } from '@/data/services';
import { getContentSlugs } from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/about', '/work', '/services', '/blog', '/contact'].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const live = await getContentSlugs();
  const union = (statics: string[], liveList: string[]) => [...new Set([...statics, ...liveList])];

  const projectRoutes = union(
    projects.map((p) => p.slug),
    live.work,
  ).map((slug) => ({
    url: `${site.url}/work/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const serviceRoutes = union(
    services.map((s) => s.slug),
    live.services,
  ).map((slug) => ({
    url: `${site.url}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const postRoutes = union(
    blogPosts.map((p) => p.slug),
    live.blog,
  ).map((slug) => ({
    url: `${site.url}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...projectRoutes, ...serviceRoutes, ...postRoutes];
}
