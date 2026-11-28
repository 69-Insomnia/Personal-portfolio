import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/PageHeader';
import { FeaturedPostCard } from '@/components/cards/FeaturedPostCard';
import { BlogIndex } from '@/components/common/BlogIndex';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { blogPosts } from '@/data/blog';
import { getPosts, getSeo, getSiteSettings } from '@/lib/content';
import { buildMetadata } from '@/utils/metadata';
import { blogSEO, withSeoMeta } from '@/data/seo';
import { JsonLd } from '@/components/common/JsonLd';
import { collectionPageNode } from '@/lib/structured-data';

export default async function BlogPage() {
  const posts = await getPosts();
  const shown = posts.length > 0 ? posts : blogPosts;
  const [featured, ...rest] = shown;
  return (
    <>
      <JsonLd
        graph={[
          collectionPageNode({
            path: '/blog',
            name: 'Articles on SEO, ecommerce and web development',
            description:
              'Notes on web development, search, advertising and ecommerce in Nepal, written from real project work.',
            items: shown.map((post) => ({ url: `/blog/${post.slug}`, name: post.title })),
          }),
        ]}
      />
      <PageHeader
        label="Insights"
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Blogs', path: '/blog' },
        ]}
        title="Things I'm Learning, Building & Sharing"
        description="Notes on web development, search, advertising and ecommerce, written from real project work."
      />
      <Section>
        <Container>
          {featured ? (
            <Reveal>
              <h2 className="mb-5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-faint">
                Latest article
              </h2>
              <FeaturedPostCard post={featured} />
            </Reveal>
          ) : null}

          {rest.length > 0 ? (
            <div className="mt-16 md:mt-20">
              <h2 className="mb-6 font-display text-h3 text-ink">All articles</h2>
              <BlogIndex posts={rest} />
            </div>
          ) : null}
        </Container>
      </Section>
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeo('page', 'blog');
  return buildMetadata(withSeoMeta(blogSEO, meta), await getSiteSettings());
}
