import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Icon } from '@/components/common/Icon';
import { profile } from '@/data/profile';
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
 *
 * ## The layout (redesign pass)
 *
 * This used to be a heading followed by a 4-up grid of bordered cards — the
 * same card language three other sections on the page also used. It is now a
 * split editorial layout: the heading and lead paragraph sit in a wide left
 * column, and the four points run as a hairline-divided numbered list in a
 * right-hand rail. No boxes, no shadows — the rhythm comes from the rules
 * between items, so this section reads differently from every carded section
 * around it while carrying exactly the same copy.
 */
export function Introduction() {
  const cards = [
    {
      icon: 'shopping-bag' as const,
      title: 'Ecommerce Development',
      description:
        'Building user-friendly online stores with smooth shopping experiences, local payment options, and efficient order management for the Nepali market.',
    },
    {
      icon: 'search' as const,
      title: 'SEO & Organic Growth',
      description:
        '3+ years of SEO experience, improving Google visibility through technical SEO, product optimization, category pages, and content strategy.',
    },
    {
      icon: 'megaphone' as const,
      title: 'Paid Advertising',
      description:
        'Managing Meta Ads and Google Ads to reach potential customers, generate sales, and improve return on ad spend through continuous optimization.',
    },
    {
      icon: 'chart' as const,
      title: 'In-House Ecommerce Experience',
      description:
        'Currently working as Ecommerce Lead at Nano Store, managing SEO, paid advertising, and CRO. I work across the entire customer journey, from product discovery to checkout and repeat purchases.',
    },
  ];

  return (
    <Section id="about" className="border-t border-line">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionLabel section="about" />

              <RevealText
                as="h2"
                text="Who is Dipendra Guragain? An ecommerce growth expert helping Nepal's online stores sell more."
                className="mt-6 text-h2"
              />

              <Reveal delay={0.1}>
                <p className="mt-6 max-w-2xl text-lead text-ink">
                  With 3+ years of experience in ecommerce, SEO, and digital marketing, I help
                  businesses build better online stores, attract customers, and increase sales. I
                  focus on the complete growth process, from website experience and search
                  visibility to advertising and customer retention — working as a{' '}
                  <Link
                    href="/services/digital-marketing"
                    className="font-medium text-ink underline decoration-line underline-offset-2 transition-colors hover:text-accent"
                  >
                    digital marketing expert in Kathmandu
                  </Link>{' '}
                  for businesses that want all of it run as one strategy.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-8 flex items-center gap-4 rounded-[1.25rem] border border-line bg-surface p-3 pr-5 shadow-xs">
                  <Image
                    src={profile.profileImage}
                    alt={`Photo of ${profile.name}`}
                    width={64}
                    height={64}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-display text-base font-semibold text-ink">{profile.name}</p>
                    <p className="text-sm text-muted">{profile.location}</p>
                  </div>
                  <Link
                    href="/about"
                    className="ml-auto inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
                  >
                    About
                    <ArrowUpRight size={15} aria-hidden />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>

          <ol className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {cards.map((card, index) => {
              const wide = index === cards.length - 1;
              return (
                <Reveal
                  key={card.title}
                  as="li"
                  delay={index * 0.08}
                  className={`group flex flex-col rounded-[1.25rem] border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md md:p-7 ${
                    wide
                      ? 'section-inverse border-transparent shadow-md sm:col-span-2'
                      : 'border-line bg-surface shadow-xs hover:border-line-strong'
                  }`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-subtle text-accent transition-colors duration-300 group-hover:border-accent">
                    <Icon name={card.icon} size={19} />
                  </span>
                  <h3 className="mt-5 font-display text-[1.2rem] font-semibold leading-snug tracking-[-0.015em] text-ink">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-[0.95rem] leading-relaxed text-muted">
                    {card.description}
                  </p>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
