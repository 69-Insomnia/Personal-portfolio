import { Reveal } from '@/components/ui/Reveal';

/**
 * Renders an article body, promoting entries that begin with `## ` to `<h2>`.
 *
 * The posts shipped as roughly 350 words of unbroken prose — a single flat list
 * of paragraphs with no subheadings anywhere. That costs two things at once.
 * For a reader, a wall of text with no signposts is harder to scan and easier
 * to abandon. For anything trying to quote the page — a featured snippet, an AI
 * answer, a reader who has already skimmed — there is no structure to chunk on,
 * so the only extractable units are the paragraphs, pulled out of context.
 *
 * The convention is a marker in the string rather than a new field on the type
 * because the body is stored as `text[]` in Postgres and rendered from the
 * same shape in both the static data file and the CMS. A heading level is not
 * worth a migration and a second editor control.
 *
 * Anything else stays a paragraph, so an existing body with no markers renders
 * exactly as it did before.
 */
export function ArticleBody({ content }: { content: string[] }) {
  return (
    <div className="flex flex-col gap-6">
      {content.map((block, index) => {
        const heading = block.startsWith('## ') ? block.slice(3).trim() : null;

        return (
          <Reveal key={`${index}-${block.slice(0, 24)}`} delay={Math.min(index, 4) * 0.05}>
            {heading ? (
              // `mt-4` on top of the flex gap: a heading needs more air above it
              // than the gap between two paragraphs, or it reads as belonging to
              // the paragraph before it rather than the one after.
              <h2 className="mt-4 max-w-2xl text-h3">{heading}</h2>
            ) : (
              <p className="max-w-2xl leading-relaxed text-muted">{block}</p>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}
