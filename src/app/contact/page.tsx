import Link from 'next/link';
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
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted">
            <Link href="/" className="py-1.5 transition-colors duration-300 hover:text-accent">
              Home
            </Link>
            <span aria-hidden className="text-faint">
              /
            </span>
            <span aria-current="page" className="text-ink">
              Contact
            </span>
          </nav>

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
