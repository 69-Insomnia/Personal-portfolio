import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

/**
 * The 404 body, shared by the root not-found boundary and available to any
 * other boundary that needs it. It carries no chrome of its own — the caller
 * decides what wraps it.
 */
export function NotFoundView() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden border-b border-line bg-subtle pt-32">
      {/*
        Decorative, aria-hidden: the same outline diamond + solid companion the
        PageHeader band uses, so the error page opens with the site's standard
        inner-page shape rather than a plain white void.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 hidden h-80 w-80 -translate-y-1/2 rotate-45 rounded-[4rem] border-2 border-marigold/30 xl:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 top-1/2 hidden h-28 w-28 -translate-y-1/2 rotate-45 bg-marigold/10 xl:block"
      />
      <Container className="relative">
        <p className="eyebrow">
          <span aria-hidden className="eyebrow-tick" />
          <span>Error 404</span>
        </p>
        <h1 className="mt-6 max-w-2xl text-display font-semibold">
          This page doesn&apos;t exist.
        </h1>
        <p className="measure mt-6 max-w-lg border-l-2 border-marigold pl-5 text-lead text-muted">
          The link may be outdated, or the page may have moved. Try one of the routes below
          instead.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href="/" size="lg" showArrow>
            Back Home
          </Button>
          <Button href="/work" variant="outline" size="lg">
            View My Work
          </Button>
        </div>
        <p className="mt-10 text-sm text-muted">
          Or head to the{' '}
          <Link href="/contact" className="text-accent underline underline-offset-4">
            contact page
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
