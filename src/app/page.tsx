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
import { FAQ } from '@/sections/FAQ';
import { Contact } from '@/sections/Contact';
import { faqs } from '@/data/faqs';
import { site } from '@/data/seo';
import {
  customJsonLdNodes,
  definedTermNodes,
  definedTermSetNode,
  faqPageNode,
  personId,
  webPageNode,
} from '@/lib/structured-data';
import { buildMetadata } from '@/utils/metadata';
import { homeSEO, withSeoMeta } from '@/data/seo';
import { getExperience, getPosts, getProjects, getSeo, getServices, getSiteSettings } from '@/lib/content';

const HOME_KEYWORD_FAQS = [
  {
    question: 'Who is an ecommerce growth expert in Kathmandu, Nepal?',
    answer:
      'Dipendra Guragain is an ecommerce growth specialist in Kathmandu, Nepal, helping online stores improve visibility, conversion rate, and revenue through SEO, Shopify optimisation, CRO, and Google and Meta Ads.',
  },
  {
    question: 'Do you work as an ecommerce expert in Kathmandu and Nepal?',
    answer:
      'Yes. I work with ecommerce businesses across Nepal from Kathmandu, combining growth strategy, technical ecommerce SEO, store optimisation, and paid media execution as one funnel.',
  },
  {
    question: 'Can you support ecommerce SEO expert needs in Nepal?',
    answer:
      'Yes. The ecommerce SEO work covers technical fixes, category and product page architecture, internal linking, intent-based content, and analytics tracking to measure ranking and sales impact.',
  },
  {
    question: 'Do you run Meta Ads for ecommerce brands in Nepal?',
    answer:
      'Yes. As a Meta Ads expert for ecommerce in Nepal, I plan and manage full-funnel campaigns with conversion-focused creative testing, audience strategy, and performance reporting tied to revenue.',
  },
  {
    question: 'What makes you an ecommerce growth specialist in Kathmandu?',
    answer:
      'I connect SEO, paid ads, landing page UX, and conversion analytics into one growth system, so ecommerce brand decisions are based on data rather than isolated channel reports.',
  },
  // The plural phrasings. Singular questions answer what the work is; these
  // answer the comparison a reader actually searches — "experts" and
  // "specialists" imply a shortlist, so the third one answers the choice
  // itself rather than the service.
  {
    question: 'Who are the best ecommerce growth experts in Nepal?',
    answer:
      'The ecommerce growth experts in Nepal worth shortlisting are the ones who can show what they changed and what happened next. This practice works that way: technical ecommerce SEO, conversion-focused store improvements, Meta Ads and analytics handled as one growth system, with the numbers tied to sales rather than vanity metrics.',
  },
  {
    question: 'What does an ecommerce growth specialist in Kathmandu do?',
    answer:
      'An ecommerce growth specialist in Kathmandu works on the whole funnel — storefront speed, product and category page SEO, paid campaigns and analytics — so traffic, conversion rate and revenue improve together instead of one at the expense of another. That is the job from Kathmandu, for stores in Nepal and remote.',
  },
  {
    question: 'How do I choose an ecommerce growth expert in Nepal?',
    answer:
      'Ask three things: what would you fix first and why, how will you measure it, and what is a realistic timeline. An ecommerce growth expert in Nepal should answer in plain language, tie the work to sales rather than rankings alone, and be accountable for the result without a chain of handovers.',
  },
];

const HOME_AI_ANSWER =
  'Dipendra Guragain is an ecommerce specialist in Nepal and an ecommerce growth expert in Kathmandu. He helps online stores get found on Google, convert more visitors, and grow revenue through SEO, Shopify and WooCommerce optimisation, conversion rate optimisation, and Google and Meta Ads, managed as one funnel with one accountable partner.';

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
 * Eleven sections, in the order a visitor actually asks the questions: who is
 * this, what has he built, does the work back it up, what can I buy, how does it
 * run, what does he use, where has he done it, what does he know, what about my
 * specific worry, and how do I start.
 *
 * `Stats` is new and sits directly under the work — a count of case studies is
 * a claim until you have scrolled past the case studies, and a summary once you
 * have. Everything else keeps its position from the previous structure; see
 * `src/data/sections.ts` for the registry that mirrors this order.
 */
