import Image from 'next/image';
import Link from 'next/link';
import { profile } from '@/data/profile';
import { displayDate, isoDate } from '@/utils/dates';
import type { BlogPost } from '@/types';

/**
 * "Written by Dipendra Guragain", with the dates the article carries.
 *
 * The page previously showed a publication date and a reading time and nothing
 * else: no author at all. That is the cheapest E-E-A-T signal there is to get
 * right, and its absence was the specific gap — a page making technical claims
 * about SEO, with nobody's name on it, is asking a reader to take it on faith.
 *
 * The name links to `/about`, which is the page that describes who this is, so
 * the byline is also an internal link from every article into the profile.
 *
 * `dateModified` is shown only where the post genuinely records an edit. A
 * "last updated" line that repeats the publish date, or that refreshes on every
 * build, is worse than no line: it teaches a reader to ignore the one that
 * matters. `isoDate` is the same conversion the JSON-LD and sitemap use, so the
 * visible text and the markup cannot disagree.
 */
export function AuthorByline({ post }: { post: BlogPost }) {
  const published = isoDate(post.date);
  const modified = isoDate(post.updatedAt);
  const edited = modified && modified !== published ? modified : undefined;
  const editedLabel = edited ? displayDate(post.updatedAt) : undefined;

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="inline-flex items-center gap-2.5">
        <Image
          src={profile.avatar}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded-full border border-line object-cover"
        />
        <span>
          Written by{' '}
          <Link
            href="/about"
            rel="author"
            className="font-medium text-ink transition-colors duration-300 hover:text-accent"
          >
            {profile.name}
          </Link>
        </span>
      </span>

      {post.date ? (
        <>
          <span aria-hidden className="h-px w-4 bg-line" />
          <time dateTime={published}>{post.date}</time>
        </>
      ) : null}

      {edited && editedLabel ? (
        <>
          <span aria-hidden className="h-px w-4 bg-line" />
          <span>
            Updated <time dateTime={edited}>{editedLabel}</time>
          </span>
        </>
      ) : null}
    </p>
  );
}
