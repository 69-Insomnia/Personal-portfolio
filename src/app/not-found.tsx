import { NotFoundView } from '@/components/common/NotFoundView';
import { profile } from '@/data/profile';
import { buildMetadata } from '@/utils/metadata';

const notFoundSEO = {
  title: `Page Not Found | ${profile.name}`,
  description: 'The page you are looking for does not exist.',
};

/**
 * The root 404 boundary, which serves two cases:
 *
 *   1. An unmatched URL — nothing else claims it.
 *   2. `notFound()` thrown by a public page, e.g. `/work/[slug]` with a slug
 *      that doesn't exist.
 *
 * It renders inside the root layout, so `ConditionalChrome` has already
 * applied the site Navbar and Footer around it — this must NOT add its own,
 * or the two would stack. Admin's 404 is separate: `admin/(app)/not-found.tsx`,
 * which stays inside the admin shell.
 */
export default function NotFound() {
  return <NotFoundView />;
}

export const metadata = buildMetadata(notFoundSEO);
