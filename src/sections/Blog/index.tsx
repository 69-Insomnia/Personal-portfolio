import { BlogCard } from '@/components/cards/BlogCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { blogPosts } from '@/data/blog';
import type { BlogPost } from '@/types';

export function Blog({ data }: { data?: BlogPost[] }) {
  const items = data ?? blogPosts;
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

        {/*
          A stack of full-width rows, not a scroll row of cards.

          This band used to swipe three cards horizontally on every viewport —
          the same shape the project grid had a section earlier. The articles
          are now a plain vertical list of the horizontal BlogCard, full width,
          which reads as a contents page rather than a gallery and gives the
          homepage one more distinct section composition. On mobile the rows
          simply stack, so the swipe affordance (and its hidden-scrollbar
          styling) is no longer needed here at all.
        */}
        <ul className="mt-12 flex flex-col gap-4">
          {items.map((post, index) => (
            <Reveal key={post.slug} as="li" delay={index * 0.06}>
              <BlogCard post={post} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
