'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { PlaceholderBadge } from '@/components/common/PlaceholderBadge';
import { Card } from '@/components/ui/Card';
import { postImageAlt } from '@/utils/images';
import type { BlogPost } from '@/types';

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex h-full flex-col">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <Card className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={post.image}
            alt={postImageAlt(post)}
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
        </Card>

        {/* Sentence case, no tracked uppercase — the category read as a system
            tag rather than a section of a magazine. The rule between the two
            fields stays; it is doing the separating that the casing used to. */}
        <div className="mt-5 flex items-center gap-3 text-sm">
          <span className="font-medium text-accent">{post.category}</span>
          <span aria-hidden className="h-px w-4 bg-line" />
          <span className="text-muted">{post.date}</span>
        </div>

        <h3 className="mt-3 font-display text-h3 transition-colors duration-200 group-hover:text-accent">
          {post.title}
        </h3>

        <p className="mt-3 flex-1 leading-relaxed text-muted">{post.excerpt}</p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-[15px] font-medium text-accent">
            Read the article
            <ArrowRight
              size={15}
              aria-hidden
              className="transition-transform duration-200 ease-out group-hover:translate-x-1"
            />
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            <Clock size={13} aria-hidden />
            {post.readingTime}
          </span>
        </div>
      </Link>
    </article>
  );
}
