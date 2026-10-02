'use client';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { RevealText } from '@/components/ui/RevealText';
import { SectionLabel } from '@/components/ui/SectionLabel';

/**
 * The home page's short "about" beat.
 *
 * Deliberately brief — it is a signpost toward /about, not the profile itself.
 * The full first-person narrative and the sidebar cards live in
 * `src/sections/Profile`, which is a different section with a different job.
 */
export function Introduction() {
  return (
    <Section id="about" className="border-t border-line">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionLabel section="about" />
          </div>

          <div className="lg:col-span-8">
            <RevealText
              as="h2"
              text="I Build the Site. Then I Work Out Why It Isn't Converting."
              className="text-h2"
            />

            <Reveal delay={0.1}>
              <div className="mt-8 grid max-w-3xl gap-5">
                <p className="text-lead text-muted">
                  I&apos;m a web developer with React and Next.js on one side and search and
                  paid media on the other. Most projects need both, and most teams split them
                  between two people.
                </p>
                <p className="text-lead text-muted">
                  The work usually starts with the same question: where are people dropping
                  off? A page that takes four seconds to load. A query that lands on a page
                  which doesn&apos;t answer it. An ad pointing at a category when someone
                  wanted one product. Finding it is usually cheaper than the thing everyone
                  assumed was the problem.
                </p>
              </div>

              <div className="mt-9">
                <Button href="/about" variant="outline" showArrow>
                  More About Me
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
