'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { profile } from '@/data/profile';
import { whatsappUrl } from '@/utils/links';

/**
 * The page's one `<h1>`, and the reason the display line sits inside it.
 *
 * Two sentences share one heading element here. The first is the exact target
 * query — "Ecommerce Specialist in Nepal" — because a heading that
 * matches the query verbatim is the strongest thing this page can say about
 * what it is for, and it names the role and the place that the Person entity at
 * `#person` publishes. (The phrase was "Ecommerce growth expert in
 * Kathmandu, Nepal" until the homepage was re-targeted at the specialist /
 * expert queries; Kathmandu and the growth positioning still carry the page
 * through the paragraph below, the answer block and the structured data.)
 *
 * The second is the line a human actually reads. It used to live outside the
 * heading as a `<p>`, which meant the largest, most opinionated sentence on the
 * page was not the page's heading at all. Folding it in makes the `<h1>` both
 * the ranking asset and the visual anchor, which is what an `<h1>` is for.
 *
 * The keyword phrase is deliberately NOT repeated as link text below. It used
 * to be, on the internal link to `/services/ecommerce-growth`, and an anchor
 * identical to the heading immediately above it reads as a copy-paste error.
 * The link keeps a keyword-bearing anchor; it just no longer duplicates the H1.
 */
const H1_KEYWORD = 'Ecommerce specialist in Nepal';

/** Split by hand — the breaks are a typographic decision, not the measure's. */
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

