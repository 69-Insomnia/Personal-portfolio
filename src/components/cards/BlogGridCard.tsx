import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import type { BlogPost } from '@/types';
import { postImageAlt } from '@/utils/images';

/** Image-on-top article card for the /blog grid. */
export function BlogGridCard({ post }: { post: BlogPost }) {
  return (
    <article className="group h-full overflow-hidden rounded-[1.25rem] border border-line bg-surface shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-lg">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <span className="relative block aspect-[16/10] overflow-hidden border-b border-line bg-subtle">
          <Image
            src={post.image}
            alt={postImageAlt(post)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {post.isPlaceholder ? <PlaceholderBadge className="absolute left-3 top-3" /> : null}
        </span>

        <span className="flex flex-1 flex-col p-6">
          <span className="flex flex-wrap items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em]">
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent">{post.category}</span>
            <span className="text-muted">{post.date}</span>
          </span>

          <h3 className="mt-4 font-display text-[1.15rem] font-semibold leading-snug tracking-[-0.015em] text-ink transition-colors duration-200 group-hover:text-accent">
            {post.title}
          </h3>

          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>

          <span className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-ink transition-colors group-hover:text-accent">
              Read article
              <ArrowUpRight
                size={15}
                aria-hidden
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted">
              <Clock size={13} aria-hidden />
              {post.readingTime}
            </span>
          </span>
        </span>
      </Link>
    </article>
  );
}
