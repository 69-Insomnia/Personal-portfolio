import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { Comparison } from '@/sections/Comparison';
import { Expertise } from '@/sections/Expertise';
import { Approach } from '@/sections/Approach';
import { FAQ } from '@/sections/FAQ';
import { getSeo, getServices, getSiteSettings } from '@/lib/content';
import { buildMetadata } from '@/utils/metadata';
import { servicesSEO, withSeoMeta } from '@/data/seo';

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
        footer={
          /* The inbound link to the retargeted page, with the exact anchor
             the brief specified. The cards below already link every service,
             but under each service's own title — so the phrase "digital
             marketing expert in Kathmandu" appeared nowhere on this route. */
          <p className="mt-7 max-w-2xl text-sm leading-relaxed text-muted">
            Looking for a{' '}
            <Link
              href="/services/digital-marketing"
              className="font-medium text-ink underline decoration-line underline-offset-2 transition-colors hover:text-accent"
            >
              digital marketing expert in Kathmandu
            </Link>
            ? That page covers SEO, Google Ads, Meta Ads, content and conversion
            as one strategy with one monthly report.
          </p>
        }
      />
      <Expertise showAllServices={false} data={services} />
      {/* The cards say what each service is; this says how they differ. The
          audit's §7 finding was that the site had no tables anywhere, and that
          comparative data is what answer engines lift most readily. */}
      <Comparison data={services} />
      <Approach />
      <FAQ />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeo('page', 'services');
  return buildMetadata(withSeoMeta(servicesSEO, meta), await getSiteSettings());
}
