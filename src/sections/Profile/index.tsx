'use client';

import Image from 'next/image';
import { Mail } from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { profile } from '@/data/profile';

/**
 * The about page as a profile: a first-person column beside a card carrying the
 * portrait and the practical facts.
 *
 * Every claim here is one the site can stand behind. There is no "five years of
 * experience" and no invented job title — the two roles at DrillThru and POM's
 * Penthouse are the real ones, named as they were. Padding a portfolio with
 * years it cannot support is the fastest way to lose the room in a client call.
 */
/** Split by hand — the breaks are a typographic decision, not the measure's. */
const HEADLINE = ['Web Development, SEO,', 'Marketing & Ecommerce Growth --', 'All in One.'];

const BIO = [
  "I'm Dipendra Guragain, a Web Developer, SEO Specialist, and Ecommerce Growth enthusiast based in Kathmandu, Nepal. I work across web development, search engine optimization (SEO), Google Ads, Meta Ads, and digital marketing, helping businesses build their online presence, reach the right audience, and grow their sales.",
  'I previously worked at DrillThru, a web design and digital marketing agency in Nepal, where I gained practical experience in website development, SEO, and digital marketing.',
  "Currently, I'm working with Nano Store, focusing on ecommerce growth, product SEO, website optimization, and digital marketing strategies to improve online visibility and customer engagement.",
  'My technical experience includes React, Next.js, modern website development, and SEO optimization. Beyond development, I focus on ecommerce strategies, organic search visibility, Google Ads, Meta Ads, and conversion optimization.',
  'I believe successful online growth comes from combining the right technology, marketing strategy, and customer experience.',
  "Alongside my professional work, I'm pursuing a Bachelor of Computer Applications (BCA) at Ratna Rajyalaxmi Campus, Kathmandu.",
  'My goal is simple: Build better websites, improve search visibility, attract the right customers, and turn digital opportunities into business growth.',
];

const CAPABILITIES = [
  'Web Development',
  'SEO',
  'Technical SEO',
  'Ecommerce SEO',
  'Meta Ads',
  'Google Ads',
  'Ecommerce',
  'AI Search',
  'React',
  'Next.js',
  'Shopify',
  'WooCommerce',
  'WordPress',
  'Analytics',
];

const FACTS = [
  {
    term: 'Currently',
    detail: 'Building client sites and running search and paid campaigns, alongside a BCA.',
  },
  {
    term: 'Based in',
    detail: 'Kathmandu, Nepal. Working with teams anywhere.',
  },
  {
    term: 'Also',
    detail: 'Ecommerce, AI search visibility, and the analytics that tell you which of it worked.',
  },
];

export function ProfileIntro() {
  const whatsappHref = profile.whatsapp
    ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <Section className="border-b border-line pb-14 pt-32 md:pb-20 md:pt-40 lg:pb-24 lg:pt-44">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Breadcrumb
              items={[
                { name: 'Home', path: '/' },
                { name: 'About', path: '/about' },
              ]}
            />

            <h1 className="mt-7 text-h1 font-medium">
              {HEADLINE.map((line) => (
                <span key={line} className="-mb-[0.06em] block pb-[0.06em]">
                  {line}
                </span>
              ))}
            </h1>

            <div className="mt-9 flex flex-col gap-5">
              {BIO.map((paragraph, index) => (
                <Reveal key={paragraph} delay={index * 0.04}>
                  <p className="max-w-2xl leading-relaxed text-muted">{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15}>
              <ul className="mt-10 flex flex-wrap gap-2">
                {CAPABILITIES.map((capability) => (
                  <li
                    key={capability}
                    className="border border-line bg-surface px-3 py-1.5 text-xs font-medium tracking-tight text-ink"
                  >
                    {capability}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="flex flex-col gap-4 lg:sticky lg:top-28">
              <Reveal>
                <div className="card p-4">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src="/images/dipendra-guragain.jpg"
                      alt={`Portrait of ${profile.name}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 380px"
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-lg font-semibold tracking-tight">{profile.name}</p>
                    <p className="mt-1 text-label font-medium text-muted">
                      {profile.title} · {profile.location}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="card p-5">
                  <p className="flex items-start gap-2.5 text-label font-semibold text-ink">
                    <span
                      aria-hidden
                      className="mt-[0.35em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {profile.availabilityText}
                  </p>

                  <dl className="mt-5 flex flex-col gap-4 border-t border-line pt-5">
                    {FACTS.map((fact) => (
                      <div key={fact.term}>
                        <dt className="text-label font-semibold text-muted">
                          {fact.term}
                        </dt>
                        <dd className="mt-1.5 text-sm leading-relaxed text-ink">{fact.detail}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5">
                    {profile.email ? (
                      <Button
                        href={`mailto:${profile.email}`}
                        variant="outline"
                        className="w-full justify-center"
                        ariaLabel={`Email ${profile.email}`}
                      >
                        <Mail size={16} aria-hidden className="mr-2" />
                        {profile.email}
                      </Button>
                    ) : null}
                    {whatsappHref ? (
                      <Button
                        href={whatsappHref}
                        variant="whatsapp"
                        className="w-full justify-center"
                        ariaLabel={`Message me on WhatsApp at ${profile.whatsapp}`}
                      >
                        <WhatsAppIcon size={16} className="mr-2" aria-hidden />
                        Message me on WhatsApp
                      </Button>
                    ) : null}
                    <Button
                      href="/contact"
                      variant="inverse"
                      className="w-full justify-center"
                      showArrow
                    >
                      Start a project
                    </Button>
                  </div>
                </div>
              </Reveal>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
