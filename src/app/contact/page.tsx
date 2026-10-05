import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { RevealText } from '@/components/ui/RevealText';
import { Section } from '@/components/ui/Section';
import { Contact } from '@/sections/Contact';
import { FAQ } from '@/sections/FAQ';
import { profile } from '@/data/profile';
import { buildMetadata } from '@/utils/metadata';
import { contactSEO } from '@/data/seo';

export default function ContactPage() {
  return (
    <>
      <Section className="border-b border-line pb-14 pt-32 md:pb-16 md:pt-40">
        <Container>
          {/* The shared component, not a hand-rolled `<nav>`. The local one
              looked identical but carried no `BreadcrumbList`, so this was the
              only page on the site with a visible trail and no markup to match
              it — the exact mismatch in the other direction from the detail
              routes, which had the markup and nothing to see. */}
          <Breadcrumb
            items={[
              { name: 'Home', path: '/' },
              { name: 'Contact', path: '/contact' },
            ]}
          />

          <RevealText
            as="h1"
            text="Tell me what you're trying to build."
            accentLast
            className="mt-6 max-w-3xl text-display"
          />

          <Reveal delay={0.15}>
            <p className="mt-6 max-w-2xl text-lead text-muted">
              A website, better search visibility, paid campaigns or an ecommerce system. Start
              wherever you are.
            </p>
            <p className="mt-4 flex items-center gap-2.5 text-sm text-muted">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              {profile.availabilityText}
            </p>
          </Reveal>
        </Container>
      </Section>

      <Contact />
      <FAQ />
    </>
  );
}

export const metadata = buildMetadata(contactSEO);
