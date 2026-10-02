'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ToolChip } from '@/components/cards/ToolChip';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { platformTools } from '@/data/skills';
import { profile } from '@/data/profile';

/**
 * Three lines, split by hand rather than left to wrap.
 *
 * The breaks are a typographic decision, not a consequence of the measure —
 * "Then I Get Them" and "FOUND" are one clause, and letting the browser break
 * them wherever the column happens to end would read as an accident.
 */
const HEADLINE = ['I Build Websites.', 'Then I Get Them', 'FOUND'];

export function Hero() {
  const whatsappHref = profile.whatsapp
    ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <section className="relative overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36 lg:pt-40">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="eyebrow flex-wrap"
            >
              <span aria-hidden className="h-px w-8 bg-accent" />
              {/* Separate flex children rather than inline text with margin:
                  `.eyebrow` already carries gap-3, and JSX strips the
                  whitespace around a newline next to a tag, so inline spans
                  collapsed together. */}
              <span>Web Development</span>
              <span aria-hidden className="text-line-strong">
                /
              </span>
              <span>SEO</span>
              <span aria-hidden className="text-line-strong">
                /
              </span>
              <span>Kathmandu</span>
            </motion.p>

            <h1 className="mt-7 text-display font-medium">
              {HEADLINE.map((line, index) => (
                <span key={line} className="-mb-[0.06em] block overflow-hidden pb-[0.06em]">
                  <motion.span
                    initial={{ y: '112%' }}
                    animate={{ y: 0 }}
                    transition={{
                      delay: 0.15 + index * 0.11,
                      duration: 0.95,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="block"
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7, ease: 'easeOut' }}
              className="mt-8 max-w-xl text-lead text-muted"
            >
              {profile.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.68, duration: 0.7, ease: 'easeOut' }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Button href="/work" variant="inverse" size="lg" showArrow>
                See the Work
              </Button>
              {whatsappHref ? (
                <Button
                  href={whatsappHref}
                  variant="whatsapp"
                  size="lg"
                  ariaLabel={`Chat on WhatsApp at ${profile.whatsapp}`}
                >
                  <WhatsAppIcon size={17} className="mr-2" />
                  Chat on WhatsApp
                </Button>
              ) : null}
            </motion.div>

            {/* Flat single line rather than a location chip plus an availability
                chip. Two labelled chips made the reader parse two widgets to
                learn one thing. */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.7, ease: 'easeOut' }}
              className="mt-9 max-w-md text-sm leading-relaxed text-muted"
            >
              Based in {profile.location}.{' '}
              <span className="text-ink">{profile.availabilityText}.</span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }}
            className="lg:col-span-5"
          >
            <DashboardPanel />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function DashboardPanel() {
  return (
    <div className="relative">
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3.5">
          <span aria-hidden className="h-2 w-2 rounded-full bg-line" />
          <span aria-hidden className="h-2 w-2 rounded-full bg-line" />
          <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
          <span className="ml-3 truncate text-label font-medium uppercase text-muted">
            growth.system / overview
          </span>
        </div>

        <div className="dot-grid p-4 md:p-5">
          <div className="rounded-card flex items-center gap-4 border border-line bg-paper p-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-line">
              <Image
                src={profile.profileImage}
                alt={`Portrait of ${profile.name}`}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">{profile.name}</p>
              <p className="mt-0.5 text-xs text-muted">{profile.title}</p>
            </div>
            <span className="ml-auto hidden shrink-0 items-center gap-2 border border-line px-2.5 py-1 text-micro font-semibold uppercase text-muted sm:flex">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
              {profile.availability ? 'Available' : 'Offline'}
            </span>
          </div>

          {/* Platforms & tools. A soft tinted panel carrying a centred tracked
              label over a row of white pill chips.

              The chips get a one-time staggered entrance rather than the old
              perpetual float — nine continuously looping animations is motion
              with nothing behind it, and the two floating chips outside the
              panel already carry the "live dashboard" idea. */}
          <div className="inset mt-3.5 px-4 py-5 md:px-5 md:py-6">
            <p className="text-center text-label font-medium uppercase text-muted">
              Platforms &amp; Tools I Work With
            </p>

            {/* Content-width chips in a centred wrapping row. The chip itself
                is shared with the Technologies section — see `ToolChip`. */}
            <ul className="mt-4 flex flex-wrap justify-center gap-2.5">
              {platformTools.map((tool, index) => (
                <motion.li
                  key={tool.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.045, duration: 0.4, ease: 'easeOut' }}
                >
                  <ToolChip tool={tool} />
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="absolute -left-3 -top-3 hidden border border-line bg-surface px-3.5 py-2 text-micro font-semibold uppercase text-muted shadow-sm xl:block"
      >
        Core Web Vitals ↑
      </motion.div>
      <motion.div
        animate={{ y: [0, 7, 0] }}
        transition={{ repeat: Infinity, duration: 5.5, delay: 1, ease: 'easeInOut' }}
        className="absolute -bottom-3 -right-3 hidden border border-line bg-surface px-3.5 py-2 text-micro font-semibold uppercase text-muted shadow-sm xl:block"
      >
        Store → Growth
      </motion.div>
    </div>
  );
}
