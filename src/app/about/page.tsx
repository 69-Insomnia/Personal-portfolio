import { ProfileIntro } from '@/sections/Profile';
import { Experience } from '@/sections/Experience';
import { Education } from '@/sections/Education';
import { Philosophy } from '@/sections/Philosophy';
import { FAQ } from '@/sections/FAQ';
import { JsonLd } from '@/components/common/JsonLd';
import { profilePageNode } from '@/lib/structured-data';
import { buildMetadata } from '@/utils/metadata';
import { aboutSEO } from '@/data/seo';
import { getExperience } from '@/lib/content';

/**
 * The profile leads, then the background that supports it.
 *
 * `Expertise` used to sit here and was removed: it renders the same
 * `ServiceCard` grid over the same `services` data as the home page's Services
 * section, so the two pages were publishing one list twice. The capability
 * chips in the profile column cover the same ground for a reader who is here to
 * learn who this is rather than what is for sale.
 *
 * The `ProfilePage` node is what tells a search engine this URL is *about* the
 * person defined at `#person`, rather than a page that merely mentions them.
 * Without it, entity resolution has to be inferred from prose.
 */
export default async function AboutPage() {
  const experience = await getExperience();

  return (
    <>
      <JsonLd graph={[profilePageNode()]} />
      <ProfileIntro />
      <Experience data={experience} />
      <Education />
      <Philosophy />
      <FAQ />
    </>
  );
}

export const metadata = buildMetadata(aboutSEO);