export default async function HomePage() {
  const [projects, posts, experience, services, seoMeta] = await Promise.all([
    getProjects(),
    getPosts(),
    getExperience(),
    getServices(),
    getSeo('page', 'home'),
  ]);
  const answerBlock = seoMeta?.aiAnswer ?? HOME_AI_ANSWER;
  const quickAnswers = mergeFaqs(seoMeta?.faqs ?? [], HOME_KEYWORD_FAQS);

  /**
   * The "Quick answers" list under the answer paragraph.
   *
   * Hidden at the owner's request (2026-11-16). Set back to `true` to restore
   * it. Both the rendering and the `FAQPage` node below follow this flag,
   * because structured data has to describe what a visitor can actually see —
   * emitting these questions to schema after taking them off the page would be
   * exactly the mismatch the note above `faqNode` was written to prevent.
   */
  const SHOW_QUICK_ANSWERS: boolean = false;
  const numbers = [
    { value: '3+', label: 'Years of web development & SEO experience' },
    { value: '2+', label: 'Years of focused ecommerce growth experience' },
    { value: '1+', label: 'Years in Meta & Google Ads' },
    { value: '3', label: 'Ecommerce brands built' },
    { value: '100%', label: 'Client satisfaction rate' },
  ];
  const growthSummary =
    'I help ecommerce businesses in Nepal grow through SEO, conversion-focused websites, and Meta & Google Ads. I build stores that attract more traffic, turn visitors into customers, and improve revenue with data-driven growth strategies.';

  /**
   * The FAQ as structured data, built from the same two arrays the page
   * renders below — the static seven in the `FAQ` section and, while
   * `SHOW_QUICK_ANSWERS` is on, the admin's target-keyword questions in the
   * `FaqBlock` — so the questions a search engine reads are the ones a
   * visitor can actually see. See `faqPageNode` for why that is one node
   * rather than two that have to be kept in step.
   *
   * Emitted here rather than in `SiteJsonLd`, which is mounted site-wide: the
   * FAQ text only appears on this page, and a `FAQPage` node on a page with no
   * visible FAQ is a claim the page does not support.
   */
  const faqNode = faqPageNode(SHOW_QUICK_ANSWERS ? [...faqs, ...quickAnswers] : faqs, site.url);

  /**
   * The `ProfilePage` node, carrying the properties only a page has: an
   * `abstract` (the admin's `ai_answer`, which is the paragraph answer engines
   * quote when asked who Dipendra is) and `about`/`mainEntity`, which tie the
   * page to `#person` and to the knows-about terms in `entity_signals`.
   *
   * `ProfilePage` rather than a bare `WebPage`: this route is the person's
   * main landing — name, work, experience, contact — and its main entity is
   * `#person`, which is the shape `ProfilePage` exists to describe. It stays a
   * `WebPage` in every other respect (same `@id` family, same properties), so
   * nothing is lost for consumers that only look for `WebPage`.
   *
   * The home route never published one before, so its most quotable content
   * existed only as prose. Returns `undefined` with no row and no database,
   * and the caller spreads it conditionally — a page node restating the URL
   * and nothing else is markup that asserts nothing.
   */
  const pageNode = webPageNode({
    url: `${site.url}/`,
    name: 'Ecommerce Specialist in Nepal',
    mainEntityId: personId,
    signals: seoMeta?.entitySignals,
    aiAnswer: answerBlock,
    type: 'ProfilePage',
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
    /**
     * The admin's per-page custom nodes. Every other content route merges
     * these (`blog/[slug]`, `services/[slug]`, `work/[slug]`) — the home route
     * was the one that never did, so its `custom_json_ld` (the `serviceType`
     * list on the `ProfessionalService`) was saved, editable, and emitted to
     * nobody. Merged here with the site-wide `#service` node's `@id`, so the
     * two union into one entity instead of reading as two businesses.
     */
    ...customJsonLdNodes(seoMeta?.customJsonLd),
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
      {answerBlock || (SHOW_QUICK_ANSWERS && quickAnswers.length) ? (
        <section className="border-t border-line bg-subtle py-14 md:py-16">
          <Container>
            <div className="flex flex-col gap-10">
              {answerBlock ? (
                <div className="max-w-3xl">
                  <AnswerBlock answer={answerBlock} />
                </div>
              ) : null}

              {SHOW_QUICK_ANSWERS && quickAnswers.length ? (
                <div className="max-w-3xl">
                  <FaqBlock faqs={quickAnswers} title="Quick answers" />
                </div>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {/*
        The numbers band. The redesign turns the five cards into one editorial
        strip: an oversized statement line on the left, the figures in a
        hairline-divided row beneath it, and the summary paragraph set as a
        lead with the coral rule — no boxes at all. The band's `bg-paper`
        against the subtle answer block above is what separates the two.
      */}
      <section className="border-t border-line bg-paper py-16 md:py-20">
        <Container>
          <div className="flex flex-col gap-10">
            <p className="max-w-4xl text-balance font-display text-[clamp(2rem,3.8vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink">
              Ecommerce growth specialist in Nepal, by the numbers.
            </p>

            <ul className="grid grid-cols-2 border-t border-line md:grid-cols-3 xl:grid-cols-5">
              {numbers.map((item) => (
                <li
                  key={item.label}
                  className="border-b border-line px-1 py-6 xl:border-b-0 xl:border-r xl:border-line xl:px-6 xl:py-2 xl:last:border-r-0 xl:first:pl-0"
                >
                  <div className="font-display text-[clamp(2.25rem,3.4vw,3.75rem)] font-semibold leading-none tracking-[-0.03em] text-accent">
                    {item.value}
                  </div>
                  <div className="mt-3 max-w-[20ch] text-[0.78rem] font-medium uppercase leading-snug tracking-[0.1em] text-muted">
                    {item.label}
                  </div>
                </li>
              ))}
            </ul>

            <p className="max-w-4xl border-l-2 border-marigold pl-5 text-lead text-ink md:pl-6">
              {growthSummary}
            </p>
          </div>
        </Container>
      </section>

      <Introduction />
      <Projects data={projects} />
      <Stats serviceCount={services.length} />
      <Services data={services} />
      <Approach />
      <Technologies />
      <Experience data={experience} />
      <Blog data={posts} />
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
     * these two. The title carries the two primary target queries verbatim
     * ("Ecommerce Specialist in Nepal", "Ecommerce Expert in Nepal") in the
     * order a searcher reads them, and stays inside the 72-character display
     * limit; the description answers with the role, the place (Nepal and
     * Kathmandu), and what the work actually is.
     */
    title: 'Ecommerce Specialist in Nepal | Ecommerce Expert in Nepal',
    description:
      'Dipendra Guragain is an ecommerce specialist in Nepal and an e-commerce expert in Kathmandu helping online stores grow with SEO, Google Ads, Meta Ads and CRO.',
  };
  const merged = withSeoMeta(fallbackHomeMeta, meta);
  const enforced = {
    ...merged,
    title: fallbackHomeMeta.title,
    description: fallbackHomeMeta.description,
  };
  return buildMetadata(enforced, await getSiteSettings());
}
