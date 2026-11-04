import type { Metadata } from 'next';
import { Hero } from '@/sections/Hero';
import { JsonLd } from '@/components/common/JsonLd';
import { AnswerBlock, FaqBlock } from '@/components/common/GeoBlocks';
import { Container } from '@/components/ui/Container';
import { SectionNumberingProvider } from '@/components/ui/SectionNumbering';
import { Introduction } from '@/sections/About';
import { Projects } from '@/sections/Projects';
import { Stats } from '@/sections/Stats';
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
import {
  definedTermNodes,
  definedTermSetNode,
  faqPageNode,
  personId,
  webPageNode,
} from '@/lib/structured-data';
import { buildMetadata } from '@/utils/metadata';
import { homeSEO, withSeoMeta } from '@/data/seo';
import { getExperience, getPosts, getProjects, getSeo, getServices, getSiteSettings, getTestimonials } from '@/lib/content';

/**
 * Twelve sections, in the order a visitor actually asks the questions: who is
 * this, what has he built, does the work back it up, what can I buy, how does it
 * run, what does he use, where has he done it, what does he know, who vouches
 * for him, what about my specific worry, and how do I start.
 *
 * `Stats` is new and sits directly under the work — a count of case studies is
 * a claim until you have scrolled past the case studies, and a summary once you
 * have. Everything else keeps its position from the previous structure; see
 * `src/data/sections.ts` for the registry that mirrors this order.
 */
export default async function HomePage() {
  const [projects, testimonials, posts, experience, services, seoMeta] = await Promise.all([
    getProjects(),
    getTestimonials(),
    getPosts(),
    getExperience(),
    getServices(),
    getSeo('page', 'home'),
  ]);

  /**
   * The FAQ as structured data, built from the same two arrays the page
   * renders below — the static seven in the `FAQ` section and the admin's
   * target-keyword questions in the `FaqBlock` — so the questions a search
   * engine reads are the ones a visitor can actually see. See `faqPageNode`
   * for why that is one node rather than two that have to be kept in step.
   *
   * Emitted here rather than in `SiteJsonLd`, which is mounted site-wide: the
   * FAQ text only appears on this page, and a `FAQPage` node on a page with no
   * visible FAQ is a claim the page does not support.
   */
  const faqNode = faqPageNode([...faqs, ...(seoMeta?.faqs ?? [])], site.url);

  /**
   * The `WebPage` node, carrying the two properties only a page has: an
   * `abstract` (the admin's `ai_answer`, which is the paragraph answer engines
   * quote when asked who Dipendra is) and `about`/`mainEntity`, which tie the
   * page to `#person` and to the knows-about terms in `entity_signals`.
   *
   * The home route never published one before, so its most quotable content
   * existed only as prose. Returns `undefined` with no row and no database,
   * and the caller spreads it conditionally — a `WebPage` restating the URL
   * and nothing else is markup that asserts nothing.
   */
  const pageNode = webPageNode({
    url: `${site.url}/`,
    name: 'Ecommerce Growth Expert in Nepal',
    mainEntityId: personId,
    signals: seoMeta?.entitySignals,
    aiAnswer: seoMeta?.aiAnswer,
  });

  /** Glossary terms from `entity_signals` — see `definedTermNodes`. */
  const terms = seoMeta?.entitySignals?.definedTerms;

  const graph = [
    ...(pageNode ? [pageNode] : []),
    ...definedTermNodes(terms),
    // The set is emitted only alongside terms, since it exists to give
    // them something to belong to.
    ...(terms?.length ? [definedTermSetNode()] : []),
    ...(faqNode ? [faqNode] : []),
  ];

  return (
    // Only the home page numbers its sections — see SectionNumbering.
    <SectionNumberingProvider>
      {graph.length > 0 ? <JsonLd graph={graph} /> : null}
      <Hero />

      {/* The answer block, directly under the hero because that is where both
          a reader's eye and a retriever's first chunk land.

          It renders outside `Reveal` deliberately: an animated-in paragraph is
          absent from the raw HTML that GPTBot, PerplexityBot and Google-Extended
          fetch, which is the entire audience this block exists for. Same reason
          the FAQ questions below use `<details>` rather than the accordion —
          see `GeoBlocks.tsx`. */}
      {seoMeta?.aiAnswer || seoMeta?.faqs?.length ? (
        <section className="border-t border-line py-12 md:py-14">
          <Container>
            <div className="flex flex-col gap-10">
              {seoMeta?.aiAnswer ? (
                <div className="max-w-3xl">
                  <AnswerBlock answer={seoMeta.aiAnswer} />
                </div>
              ) : null}

              {seoMeta?.faqs?.length ? (
                <div className="max-w-3xl">
                  <FaqBlock faqs={seoMeta.faqs} title="Quick answers" />
                </div>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      <Introduction />
      <Projects data={projects} />
      <Stats />
      <Services data={services} />
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
