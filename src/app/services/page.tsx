import { PageHeader } from '@/components/common/PageHeader';
import { Expertise } from '@/sections/Expertise';
import { Approach } from '@/sections/Approach';
import { FAQ } from '@/sections/FAQ';
import { getServices } from '@/lib/content';
import { buildMetadata } from '@/utils/metadata';
import { servicesSEO } from '@/data/seo';

/**
 * Services, read from the database like every other listing.
 *
 * This page used to read the static `src/data/services.ts` directly, with a
 * comment explaining why: the table still held the pre-rename titles
 * ("Web Development Specialist"), so reading it published the wrong H1 while
 * the file held the right one — and the page and `/services/[slug]`, which has
 * always read the table, disagreed about the same seven services.
 *
 * The cause was a one-off drift, not a design constraint, and
 * `npx tsx scripts/sync-content.ts` has since pushed the file's copy and order
 * into the table. Reading through the same path as the detail routes is what
 * keeps the two from drifting apart again, so this is now an ordinary CMS read.
 *
 * If the grid and the detail pages ever disagree again, the answer is to re-run
 * the sync, not to re-point this page at the file.
 */
export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader
        label="Services"
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ]}
        title="How I Can Help"
        description="Web development, SEO, advertising and ecommerce growth, built as one connected system."
      />
      <Expertise showAllServices={false} data={services} />
      <Approach />
      <FAQ />
    </>
  );
}

export const metadata = buildMetadata(servicesSEO);
