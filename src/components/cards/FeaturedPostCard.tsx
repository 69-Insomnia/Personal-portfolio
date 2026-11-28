import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import type { BlogPost } from '@/types';
import { postImageAlt } from '@/utils/images';

/** The large featured-article card used on the homepage and at the top of /blog. */
export function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-sm transition-all duration-300 hover:border-line-strong hover:shadow-lg">
      <Link href={`/blog/${post.slug}`} className="grid md:grid-cols-12">
        <span className="relative block aspect-[16/10] overflow-hidden border-b border-line bg-subtle md:col-span-7 md:aspect-auto md:min-h-[22rem] md:border-b-0 md:border-r">
          <Image
            src={post.image}
            alt={postImageAlt(post)}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </span>

        <span className="flex flex-col p-6 md:col-span-5 md:p-9">
          <span className="flex flex-wrap items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em]">
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent">Featured</span>
            <span className="text-accent">{post.category}</span>
            <span aria-hidden className="h-px w-4 bg-line" />
            <span className="text-muted">{post.date}</span>
          </span>

          <h3 className="mt-5 font-display text-[clamp(1.4rem,2.2vw,1.9rem)] font-semibold leading-tight tracking-[-0.02em] text-ink transition-colors duration-200 group-hover:text-accent">
            {post.title}
          </h3>

          <p className="mt-4 line-clamp-4 leading-relaxed text-muted">{post.excerpt}</p>

          <span className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-5 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-ink transition-colors group-hover:text-accent">
              Read the article
              <ArrowUpRight
                size={16}
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
