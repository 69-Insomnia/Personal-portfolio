'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { engagementOptions } from '@/data/services';
import { profile } from '@/data/profile';
import { whatsappUrl } from '@/utils/links';

export function WorkWithMe() {
  const waHref = whatsappUrl(profile.whatsapp);

  return (
    <Section id="work-with-me" className="border-t border-line">
      <Container>
        <SectionHeading
          section="work-with-me"
          title="Looking for someone who can build and grow the whole thing?"
          description="Pick the starting point that fits. We can always expand the scope once the first goal is clear."
        />

        <Reveal delay={0.05}>
          <ul className="mt-12 border-t border-line">
            {engagementOptions.map((option) => (
              <li key={option.title} className="border-b border-line">
                <Link
                  href={option.href}
                  className="group grid items-baseline gap-2 py-6 md:grid-cols-12 md:gap-6 md:py-7"
                >
                  {/* The "01/02/03" ordinal that used to open this row is gone
                      — see `src/components/ui/SectionLabel` for why the design
                      dropped numbered labels. The list order carries it. */}
                  <span className="font-display text-2xl font-semibold transition-colors duration-200 group-hover:text-accent md:col-span-6 md:text-3xl">
                    {option.title}
                  </span>
                  <span className="leading-relaxed text-muted md:col-span-4">
                    {option.summary}
                  </span>
                  <span className="md:col-span-2 md:justify-self-end">
                    <ArrowUpRight
                      size={20}
                      aria-hidden
                      className="text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="/contact" size="lg" showArrow>
              Start a project
            </Button>
            {waHref ? (
              <Button
                href={waHref}
                variant="whatsapp"
                size="lg"
                ariaLabel={`Message me on WhatsApp at ${profile.whatsapp}`}
              >
                <WhatsAppIcon size={17} className="mr-2" aria-hidden />
                Message me on WhatsApp
              </Button>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
