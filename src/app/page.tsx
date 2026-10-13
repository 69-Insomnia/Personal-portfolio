import type { Metadata } from 'next';
import { Hero } from '@/sections/Hero';
import { JsonLd } from '@/components/common/JsonLd';
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
import { faqs } from '@/data/faqs';
import { site } from '@/data/seo';
import { faqPageNode } from '@/lib/structured-data';
import { buildMetadata } from '@/utils/metadata';
import { homeSEO, withSeoMeta } from '@/data/seo';
import { getExperience, getPosts, getProjects, getSeo, getSiteSettings, getTestimonials } from '@/lib/content';

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

  /**
   * The FAQ as structured data, built from the same array the `FAQ` section
   * renders below — so the questions and answers a search engine reads are the
   * ones the page actually shows. See `faqPageNode` for why that is one array
   * rather than two that have to be kept in step.
   *
   * Emitted here rather than in `SiteJsonLd`, which is mounted site-wide: the
   * FAQ text only appears on this page, and a `FAQPage` node on a page with no
   * visible FAQ is a claim the page does not support.
   */
  const faqNode = faqPageNode(faqs, site.url);

  return (
    // Only the home page numbers its sections — see SectionNumbering.
    <SectionNumberingProvider>
      {faqNode ? <JsonLd graph={[faqNode]} /> : null}
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

/**
 * A function rather than a constant, so the admin's `seo_meta` row for this
 * page is read at render time. With no row — or no database — `getSeo`
 * resolves to `undefined` and `withSeoMeta` returns `homeSEO` untouched, which
 * is the same metadata this route exported before the table existed.
 */
export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSeo('page', 'home');
  return buildMetadata(withSeoMeta(homeSEO, meta), await getSiteSettings());
}
