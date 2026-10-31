'use client';

import Image from 'next/image';
import { Quote } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Testimonial } from '@/types';

/**
 * One attributed client quote.
 *
 * The quote mark is marigold and `aria-hidden`: it is the decorative role the
 * palette reserves that colour for, and a screen reader announcing "quote" as
 * an image alt would double up with the `<blockquote>` element it already
 * understands.
 *
 * The attribution reads name → role → company, which is the order a reader
 * weights it in. `role` is required (by `publishableTestimonials`) and
 * `company` optional, so the line degrades to just a job title rather than
 * leaving a dangling separator.
 */
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card as="figure" className="flex h-full flex-col p-7 md:p-8">
      <Quote size={22} aria-hidden className="shrink-0 text-marigold" />

      <blockquote className="mt-5 flex-1 text-lg leading-[1.65] text-ink">
        {testimonial.quote}
      </blockquote>

      <figcaption className="mt-7 flex items-center gap-3.5 border-t border-line pt-5">
        {testimonial.avatar ? (
          <Image
            src={testimonial.avatar}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full border border-line object-contain"
          />
        ) : null}
        <div className="min-w-0">
          <p className="font-medium text-ink">{testimonial.name}</p>
          <p className="mt-0.5 text-sm text-muted">
            {testimonial.role}
            {testimonial.company ? ` · ${testimonial.company}` : ''}
          </p>
        </div>
      </figcaption>
    </Card>
  );
}
