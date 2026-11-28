import { BlogCard } from '@/components/cards/BlogCard';
import { FeaturedPostCard as FeaturedPost } from '@/components/cards/FeaturedPostCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { blogPosts } from '@/data/blog';
import type { BlogPost } from '@/types';

export function Blog({ data }: { data?: BlogPost[] }) {
  const items = data ?? blogPosts;
  const [featured, ...rest] = items;
  return (
    <Section id="insights" className="border-t border-line">
      <Container>
        <SectionHeading
          section="insights"
          title="Notes from the work"
          description="Web development, search, advertising and ecommerce — written from projects that actually ran, not from a list of best practices."
          action={
            <Button href="/blog" variant="ghost" showArrow className="self-start">
              All articles
            </Button>
          }
        />

        {/* The newest article as a large featured card, then the rest as the
            existing compact rows. Phones show the featured post plus two. */}
        {featured ? (
          <Reveal className="mt-12">
            <FeaturedPost post={featured} />
          </Reveal>
        ) : null}

        {rest.length > 0 ? (
          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {rest.map((post, index) => (
              <Reveal
                key={post.slug}
                as="li"
                delay={index * 0.05}
                className={index >= 2 ? 'hidden md:block' : undefined}
              >
                <BlogCard post={post} />
              </Reveal>
            ))}
          </ul>
        ) : null}

        <div className="mt-10 flex justify-center">
          <Button href="/blog" variant="outline" showArrow>
            View all articles
          </Button>
        </div>
      </Container>
    </Section>
  );
}

