import { Reveal } from '@/components/ui/Reveal';

function isCodeBlock(block: string) {
  const trimmed = block.trim();

  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith('```')) {
    return true;
  }

  if (trimmed.startsWith('<') && trimmed.includes('>')) {
    return true;
  }

  return /<\/?[a-zA-Z][\w:-]*\b/.test(trimmed) && /\b(?:class|id|src|href|alt|type|name)\s*=/.test(trimmed);
}

function getCodeContent(block: string) {
  const trimmed = block.trim();

  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```[a-zA-Z0-9_-]*\s*/, '').replace(/\s*```$/, '');
  }

  return trimmed;
}

/**
 * Renders article content while preserving markdown-like headings and code snippets.
 *
 * The site content is stored as a flat `text[]` array, so we use a few small
 * conventions to keep it readable in both the admin editor and the browser:
 *
 * - `## ` -> `<h2>`
 * - fenced code blocks (```...) and HTML snippets -> `<pre><code>`
 * - everything else -> paragraph
 */
export function ArticleBody({ content }: { content: string[] }) {
  return (
    <div className="flex flex-col gap-6">
      {content.map((block, index) => {
        const heading = block.startsWith('## ') ? block.slice(3).trim() : null;
        const codeBlock = !heading && isCodeBlock(block);

        return (
          <Reveal key={`${index}-${block.slice(0, 24)}`} delay={Math.min(index, 4) * 0.05}>
            {heading ? (
              // `mt-4` on top of the flex gap: a heading needs more air above it
              // than the gap between two paragraphs, or it reads as belonging to
              // the paragraph before it rather than the one after.
              <h2 className="mt-4 max-w-2xl text-h3">{heading}</h2>
            ) : codeBlock ? (
              <pre className="mt-2 max-w-2xl overflow-x-auto rounded-xl border border-border bg-slate-950 p-4 text-sm leading-6 text-slate-100 shadow-sm">
                <code className="whitespace-pre-wrap break-words font-mono">{getCodeContent(block)}</code>
              </pre>
            ) : (
              <p className="max-w-2xl leading-relaxed text-muted">{block}</p>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}
