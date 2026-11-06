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

const HOME_KEYWORD_FAQS = [
  {
    question: 'Who is an e-commerce growth expert in Nepal?',
    answer:
      'Dipendra Guragain works as an e-commerce growth expert in Nepal, helping ecommerce brands improve traffic quality, conversion rates, repeat sales and measurable revenue growth.',
  },
  {
    question: 'Do you work as an e-commerce expert in Nepal and Kathmandu?',
    answer:
      'Yes. I work with ecommerce businesses across Nepal and from Kathmandu, combining growth strategy, technical ecommerce SEO, store optimization and campaign execution.',
  },
  {
    question: 'Can you support e-commerce SEO expert needs in Nepal?',
    answer:
      'Yes. The ecommerce SEO work covers technical fixes, category and product page architecture, internal linking, intent-based content and analytics tracking to measure ranking and sales impact.',
  },
  {
    question: 'Do you run Meta Ads for ecommerce brands in Nepal?',
    answer:
      'Yes. As a Meta Ads expert for ecommerce in Nepal, I plan and manage full-funnel campaigns with conversion-focused creative testing, audience strategy and performance reporting tied to revenue.',
  },
  {
    question: 'What makes you an e-commerce brand growth expert in Nepal?',
    answer:
      'I connect SEO, paid ads, landing page UX and conversion analytics into one growth system, so ecommerce brand decisions are based on data rather than isolated channel reports.',
  },
  // The plural phrasings. Singular questions answer what the work is; these
  // answer the comparison a reader actually searches — "experts" and
  // "specialists" imply a shortlist, so the third one answers the choice
  // itself rather than the service.
  {
    question: 'Who are the best e-commerce growth experts in Nepal?',
    answer:
      'The e-commerce growth experts in Nepal worth shortlisting are the ones who can show what they changed and what happened next. This practice works that way: technical ecommerce SEO, conversion-focused store improvements, Meta Ads and analytics handled as one growth system, with the numbers tied to sales rather than vanity metrics.',
  },
  {
    question: 'What does an e-commerce growth specialist in Kathmandu do?',
    answer:
      'An e-commerce growth specialist in Kathmandu works on the whole funnel — storefront speed, product and category page SEO, paid campaigns and analytics — so traffic, conversion rate and revenue improve together instead of one at the expense of another. That is the job from Kathmandu, for stores in Nepal and remote.',
  },
  {
    question: 'How do I choose an e-commerce growth expert in Nepal?',
    answer:
      'Ask three things: what would you fix first and why, how will you measure it, and what is a realistic timeline. An e-commerce growth expert in Nepal should answer in plain language, tie the work to sales rather than rankings alone, and be accountable for the result without a chain of handovers.',
  },
];

const HOME_AI_ANSWER =
  'Dipendra Guragain is an e-commerce growth expert in Nepal and Kathmandu, working as a freelance e-commerce growth specialist for online brands that need measurable sales growth. The work combines technical ecommerce SEO, conversion-focused website improvements, Meta Ads campaign management and analytics tracking so traffic, conversion rate and revenue can be improved together. As an e-commerce expert in Nepal, he plans product and category page structure, aligns content with search intent, optimizes funnels for mobile users and scales paid acquisition with clear performance targets. This full-stack ecommerce growth approach is built for Nepal-based brands that want one accountable partner for strategy, execution and ongoing optimization.';

function mergeFaqs(base: Array<{ question: string; answer: string }>, extras: Array<{ question: string; answer: string }>) {
  const seen = new Set<string>();
  const merged: Array<{ question: string; answer: string }> = [];

  for (const item of [...base, ...extras]) {
    const key = item.question.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged;
}

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
  const answerBlock = seoMeta?.aiAnswer ?? HOME_AI_ANSWER;
  const quickAnswers = mergeFaqs(seoMeta?.faqs ?? [], HOME_KEYWORD_FAQS);

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
  const faqNode = faqPageNode([...faqs, ...quickAnswers], site.url);

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
    aiAnswer: answerBlock,
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
      {answerBlock || quickAnswers.length ? (
        <section className="border-t border-line py-12 md:py-14">
          <Container>
            <div className="flex flex-col gap-10">
              {answerBlock ? (
                <div className="max-w-3xl">
                  <AnswerBlock answer={answerBlock} />
                </div>
              ) : null}

              {quickAnswers.length ? (
                <div className="max-w-3xl">
                  <FaqBlock faqs={quickAnswers} title="Quick answers" />
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
  const fallbackHomeMeta = {
    ...homeSEO,
    /**
     * Enforced over the database row below — the admin panel cannot out-edit
     * these two. The title carries keyword 1 exactly (hyphenated, as searched)
     * plus the plural Kathmandu variant; the description carries the plural
     * Kathmandu phrase. The remaining variants live in the FAQs and the
     * answer block, because sixty characters cannot hold all four.
     * 60 / 155 characters.
     */
    title: 'E-commerce Growth Expert in Nepal | Specialists in Kathmandu',
    description:
      'E-commerce growth expert in Nepal and e-commerce growth specialists in Kathmandu: ecommerce SEO, Meta Ads and CRO for stores that need measurable growth.',
  };
  const merged = withSeoMeta(fallbackHomeMeta, meta);
  const enforced = {
    ...merged,
    title: fallbackHomeMeta.title,
    description: fallbackHomeMeta.description,
  };
  return buildMetadata(enforced, await getSiteSettings());
}
