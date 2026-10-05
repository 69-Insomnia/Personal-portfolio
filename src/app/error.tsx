'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

/**
 * The error boundary for the public routes.
 *
 * Without one, an exception thrown while rendering a page falls through to
 * Next.js's built-in global error screen — the bare "This page couldn't load"
 * with no navigation, no branding and no way back into the site. That is the
 * worst possible outcome for a visitor and, incidentally, what this site
 * actually shipped for a period: a client-side crash replaced every page with
 * that screen while the server-rendered HTML was perfectly fine.
 *
 * A boundary cannot prevent the crash. It can make the difference between a
 * visitor who is stuck on a dead end and one who is two clicks from the page
 * they wanted.
 *
 * Two deliberate omissions:
 *
 *  - No `metadata` export. An error boundary is a client component, so it
 *    cannot export one, and it does not need to: the response already carries
 *    a 500, which is not indexable, and this route is never served as a
 *    successful page for a crawler to cache.
 *
 *  - No breadcrumb or `h1` competing with the page that failed. What renders
 *    here replaces the whole route, so this *is* the page, and it gets the one
 *    `h1`.
 *
 * `digest` is shown rather than `error.message`. The message from a production
 * build is minified and meaningless to a visitor, while the digest is the
 * value that actually correlates with the stack trace in the hosting logs —
 * which is what someone reporting the problem should be asked for.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Goes to the browser console and, on Vercel, into the function logs
    // alongside the digest printed below.
    console.error('[error-boundary]', error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center border-b border-line pt-32">
      <Container>
        <p className="text-label font-semibold uppercase text-accent">Something went wrong</p>
        <h1 className="mt-6 max-w-2xl text-display font-medium">
          This page hit an error.
        </h1>
        <p className="mt-6 max-w-lg text-lead text-muted">
          It is not you — something failed while loading this page. Trying again often works.
          If it keeps happening, the links below all still do.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button onClick={reset} size="lg" showArrow>
            Try Again
          </Button>
          <Button href="/" variant="outline" size="lg">
            Back Home
          </Button>
          <Button href="/work" variant="outline" size="lg">
            View My Work
          </Button>
        </div>
        <p className="mt-10 text-sm text-muted">
          Still stuck? The{' '}
          <Link href="/contact" className="text-accent underline underline-offset-4">
            contact page
          </Link>{' '}
          reaches a person.
        </p>
        {error.digest ? (
          <p className="mt-6 text-xs text-faint">
            Reference: <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
      </Container>
    </section>
  );
}
