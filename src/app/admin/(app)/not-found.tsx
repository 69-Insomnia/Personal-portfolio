import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Admin-scoped 404, inside the admin shell and without the public chrome.
 *
 * `[collection]/page.tsx` calls `notFound()` for an unknown collection key, so
 * `/admin/anything-else` lands here. Without a boundary at this level the call
 * bubbles up to the root not-found, which renders the public Navbar and Footer
 * — the exact thing the `(site)` route group exists to prevent.
 */
export default function AdminNotFound() {
  return (
    <div>
      <p className="text-label font-medium uppercase text-muted">Error 404</p>
      <h1 className="mt-1 text-h2">Not found</h1>
      <p className="mt-4 text-sm text-muted">
        There&apos;s no admin page at this address.
      </p>
      <Link
        href="/admin"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} aria-hidden />
        Back to dashboard
      </Link>
    </div>
  );
}
