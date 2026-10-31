import type { Testimonial } from '@/types';

/* ============================================================================
 * NOTHING IN THIS FILE IS A QUOTE YET. ALL FOUR ARE WAITING ON YOU.
 * ============================================================================
 *
 * These four entries used to hold a factual summary of what was delivered —
 * "Agency website delivered on Next.js: services, work showcase…" — and the
 * section rendered that inside a `<blockquote>` with a quotation mark above it.
 * Nobody said those sentences. They described the work accurately, which is
 * exactly what made them dangerous: they read as client testimony while being
 * the author's own copy.
 *
 * ## What to fill in
 *
 * For each entry below, replace `quote: null` with the client's own sentence,
 * verbatim. Do not tidy it up — a slightly rough sentence that someone actually
 * wrote is worth more than a polished one that nobody did. Then fill `name`
 * (the person) and `role` (their job title).
 *
 * The section renders an entry ONLY when it has both a `quote` and a `name`.
 * Until then the card is invisible, and if none of the four are filled the
 * whole Testimonials band hides itself rather than showing empty boxes.
 *
 * ## The project facts that used to live here are not lost
 *
 * All four clients are also the four case studies in `src/data/projects.ts`, in
 * far more detail than the summaries that were here — overview, challenge,
 * approach, development and marketing. Nothing was deleted that is not already
 * written up properly on `/work/<slug>`.
 *
 * ## Where the quote comes from
 *
 * Ask. A two-line WhatsApp message — "what would you say this did for the
 * store?" — gets a usable sentence more often than a feedback form does. If a
 * client would rather not be named, drop the entry rather than anonymising it
 * into "a client in Kathmandu", which reads as invented even when it is not.
 * ========================================================================= */

export const testimonials: Testimonial[] = [
  {
    id: 'drillthru',
    quote: null, // TODO(quote): verbatim sentence from someone at DrillThru.
    name: '', // TODO(name): the person who said it.
    role: '', // TODO(role): their job title, e.g. "Founder".
    company: 'DrillThru',
    avatar: '/images/clients/drillthru.png',
  },
  {
    id: 'trip-zone',
    quote: null, // TODO(quote): verbatim sentence from Trip Zone.
    name: '', // TODO(name): the person who said it.
    role: '', // TODO(role): their job title.
    company: 'Trip Zone Travel & Tours',
    avatar: '/images/clients/tripzone.png',
  },
  {
    id: 'starglobalvision',
    quote: null, // TODO(quote): verbatim sentence from Star Global Vision.
    name: '', // TODO(name): the person who said it.
    role: '', // TODO(role): their job title.
    company: 'Star Global Vision',
    avatar: '/images/clients/starglobalvision.png',
  },
  {
    id: 'poms-penthouse',
    quote: null, // TODO(quote): verbatim sentence from POM's Penthouse.
    name: '', // TODO(name): the person who said it.
    role: '', // TODO(role): their job title.
    company: "POM's Penthouse",
    avatar: '/images/clients/poms-penthouse.png',
  },
];

/**
 * The entries that are safe to publish: a real quote, attributed to a named
 * person.
 *
 * Exported rather than inlined in the section so that any future consumer —
 * a `/testimonials` page, a case-study sidebar — applies the same rule without
 * having to remember it. The name check is what stops a half-finished entry
 * (quote supplied, attribution forgotten) from going live as an anonymous
 * blockquote, which reads worse than no quote at all.
 */
export function publishableTestimonials(items: Testimonial[] = testimonials): Testimonial[] {
  return items.filter(
    (item) =>
      typeof item.quote === 'string' &&
      item.quote.trim().length > 0 &&
      item.name.trim().length > 0,
  );
}
