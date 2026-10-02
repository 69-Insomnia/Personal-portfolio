import { Hero } from '@/sections/Hero';
import { SectionNumberingProvider } from '@/components/ui/SectionNumbering';
import { Introduction } from '@/sections/About';
import { Projects } from '@/sections/Projects';
import { Services } from '@/sections/Services';
import { Approach } from '@/sections/Approach';
import { Technologies } from '@/sections/Technologies';
import { Experience } from '@/sections/Experience';
import { Blog } from '@/sections/Blog';
import { Testimonials } from '@/sections/Testimonials';
import { FAQ } from '@/sections/FAQ';
import { Contact } from '@/sections/Contact';
import { buildMetadata } from '@/utils/metadata';
import { homeSEO } from '@/data/seo';
import { getExperience, getPosts, getProjects, getTestimonials } from '@/lib/content';

/**
 * Ten numbered sections, down from fifteen. The page ran to roughly fifteen
 * screens, which buried the work and pushed the contact form past the point
 * anyone scrolls.
 *
 * Cut from the home page, not from the site: Philosophy and Education still
 * render on /about, and Work With Me still renders on /work. The three service
 * deep-dives were homepage-only, so they merged into `Services` instead.
 */
export default async function HomePage() {
  const [projects, testimonials, posts, experience] = await Promise.all([
    getProjects(),
    getTestimonials(),
    getPosts(),
    getExperience(),
  ]);
  return (
    // Only the home page numbers its sections — see SectionNumbering.
    <SectionNumberingProvider>
      <Hero />
      <Introduction />
      <Projects data={projects} />
      <Services />
      <Approach />
      <Technologies />
      <Experience data={experience} />
      <Blog data={posts} />
      <Testimonials data={testimonials} />
      <FAQ />
      <Contact />
    </SectionNumberingProvider>
  );
}

export const metadata = buildMetadata(homeSEO);