export function Hero() {
  const whatsappHref = whatsappUrl(profile.whatsapp);

  return (
    <section className="relative overflow-hidden pb-24 pt-32 md:pb-32 md:pt-40 lg:pt-44">
      {/*
        The decorative layer: one oversized coral diamond bleeding off the
        top-right and a blueprint dot-grid wash behind the copy. Both are
        `aria-hidden` and `pointer-events-none`; the grid is painted with a
        radial-gradient background-image (no extra request), and it fades out
        toward the bottom so it never competes with the paragraph.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(30, 64, 175, 0.14) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 72%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 72%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 top-24 -z-10 hidden h-80 w-80 rotate-45 rounded-[4rem] border-2 border-marigold/40 lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-52 -z-10 hidden h-40 w-40 rotate-45 bg-marigold/10 lg:block"
      />

      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h1 className="max-w-2xl">
              <span className="eyebrow">
                <span aria-hidden className="eyebrow-tick" />
                <span>{H1_KEYWORD}</span>
              </span>

              {/* The display lines are NOT `aria-hidden`, and there is no
                  visually-hidden duplicate of them either.

                  Splitting a sentence across three `<span>`s for typographic
                  control does not damage it — they are block-level, so a screen
                  reader reads them as one continuous sentence. But shipping the
                  same sentence twice (once visually, once in an `sr-only` span)
                  would put it in the `<h1>`'s text content twice, and the
                  `<h1>` is the one element on the page where duplicated text is
                  worth avoiding. So it is published exactly once.

                  This is the LCP candidate on mobile and the first thing a
                  reader's eye and a retriever's first chunk land on, so it is
                  plain, unanimated markup rather than a `motion.span` keyed to
                  a JS-driven entrance — an animation here was gating paint
                  until hydration finished (an 8s LCP delay with nothing else
                  to blame: TTFB was under 400ms). The slide-up entrance is still
                  available as a pure-CSS animation for anyone who wants the
                  motion back without re-coupling it to hydration. */}
              <span className="mt-7 block text-display text-ink">
                {DISPLAY_LINES.map((line) => (
                  <span key={line} className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
                    <span className="block animate-hero-line">{line}</span>
                  </span>
                ))}
              </span>
            </h1>

            <p className="measure mt-8 border-l-2 border-marigold pl-5 text-lead text-muted md:pl-6">
              I&apos;m Dipendra Guragain, an ecommerce growth specialist in Kathmandu,
              Nepal. I help online stores get found on Google, convert more visitors,
              and grow revenue through SEO, Shopify and WooCommerce optimisation,
              conversion rate optimisation, and Google and Meta Ads managed as one
              funnel with one accountable partner.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58, duration: 0.6, ease: 'easeOut' }}
              className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"
            >
              <Button href="/contact" size="lg" showArrow>
                Book a strategy call
              </Button>

              <Link
                href="/work/nano-store-ecommerce-seo"
                className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-medium text-ink transition-colors duration-200 hover:text-accent"
              >
                See the results
                <ArrowRight
                  size={16}
                  aria-hidden
                  className="transition-transform duration-200 ease-out group-hover:translate-x-1"
                />
              </Link>
            </motion.div>

            {whatsappHref ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
                className="mt-8 flex items-center gap-2.5 text-sm text-muted"
              >
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-marigold" />
                <span>
                  Prefer to talk it through?{' '}
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-accent underline-offset-4 hover:underline"
                  >
                    Message me on WhatsApp
                  </a>
                  .
                </span>
              </motion.p>
            ) : null}

            {/* Proof before persuasion. Plain markup, no motion, so the
                numbers are in the first paint alongside the H1. */}
            {/* Phones: one row per result (number left, label right) so a
                seven-character figure like "15,000+" never has to fit a third
                of a 320px screen. From `sm`: three columns, numbers top-aligned
                regardless of how long each label wraps. */}
            <dl className="mt-10 grid max-w-xl grid-cols-1 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {HERO_PROOF.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 px-5 py-4 sm:flex-col sm:items-start sm:gap-2 sm:py-5"
                >
                  <dt className="order-2 text-[0.8125rem] leading-snug text-muted sm:text-[0.75rem]">
                    {item.label}
                  </dt>
                  <dd className="order-1 min-w-[7.75rem] shrink-0 whitespace-nowrap font-display text-[1.625rem] font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums sm:min-w-0 sm:text-[clamp(1.375rem,2.6vw,1.875rem)]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-5"
          >
            <Portrait />
          </motion.div>
        </div>

        <nav
          aria-label="Recent work"
          className="mt-16 flex flex-col gap-4 border-t border-line pt-8 md:mt-20 md:flex-row md:items-center md:gap-8"
        >
          <p className="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
            Recent work
          </p>
          <ul className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {RECENT_WORK.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-[32px] items-center font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-muted transition-colors duration-200 hover:text-accent"
                >
                  {item.name}
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
 * The portrait, the marigold base bar, and the availability badge.
 *
 * ## Why the marigold sits as a base bar, not an offset sheet
 *
 * The card is a white field with the cut-out portrait resting flush against its
 * bottom edge, and the marigold (coral) closes that edge as a solid bar. It used
 * to be a block pushed out behind the card (a second sheet of paper sliding out
 * from under the first). The bar reads the same way — as the one place the
 * design gets to be loud — but it anchors the figure instead of floating behind
 * it, so the subject looks seated on the colour rather than pasted over it.
 * Marigold is 2.8:1 on white, so it can never carry text; as a flat shape it
 * costs the layout nothing.
 *
 * ## Why the cut-out rather than a framed photo
 *
 * `profile.profileImage` ships with its own background (greenery and brick). A
 * `bg-cutout` variant has that background removed to transparent, so the white
 * card shows around the head and shoulders. That is what lets the figure sit on
 * the colour field cleanly; a photo boxed inside a white frame cannot. If the
 * cut-out is missing the component falls back to the original file.
 *
 * ## On the image dimensions
 *
 * `width`/`height` are set to the 4:5 the frame actually renders at, and the
 * frame carries the same ratio. The intrinsic file may be a different shape;
 * `object-contain` anchored to the bottom handles that — the whole cut-out stays
 * visible and sits on the base bar, with white filling the headroom above. The
 * box reserves its space from the ratio, so there is no layout shift whether or
 * not the file has loaded. `priority` because this image is above the fold on
 * every viewport and is the LCP candidate on desktop.
 */
function Portrait() {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      {/*
        The offset coral diamond behind the frame — the hero's one loud shape.
        It peeks out from the top-left corner of the card, `aria-hidden`, and
        the card's own stacking keeps it behind the portrait.
      */}
      <div
        aria-hidden
        className="absolute -left-5 -top-5 h-24 w-24 rotate-45 border-2 border-marigold/60 bg-marigold/10"
      />
      <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-line bg-subtle shadow-md">
        {/* The cut-out portrait, flush to the bottom so the figure rests on the
            marigold bar. White shows through wherever the PNG is transparent. */}
        <Image
          src={profile.profileImageCutout ?? profile.profileImage}
          alt={`Portrait of ${profile.name}, ecommerce specialist in Nepal`}
          width={800}
          height={1000}
          priority
          sizes="(max-width: 1024px) 90vw, 460px"
          className="absolute inset-x-0 bottom-0 h-full w-full object-contain object-bottom"
        />

        {/* The marigold base bar. `aria-hidden` and non-interactive: it is a
            colour field, not a control, and it must never sit above the badge in
            the stacking order. */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-3 bg-marigold" />
      </div>

      {/* Straddling the bottom edge of the card, toward the right. The marker is
          the same coral diamond the eyebrows use; the label is ink, because
          marigold text would be unreadable and `marigold-ink` is not this
          design's voice. */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5, ease: 'easeOut' }}
        className="absolute -bottom-4 right-4 flex items-center gap-2.5 whitespace-nowrap rounded-control border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-md"
      >
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-marigold" />
        Available for projects
      </motion.p>
    </div>
  );
}
