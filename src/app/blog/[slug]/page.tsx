import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Clock } from 'lucide-react';
import { BlogCard } from '@/components/cards/BlogCard';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { JsonLd } from '@/components/common/JsonLd';
import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { RevealText } from '@/components/ui/RevealText';
import { Section } from '@/components/ui/Section';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { blogPosts, getPostBySlug } from '@/data/blog';
import { getPost, getPosts } from '@/lib/content';
import { articleNode, breadcrumbNode } from '@/lib/structured-data';
import { postSEO } from '@/data/seo';
import { buildMetadata } from '@/utils/metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const live = await getPosts();
  const slugs = new Set([...blogPosts.map((p) => p.slug), ...live.map((p) => p.slug)]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getPost(slug)) ?? getPostBySlug(slug);
  if (!post) {
    return { title: 'Article Not Found' };
  }
  return buildMetadata(postSEO(post));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = (await getPost(slug)) ?? getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const all = await getPosts();
  const related = all
    .filter((item) => item.slug !== post.slug && item.category === post.category)
    .concat(all.filter((item) => item.slug !== post.slug && item.category !== post.category))
    .slice(0, 2);

  return (
    <article>
      <JsonLd
        graph={[
          articleNode(post),
          breadcrumbNode([
            { name: 'Home', path: '/' },
            { name: 'Insights', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <PageHeader
        label={post.category}
        badge={post.isPlaceholder ? <PlaceholderBadge /> : null}
        title={post.title}
        meta={
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            <span>{post.date}</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} aria-hidden />
              {post.readingTime}
            </span>
          </div>
        }
        description={post.excerpt}
      />

      <Container className="mt-10 md:mt-14">
        <ImageLightbox
          src={post.image}
          alt={
            post.isPlaceholder
              ? `Placeholder image for article: ${post.title}`
              : `${post.title}: ${post.excerpt}`
          }
          sizes="(max-width: 1200px) 100vw, 1100px"
        />
      </Container>

      <Container className="py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionLabel label="Article" />
          </div>
          <div className="flex flex-col gap-6 lg:col-span-8 lg:col-start-5">
            {(post.content ?? []).map((paragraph, index) => (
              <Reveal key={index} delay={index * 0.05}>
                <p className="max-w-2xl leading-relaxed text-muted">{paragraph}</p>
              </Reveal>
            ))}

            {post.tags && post.tags.length > 0 ? (
              <Reveal>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-6">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-line px-3 py-1 text-label font-medium uppercase text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Reveal>
            ) : null}
          </div>
        </div>
      </Container>

      {related.length > 0 ? (
        <Section className="border-t border-line">
          <Container>
            <SectionLabel label="Keep Reading" />
            <RevealText as="h2" text="Related Articles" className="mt-5 text-h3" />
            <div className="mt-8 grid gap-x-4 gap-y-10 md:grid-cols-2">
              {related.map((item) => (
                <BlogCard key={item.slug} post={item} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section className="border-t border-line bg-surface">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-xl text-h3">Want to talk about a similar project?</h2>
          <Button href="/contact" size="lg" showArrow>
            Start a Conversation
          </Button>
        </Container>
      </Section>
    </article>
  );
}
