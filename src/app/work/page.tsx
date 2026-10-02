import { PageHeader } from '@/components/common/PageHeader';
import { Projects } from '@/sections/Projects';
import { WorkWithMe } from '@/sections/WorkWithMe';
import { buildMetadata } from '@/utils/metadata';
import { workSEO } from '@/data/seo';
import { getProjects } from '@/lib/content';

export default async function WorkPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHeader
        label="Work"
        title="Selected Projects"
        description="A selection of websites, ecommerce experiences and digital projects I've worked on."
      />
      <Projects showHeading={false} data={projects} />
      <WorkWithMe />
    </>
  );
}

export const metadata = buildMetadata(workSEO);
