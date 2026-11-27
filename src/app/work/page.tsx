import type { Metadata } from 'next';
import { PageHeader } from '@/components/common/PageHeader';
import { Projects } from '@/sections/Projects';
import { WorkWithMe } from '@/sections/WorkWithMe';
import { buildMetadata } from '@/utils/metadata';
import { workSEO, withSeoMeta } from '@/data/seo';
import { getProjects, getSeo, getSiteSettings } from '@/lib/content';
import { JsonLd } from '@/components/common/JsonLd';
import { collectionPageNode } from '@/lib/structured-data';

export default async function WorkPage() {
  const projects = await getProjects();
  return (
    <>
      <JsonLd
        graph={[
          collectionPageNode({
            path: '/work',
            name: 'Selected Projects',
            description:
              'Case studies of websites, ecommerce stores and SEO work by Dipendra Guragain in Nepal.',
            items: projects.map((project) => ({
              url: `/work/${project.slug}`,
              name: project.title,
            })),
          }),
        ]}
      />
      <PageHeader
        label="Work"
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
        ]}
        title="Selected Projects"
        description="A selection of websites, ecommerce experiences and digital projects I've worked on."
      />
      <Projects showHeading={false} data={projects} />
      <WorkWithMe />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeo('page', 'work');
  return buildMetadata(withSeoMeta(workSEO, meta), await getSiteSettings());
}
