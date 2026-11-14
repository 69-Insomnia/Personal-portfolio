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
 * query — "Ecommerce growth expert in Nepal" — because a heading that
 * matches the query verbatim is the strongest thing this page can say about
 * what it is for, and it names the role and the place that the Person entity at
 * `#person` publishes.
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
const H1_KEYWORD = 'Ecommerce growth expert in Kathmandu, Nepal';

/** Split by hand — the breaks are a typographic decision, not the measure's. */
const DISPLAY_LINES = ['Stores that rank,', 'convert, and grow.'];

export function Hero() {
  const whatsappHref = whatsappUrl(profile.whatsapp);

  return (
    <section className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40 lg:pt-44">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h1 className="max-w-2xl">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="eyebrow"
              >
                <span aria-hidden className="h-px w-7 bg-marigold" />
                <span>{H1_KEYWORD}</span>
              </motion.span>

              {/* The display lines are NOT `aria-hidden`, and there is no
                  visually-hidden duplicate of them either.

                  Splitting a sentence across three `<span>`s for typographic
                  control does not damage it — they are block-level, so a screen
                  reader reads them as one continuous sentence. But shipping the
                  same sentence twice (once visually, once in an `sr-only` span)
                  would put it in the `<h1>`'s text content twice, and the
                  `<h1>` is the one element on the page where duplicated text is
                  worth avoiding. So it is published exactly once. */}
              <span className="mt-6 block text-display text-ink">
                {DISPLAY_LINES.map((line, index) => (
                  <span key={line} className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
                    <motion.span
                      initial={{ y: '112%' }}
                      animate={{ y: 0 }}
                      transition={{
                        delay: 0.12 + index * 0.09,
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="block"
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.6, ease: 'easeOut' }}
              className="measure mt-8 text-lead text-muted"
            >
              I&apos;m Dipendra Guragain, an ecommerce growth specialist in Kathmandu,
              Nepal. I help online stores get found on Google, convert more visitors,
              and grow revenue through SEO, Shopify and WooCommerce optimisation,
              conversion rate optimisation, and Google and Meta Ads managed as one
              funnel with one accountable partner.
            </motion.p>

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
                href="/work"
                className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-medium text-ink transition-colors duration-200 hover:text-accent"
              >
                See selected work
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
                className="mt-8 text-sm text-muted"
              >
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
              </motion.p>
            ) : null}
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
      </Container>
    </section>
  );
}

/**
 * The portrait, the marigold base bar, and the availability badge.
 *
 * ## Why the marigold sits as a base bar, not an offset sheet
 *
 * The card is a cream field with the cut-out portrait resting flush against its
 * bottom edge, and the marigold closes that edge as a solid bar. It used to be
 * a block pushed out behind the card (a second sheet of paper sliding out from
 * under the first). The bar reads the same way — as the one place the design
 * gets to be loud — but it anchors the figure instead of floating behind it, so
 * the subject looks seated on the colour rather than pasted over it. Marigold is
 * 2.0:1 on paper, so it can never carry text; as a flat shape it costs the
 * layout nothing.
 *
 * ## Why the cut-out rather than a framed photo
 *
 * `profile.profileImage` ships with its own background (greenery and brick). A
 * `bg-cutout` variant has that background removed to transparent, so the cream
 * card shows around the head and shoulders. That is what lets the figure sit on
 * the colour field cleanly; a photo boxed inside a white frame cannot. If the
 * cut-out is missing the component falls back to the original file.
 *
 * ## On the image dimensions
 *
 * `width`/`height` are set to the 4:5 the frame actually renders at, and the
 * frame carries the same ratio. The intrinsic file may be a different shape;
 * `object-contain` anchored to the bottom handles that — the whole cut-out stays
 * visible and sits on the base bar, with cream filling the headroom above. The
 * box reserves its space from the ratio, so there is no layout shift whether or
 * not the file has loaded. `priority` because this image is above the fold on
 * every viewport and is the LCP candidate on desktop.
 */
function Portrait() {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-line bg-subtle shadow-sm">
        {/* The cut-out portrait, flush to the bottom so the figure rests on the
            marigold bar. Cream shows through wherever the PNG is transparent. */}
        <Image
          src={profile.profileImageCutout ?? profile.profileImage}
          alt={`Portrait of ${profile.name}, ${profile.title}`}
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

      {/* Straddling the bottom edge of the card, toward the right. The dot is
          the same marigold as the bar it sits on; the label is ink, because
          marigold text would be unreadable and `marigold-ink` is not this
          design's voice. */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5, ease: 'easeOut' }}
        className="absolute -bottom-4 right-4 flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-sm"
      >
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-marigold" />
        Available for projects
      </motion.p>
    </div>
  );
}
