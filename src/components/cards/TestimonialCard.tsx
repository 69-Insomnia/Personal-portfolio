'use client';

import Image from 'next/image';
import { Quote } from 'lucide-react';
import type { Testimonial } from '@/types';

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="card flex h-full flex-col p-7 md:p-9">
      <Quote size={22} aria-hidden className="text-accent" />
      <blockquote className="mt-5 flex-1 leading-relaxed text-ink">
        {testimonial.content}
      </blockquote>
      <figcaption className="mt-7 flex items-center gap-3.5 border-t border-line pt-5">
        {testimonial.avatar ? (
          <Image
            src={testimonial.avatar}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full border border-line object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <p className="font-medium tracking-tight">{testimonial.name}</p>
          <p className="mt-1 text-sm text-muted">
            {testimonial.role}
            {testimonial.company ? ` · ${testimonial.company}` : ''}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
