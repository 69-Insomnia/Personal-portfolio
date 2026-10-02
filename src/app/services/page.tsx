import { PageHeader } from '@/components/common/PageHeader';
import { Expertise } from '@/sections/Expertise';
import { Approach } from '@/sections/Approach';
import { FAQ } from '@/sections/FAQ';
import { buildMetadata } from '@/utils/metadata';
import { servicesSEO } from '@/data/seo';

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        label="Services"
        title="How I Can Help"
        description="Web development, SEO, advertising and ecommerce growth, built as one connected system."
      />
      {/*
        Reads the static `src/data/services.ts` rather than the `services` table.
        The table still holds the old "Web Development Specialist" / "SEO
        Specialist" titles, so passing `data={services}` here made the grid
        render those instead of the corrected titles in the file.

        Re-enable the CMS read — `const services = await getServices();` plus
        `data={services}`, as /work/page.tsx does — once
        `npx tsx scripts/sync-content.ts` has pushed the new titles into the
        table. Until then this page and `/services/[slug]` (which reads the
        table first) will disagree, and the detail page will keep showing
        "Web Development Specialist" as its H1.
      */}
      <Expertise showAllServices={false} />
      <Approach />
      <FAQ />
    </>
  );
}

export const metadata = buildMetadata(servicesSEO);
