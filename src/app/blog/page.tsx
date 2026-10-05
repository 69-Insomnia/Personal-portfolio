import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/PageHeader';
import { BlogCard } from '@/components/cards/BlogCard';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { blogPosts } from '@/data/blog';
import { getPosts, getSeo, getSiteSettings } from '@/lib/content';
import { buildMetadata } from '@/utils/metadata';
import { blogSEO, withSeoMeta } from '@/data/seo';

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHeader
        label="Insights"
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/blog' },
        ]}
        title="Things I'm Learning, Building & Sharing"
        description="Notes on web development, search, advertising and ecommerce, written from real project work."
      />
      <Section>
        <Container>
          <h2 className="sr-only">Latest articles</h2>
          <div className="grid gap-x-4 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {(posts.length > 0 ? posts : blogPosts).map((post, index) => (
              <Reveal key={post.slug} delay={index * 0.07} className="h-full">
                <BlogCard post={post} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeo('page', 'blog');
  return buildMetadata(withSeoMeta(blogSEO, meta), await getSiteSettings());
}
