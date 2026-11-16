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

type Segment =
  | { kind: 'heading'; level: 2 | 3; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'code'; text: string }
  | { kind: 'paragraph'; text: string };

/**
 * Turns the flat block array into renderable segments.
 *
 * The data stays one string per block — see the conventions note on
 * `blogPosts` — so a list is not one block but a run of blocks that each start
 * with a bullet marker. The grouping happens here rather than in the data so
 * the admin editor keeps showing one line per item, the same way
 * `parseDetailBlock` does on the case-study pages.
 *
 * `### ` sits one level below the `## ` h2. The long-form guide posts use it
 * for a sub-section inside a step (a "how to choose" heading under a larger
 * "what this role does" section), where promoting it to an h2 would flatten a
 * hierarchy the outline actually has.
 */
function parseSegments(content: string[]): Segment[] {
  const segments: Segment[] = [];
  let items: string[] = [];

  const flushList = () => {
    if (items.length > 0) {
      segments.push({ kind: 'list', items });
      items = [];
    }
  };

  for (const block of content) {
    if (block.startsWith('### ')) {
      flushList();
      segments.push({ kind: 'heading', level: 3, text: block.slice(4).trim() });
      continue;
    }

    if (block.startsWith('## ')) {
      flushList();
      segments.push({ kind: 'heading', level: 2, text: block.slice(3).trim() });
      continue;
    }

    const bullet = block.match(/^[•*-]\s+(.+)$/);
    if (bullet) {
      // No flush here: consecutive bullets are one list. The heading and
      // paragraph branches above flush first, which is what ends a run.
      items.push(bullet[1].trim());
      continue;
    }

    flushList();

    if (isCodeBlock(block)) {
      segments.push({ kind: 'code', text: getCodeContent(block) });
    } else {
      segments.push({ kind: 'paragraph', text: block });
    }
  }

  flushList();
  return segments;
}

/**
 * Renders article content while preserving markdown-like headings, lists and code snippets.
 *
 * The site content is stored as a flat `text[]` array, so we use a few small
 * conventions to keep it readable in both the admin editor and the browser:
 *
 * - `## ` -> `<h2>`
 * - `### ` -> `<h3>`
 * - runs of `• `-prefixed blocks -> one `<ul>`
 * - fenced code blocks (```...) and HTML snippets -> `<pre><code>`
 * - everything else -> paragraph
 */
export function ArticleBody({ content }: { content: string[] }) {
  const segments = parseSegments(content);

  return (
    <div className="flex flex-col gap-6">
      {segments.map((segment, index) => (
        <Reveal key={`${index}-${segment.kind}`} delay={Math.min(index, 4) * 0.05}>
          {segment.kind === 'heading' ? (
            segment.level === 2 ? (
              // `mt-4` on top of the flex gap: a heading needs more air above it
              // than the gap between two paragraphs, or it reads as belonging to
              // the paragraph before it rather than the one after.
              <h2 className="mt-4 max-w-2xl text-h3">{segment.text}</h2>
            ) : (
              <h3 className="mt-2 max-w-2xl text-lg font-medium tracking-tight">
                {segment.text}
              </h3>
            )
          ) : segment.kind === 'list' ? (
            <ul className="max-w-2xl list-disc space-y-2 pl-5">
              {segment.items.map((item, itemIndex) => (
                <li key={itemIndex} className="leading-relaxed text-muted">
                  {item}
                </li>
              ))}
            </ul>
          ) : segment.kind === 'code' ? (
            <pre className="mt-2 max-w-2xl overflow-x-auto rounded-xl border border-border bg-slate-950 p-4 text-sm leading-6 text-slate-100 shadow-sm">
              <code className="whitespace-pre-wrap break-words font-mono">{segment.text}</code>
            </pre>
          ) : (
            <p className="max-w-2xl leading-relaxed text-muted">{segment.text}</p>
          )}
        </Reveal>
      ))}
    </div>
  );
}
