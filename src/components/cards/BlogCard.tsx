'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import type { BlogPost } from '@/types';

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex h-full flex-col">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <div className="card relative aspect-[16/10] overflow-hidden">
          <Image
            src={post.image}
            alt={
              post.isPlaceholder
                ? `Placeholder image for article: ${post.title}`
                : `${post.title}: ${post.excerpt}`
            }
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
            /* `contain` to match the article hero. The article artwork is 3:2
               and this card is 16:10, so `cover` was shaving the top and bottom
               off every thumbnail — on the WhatsApp post that clipped the top
               of its own corner label. The card sits on the page colour, so the
               side margins it leaves are invisible. */
            className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          {post.isPlaceholder ? <PlaceholderBadge className="absolute left-3 top-3" /> : null}
        </div>

        <div className="mt-5 flex items-center gap-3 text-label font-medium uppercase">
          <span className="text-accent">{post.category}</span>
          <span aria-hidden className="h-px w-4 bg-line" />
          <span className="text-muted">{post.date}</span>
        </div>

        <h3 className="mt-3 text-xl font-medium tracking-tight transition-colors duration-300 group-hover:text-accent">
          {post.title}
        </h3>

        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors duration-300 group-hover:text-accent">
            Read Article
            <ArrowRight
              size={15}
              aria-hidden
              className="transition-transform duration-300 ease-out group-hover:translate-x-1"
            />
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Clock size={12} aria-hidden />
            {post.readingTime}
          </span>
        </div>
      </Link>
    </article>
  );
}
