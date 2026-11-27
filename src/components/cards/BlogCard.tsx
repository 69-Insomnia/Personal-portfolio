import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import { postImageAlt } from '@/utils/images';
import type { BlogPost } from '@/types';

/**
 * An article as a compact editorial row (redesign pass).
 *
 * The card used to be image-on-top with the copy underneath — the same
 * vertical card the project grid used, which left the two grids reading as
 * one component twice. Projects went image-forward with a scrim; articles go
 * the other way, to a horizontal record: a small square thumbnail pinned left,
 * then category/date, title, clamped excerpt and the reading time in a
 * hairline-separated footer. Text on paper, image as a marker.
 *
 * The thumbnail keeps `object-contain`: the artwork is 3:2 and a `cover` crop
 * shaved the corner labels off the WhatsApp post's own image. The card sits on
 * the page colour, so the letterbox bars are invisible.
 */
export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="card group h-full overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1 hover:border-line-strong hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="flex h-full gap-4 p-4 md:gap-5 md:p-5">
        {/* `self-start` matters: as a flex child the span would otherwise be
            stretched to the row's height, and a definite height wins over
            `aspect-square` — which is what turned the thumbnail into a tall
            grey column instead of a square marker. */}
        <span className="relative block aspect-square w-20 shrink-0 self-start overflow-hidden rounded-control border border-line bg-subtle md:w-28">
          <Image
            src={post.image}
            alt={postImageAlt(post)}
            fill
            sizes="(max-width: 768px) 96px, 112px"
            className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          {post.isPlaceholder ? <PlaceholderBadge className="absolute left-2 top-2 scale-90" /> : null}
        </span>

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex flex-wrap items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em]">
            <span className="text-accent">{post.category}</span>
            <span aria-hidden className="h-px w-4 bg-line" />
            <span className="text-muted">{post.date}</span>
          </span>

          <h3 className="mt-2 font-display text-[1.05rem] font-semibold leading-snug tracking-[-0.01em] text-ink transition-colors duration-200 group-hover:text-accent">
            {post.title}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted">
            {post.excerpt}
          </p>

          <span className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-line pt-3 text-[0.8125rem]">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-accent">
              Read the article
              <ArrowRight
                size={13}
                aria-hidden
                className="transition-transform duration-200 ease-out group-hover:translate-x-1"
              />
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-muted">
              <Clock size={12} aria-hidden />
              {post.readingTime}
            </span>
          </span>
        </span>
      </Link>
    </article>
  );
}
