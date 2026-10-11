import type { SeoFaq, SeoStat } from '@/types';

/**
 * The three content blocks that back the GEO / LLMO fields.
 *
 * All three render from `seo_meta` — the same overlay every page already loads
 * through `getSeo` — which is why one implementation serves services, blog
 * posts, project case studies and the static pages equally.
 *
 * ## Why none of them is animated, and why the FAQ is not `FAQItem`
 *
 * The site's existing FAQ renders through `FAQItem`, which mounts its answer
 * inside an `AnimatePresence` branch that only resolves when the item is open.
 * That is the right call for a UI accent and the wrong one here: a closed
 * answer is *absent from the DOM*, so a crawler that does not run JavaScript
 * sees the question and never the answer. The whole purpose of these blocks is
 * to be extracted by exactly those crawlers.
 *
 * So `FaqBlock` uses native `<details>`/`<summary>` instead. The content is in
 * the markup whether or not it is expanded, the disclosure works with no
 * JavaScript at all, and the browser supplies the keyboard and screen-reader
 * semantics for free. `StatBlock` and `AnswerBlock` have nothing to collapse
 * and are plain server-rendered markup.
 */

/**
 * The passage written to be quoted.
 *
 * Rendered as a distinct block rather than folded into the page's prose,
 * because that is what it is: the one paragraph on the page written to survive
 * being lifted out with no surrounding context. `text-lead` and the left rule
 * mark it as the answer without claiming to be a heading.
 */
export function AnswerBlock({ answer }: { answer?: string }) {
  if (!answer) return null;

  return (
    <div className="border-l-2 border-accent pl-6">
      <p className="max-w-2xl text-lead text-ink">{answer}</p>
    </div>
  );
}

/**
 * Sourced statistics.
 *
 * `source` is rendered whenever it exists, and the number is rendered exactly
 * as entered — no reformatting, because a statistic that has been quietly
 * rounded is no longer the figure the source published. The attribution uses
 * `<cite>`, which is what that element is for.
 *
 * A statistic with no source still renders. The audit's complaint was that the
 * site published no numbers at all, and refusing to show an unsourced one would
 * keep that true; the admin panel nudges for a source instead, which is where
 * that decision belongs.
 */
export function StatBlock({ stats }: { stats?: SeoStat[] }) {
  if (!stats?.length) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {stats.map((stat) => (
        <li key={`${stat.value}-${stat.label}`} className="border border-line bg-paper p-5">
          <p className="text-h3 text-ink">{stat.value}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{stat.label}</p>
          {stat.source ? (
            <p className="mt-3 text-xs text-faint">
              <cite className="not-italic">
                {stat.url ? (
                  <a
                    href={stat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-line underline-offset-2 transition-colors hover:text-ink"
                  >
                    {stat.source}
                  </a>
                ) : (
                  stat.source
                )}
              </cite>
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * Page-level questions and answers, as content.
 *
 * Deliberately **not** wrapped in `FAQPage` schema — Google retired FAQ rich
 * results for all sites on 2026-05-07, and `src/lib/structured-data.ts` already
 * documents why that node is absent from the graph. What is left is the part
 * that works: a question-shaped heading with a self-contained answer under it
 * is the shape answer engines extract, whether or not a rich result is attached.
 *
 * `<h3>` inside `<summary>` rather than a bare `<summary>`, so the questions
 * join the page's heading outline and a retrieval system can chunk on them.
 */
export function FaqBlock({
  faqs,
  title,
}: {
  faqs?: SeoFaq[];
  title?: string;
}) {
  if (!faqs?.length) return null;

  return (
    <div>
      {title ? <h2 className="text-h3">{title}</h2> : null}
      <div className="mt-6 divide-y divide-line border-y border-line">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-2">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 text-left">
              <h3 className="text-lg font-medium tracking-tight transition-colors duration-300 group-hover:text-accent md:text-xl">
                {faq.question}
              </h3>
              <span
                aria-hidden
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors duration-300 group-open:border-accent group-open:bg-accent group-open:text-on-accent"
              >
                <span className="text-base leading-none group-open:hidden">+</span>
                <span className="hidden text-base leading-none group-open:block">−</span>
              </span>
            </summary>
            <p className="max-w-3xl pb-5 text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
