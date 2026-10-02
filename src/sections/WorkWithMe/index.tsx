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

export function WorkWithMe() {
  return (
    <Section id="work-with-me" className="border-t border-line">
      <Container>
        <SectionHeading
          section="work-with-me"
          title="Looking for Someone Who Can Build and Grow Your Digital Presence?"
          description="Pick the starting point that fits. We can always expand the scope once the first goal is clear."
        />

        <Reveal delay={0.05}>
          <ul className="mt-12 border-t border-line">
            {engagementOptions.map((option, index) => (
              <li key={option.title} className="border-b border-line">
                <Link
                  href={option.href}
                  className="group grid items-baseline gap-2 py-6 md:grid-cols-12 md:gap-6 md:py-7"
                >
                  <span className="text-label font-semibold text-accent md:col-span-1">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-2xl font-medium tracking-tight transition-colors duration-300 group-hover:text-accent md:col-span-5 md:text-3xl">
                    {option.title}
                  </span>
                  <span className="text-sm leading-relaxed text-muted md:col-span-4">
                    {option.summary}
                  </span>
                  <span className="md:col-span-2 md:justify-self-end">
                    <ArrowUpRight
                      size={20}
                      aria-hidden
                      className="text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
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
              Start a Conversation
            </Button>
            {profile.whatsapp ? (
              <Button
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                variant="whatsapp"
                size="lg"
                ariaLabel={`Chat on WhatsApp at ${profile.whatsapp}`}
              >
                <WhatsAppIcon size={17} className="mr-2" />
                Chat on WhatsApp
              </Button>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
