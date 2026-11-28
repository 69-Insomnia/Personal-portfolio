'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BlogGridCard } from '@/components/cards/BlogGridCard';
import type { BlogPost } from '@/types';

/**
 * The /blog article grid with category filter chips. Every article is in the
 * server-rendered HTML (the default filter is "All"); filtering only hides
 * cards client-side, so no post becomes unreachable to crawlers.
 */
export function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const categories = useMemo(
    () => Array.from(new Set(posts.map((post) => post.category))).sort(),
    [posts],
  );
  const [active, setActive] = useState<string>('All');
  const visible = active === 'All' ? posts : posts.filter((post) => post.category === active);

  return (
    <>
      <div role="group" aria-label="Filter articles by category" className="flex flex-wrap gap-2">
        {['All', ...categories].map((category) => {
          const selected = category === active;
          const count =
            category === 'All' ? posts.length : posts.filter((p) => p.category === category).length;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(category)}
              className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 ${
                selected
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink'
              }`}
            >
              {category}
              <span className={`text-xs ${selected ? 'opacity-70' : 'text-faint'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((post) => (
            <motion.li
              key={post.slug}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <BlogGridCard post={post} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
}
