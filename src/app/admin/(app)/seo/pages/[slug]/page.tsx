import { notFound } from 'next/navigation';
import { StaticPageSeoForm } from '@/components/admin/StaticPageSeoForm';
import { getStaticPage } from '@/data/static-pages';

/**
 * SEO overrides for one static page.
 *
 * The slug is validated against `staticPages` rather than being trusted and
 * queried. That matters because the value reaches a database filter: a slug
 * that is not in the list has no row to load and no page to describe, and
 * rendering an editor for it would offer a save that writes a `seo_meta` row
 * for a URL that does not exist. `notFound()` is the honest answer.
 */
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = getStaticPage(slug);
  return { title: page ? `${page.label} SEO` : 'Not found' };
}

export default async function AdminStaticPageSeoPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getStaticPage(slug);

  if (!page) notFound();

  return <StaticPageSeoForm page={page} />;
}
