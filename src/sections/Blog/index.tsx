'use client';

import { BlogCard } from '@/components/cards/BlogCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ScrollRow, scrollRowItemClassName } from '@/components/ui/ScrollRow';
import { blogPosts } from '@/data/blog';
import type { BlogPost } from '@/types';
import { cn } from '@/utils/cn';

export function Blog({ data }: { data?: BlogPost[] }) {
  const items = data ?? blogPosts;
  return (
    <Section id="insights" className="border-t border-line">
      <Container>
        <SectionHeading
          section="insights"
          title="Things I'm Learning, Building & Sharing"
          description="Notes on web development, search, advertising and ecommerce, written from real project work."
          action={
            <Button href="/blog" variant="outline" showArrow className="self-start">
              All Insights
            </Button>
          }
        />

        <ScrollRow columns={3} className="mt-12 md:gap-x-4 md:gap-y-10">
          {items.map((post, index) => (
            <Reveal
              key={post.slug}
              delay={index * 0.07}
              className={cn('h-full', scrollRowItemClassName)}
            >
              <BlogCard post={post} />
            </Reveal>
          ))}
        </ScrollRow>
      </Container>
    </Section>
  );
}
