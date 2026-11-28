'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { profile } from '@/data/profile';
import { whatsappUrl } from '@/utils/links';

/**
 * The page's one `<h1>`: the exact target query as the eyebrow line, then the
 * display sentence. Both are plain markup with a CSS-only entrance — this is the
 * LCP candidate, and a JS-driven entrance here once gated paint until hydration
 * (an 8s LCP). Do not wrap it in `motion.*`.
 */
const H1_KEYWORD = 'Ecommerce specialist in Nepal';

const DISPLAY_LINES = ['Stores that rank,', 'convert, and grow.'];

/** Sourced results only: the Nano Store case study and the documented Meta campaign. */
const HERO_PROOF = [
  { value: '15,000+', label: 'Monthly organic visits for Nano Store' },
  { value: '1,000+', label: 'Keywords ranking on Google' },
  { value: '143', label: 'WhatsApp chats in 2 days from Meta Ads' },
];

/** Projects with a live case study page. Labelled "recent work", not "trusted by". */
const RECENT_WORK = [
  { name: 'Nano Store', href: '/work/nano-store-ecommerce-seo' },
  { name: 'DrillThru', href: '/work/drillthru' },
  { name: 'Resthru', href: '/work/resthru' },
  { name: 'Trip Zone', href: '/work/trip-zone' },
  { name: 'Star Global Vision', href: '/work/starglobalvision' },
  { name: "POM's Penthouse", href: '/work/poms-penthouse' },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const whatsappHref = whatsappUrl(profile.whatsapp);

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-28 md:pb-28 md:pt-36 lg:pt-40">
      <HeroBackdrop />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="inline-flex items-center gap-2.5 rounded-full border border-line bg-paper-blur py-1.5 pl-2 pr-4 text-[13px] font-medium text-ink shadow-xs backdrop-blur"
            >
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-marigold-soft">
                <span aria-hidden className="pulse-dot h-2 w-2 rounded-full bg-marigold" />
              </span>
              Available for projects
            </motion.p>

            <h1 className="mt-7">
              <span className="eyebrow">
                <span aria-hidden className="eyebrow-tick" />
                <span>{H1_KEYWORD}</span>
              </span>
              <span className="mt-5 block font-display text-[clamp(2.75rem,5.6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink">
                {DISPLAY_LINES.map((line, index) => (
                  <span key={line} className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
                    <span
                      className="block animate-hero-line"
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      {index === DISPLAY_LINES.length - 1 ? (
                        <>
                          convert, and <span className="text-gradient-accent">grow.</span>
                        </>
                      ) : (
                        line
                      )}
                    </span>
                  </span>
                ))}
              </span>
            </h1>

            <p className="measure mt-7 text-lead text-muted">
              I&apos;m Dipendra Guragain, an ecommerce growth specialist in Kathmandu,
              Nepal. I help online stores get found on Google, convert more visitors,
              and grow revenue through SEO, Shopify and WooCommerce optimisation,
              conversion rate optimisation, and Google and Meta Ads managed as one
              funnel with one accountable partner.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Button href="/contact" size="lg" showArrow>
                Book a strategy call
              </Button>
              <Button href="/work" size="lg" variant="outline">
                View my work
              </Button>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-[44px] items-center gap-2 px-2 text-[15px] font-medium text-ink transition-colors duration-200 hover:text-accent"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-whatsapp text-whatsapp-ink">
                    <WhatsAppIcon size={16} aria-hidden />
                  </span>
                  Message me on WhatsApp
                </a>
              ) : null}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.9, ease }}
            className="lg:col-span-5"
          >
            <Portrait />
          </motion.div>
        </div>

        {/* Proof strip — plain markup so the numbers are in the first paint. */}
        <dl className="mt-16 grid grid-cols-1 overflow-hidden rounded-[1.25rem] border border-line bg-surface shadow-sm sm:grid-cols-3 md:mt-20">
          {HERO_PROOF.map((item, index) => (
            <div
              key={item.label}
              className={`group relative flex items-center gap-5 px-6 py-5 sm:flex-col sm:items-start sm:gap-2 sm:px-7 sm:py-7 ${
                index > 0 ? 'border-t border-line sm:border-l sm:border-t-0' : ''
              }`}
            >
              <dt className="order-2 text-sm leading-snug text-muted">{item.label}</dt>
              <dd className="order-1 min-w-[7.5rem] shrink-0 whitespace-nowrap font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums sm:min-w-0">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <nav
          aria-label="Recent work"
          className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:gap-8"
        >
          <p className="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-faint">
            Recent work
          </p>
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-2">
            {RECENT_WORK.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group inline-flex min-h-[36px] items-center gap-1 rounded-full border border-transparent px-3 font-display text-[0.98rem] font-semibold tracking-[-0.01em] text-muted transition-all duration-200 hover:border-line hover:bg-surface hover:text-ink"
                >
                  {item.name}
                  <ArrowUpRight
                    size={14}
                    aria-hidden
                    className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}

/**
 * Two blurred colour fields (emerald and lime) drifting slowly behind the copy,
 * plus a faint grid that fades out downwards. Purely decorative, CSS-animated,
 * and frozen under `prefers-reduced-motion` (see `.hero-orb` in globals.css).
 */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="hero-grid absolute inset-0" />
      <div className="hero-orb absolute -right-32 -top-24 h-[34rem] w-[34rem] rounded-full bg-accent-100 opacity-60 blur-3xl" />
      <div className="hero-orb hero-orb--slow absolute -left-40 top-1/3 h-[26rem] w-[26rem] rounded-full bg-marigold-soft blur-3xl" />
    </div>
  );
}

/**
 * The portrait card: a charcoal panel with a soft lime glow, the cut-out figure
 * resting on its bottom edge, a name plate, and one sourced result floating over
 * the corner. `priority` because it is above the fold on every viewport.
 */
function Portrait() {
  return (
    <div className="relative mx-auto w-full max-w-[26rem] lg:max-w-none">
      <div className="section-inverse relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lg ring-1 ring-black/5">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 38%, rgba(190, 242, 100, 0.22), transparent 70%), radial-gradient(80% 60% at 80% 100%, rgba(16, 185, 129, 0.25), transparent 70%)',
          }}
        />
        <Image
          src={profile.profileImageCutout ?? profile.profileImage}
          alt={`Portrait of ${profile.name}, ecommerce specialist in Nepal`}
          width={800}
          height={1000}
          priority
          sizes="(max-width: 1024px) 90vw, 460px"
          className="absolute inset-x-0 bottom-0 h-[92%] w-full object-contain object-bottom"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent"
        />
        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-ink">
              {profile.name}
            </p>
            <p className="mt-0.5 text-sm text-muted">{profile.location}</p>
          </div>
          <span className="hidden whitespace-nowrap rounded-full border border-line bg-black/30 px-3 py-1 text-xs font-medium text-ink backdrop-blur sm:inline-block">
            Ecommerce · SEO · Ads
          </span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease }}
        className="absolute -left-4 top-8 hidden rounded-2xl border border-line bg-surface p-4 shadow-lg backdrop-blur sm:block lg:-left-10"
      >
        <p className="font-display text-2xl font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums">
          15,000+
        </p>
        <p className="mt-1.5 max-w-[11rem] text-xs leading-snug text-muted">
          Monthly organic visits for Nano Store
        </p>
      </motion.div>
    </div>
  );
}
