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
    <section className="flex min-h-[70vh] items-center border-b border-line pt-32">
      <Container>
        <p className="text-label font-semibold uppercase text-accent">Error 404</p>
        <h1 className="mt-6 max-w-2xl text-display font-medium">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-6 max-w-lg text-lead text-muted">
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
