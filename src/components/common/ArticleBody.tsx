import Link from 'next/link';
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
 * Inline marks inside a paragraph or list item: `**bold**` and `[label](href)`.
 *
 * The long-form guides were written in a template that leans on both — a
 * bolded lead-in per step, and keyword-anchored links into the service pages —
 * and neither could be expressed before this: HTML tags in a block render as
 * escaped text (or as a `<pre>` when the block starts with `<`), and there was
 * no link syntax at all. Supporting the two, and only the two, keeps the
 * renderer's vocabulary as small as the block parser's.
 *
 * Existing posts contain neither mark — verified against both `src/data/blog.ts`
 * and the live `posts` rows — so parsing is a no-op for everything published
 * before this change.
 */
type Inline =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'link'; label: string; href: string };

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

function parseInline(text: string): Inline[] {
  if (!text.includes('[') && !text.includes('*')) return [{ kind: 'text', value: text }];

  const parts: Inline[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push({ kind: 'text', value: text.slice(cursor, start) });

    const token = match[0];
    if (token.startsWith('**')) {
      parts.push({ kind: 'bold', value: token.slice(2, -2) });
    } else {
      const close = token.indexOf('](');
      parts.push({
        kind: 'link',
        label: token.slice(1, close),
        href: token.slice(close + 2, -1),
      });
    }
    cursor = start + token.length;
  }

  if (cursor < text.length) parts.push({ kind: 'text', value: text.slice(cursor) });
  return parts;
}

/**
 * Renders the parsed marks.
 *
 * Internal paths go through `next/link` so a reader stays in the app; absolute
 * `http(s)` links open in a new tab, which is the convention everywhere else on
 * the site. Anything else — `tel:`, `mailto:` — is a plain anchor, because
 * opening the dialer or the mail client in a new tab buys nothing.
 *
 * The underline rather than a colour block: inside a `text-muted` paragraph a
 * link has to announce itself as one without shouting, and this is the exact
 * treatment the About and Services pages already give inline links.
 */
function renderInline(parts: Inline[], prefix: string) {
  const linkClass =
    'text-ink underline decoration-line underline-offset-2 transition-colors hover:text-accent';

  return parts.map((part, index) => {
    const key = `${prefix}-${index}`;

    if (part.kind === 'bold') {
      return (
        <strong key={key} className="font-semibold text-ink">
          {part.value}
        </strong>
      );
    }

    if (part.kind === 'link') {
      if (part.href.startsWith('/')) {
        return (
          <Link key={key} href={part.href} className={linkClass}>
            {part.label}
          </Link>
        );
      }

      const external = /^https?:\/\//.test(part.href);
      return (
        <a
          key={key}
          href={part.href}
          className={linkClass}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {part.label}
        </a>
      );
    }

    return <span key={key}>{part.value}</span>;
  });
}

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
 * - `**bold**` and `[label](href)` inside a block -> `<strong>` and an anchor
 * - everything else -> paragraph
 *
 * On the links: a path starting with `/` renders through `next/link` and stays
 * in the app, an absolute `http(s)` URL opens in a new tab, and `tel:`/`mailto:`
 * are left as plain anchors. That split is what lets an article carry
 * keyword-anchored links into `/services/...` — which is the internal linking
 * the SEO brief asks for — without every outbound citation stealing the tab.
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
              <h2 className="mt-4 max-w-2xl font-display text-h3">
                {renderInline(parseInline(segment.text), `h2-${index}`)}
              </h2>
            ) : (
              <h3 className="mt-2 max-w-2xl font-display text-lg font-semibold tracking-tight">
                {renderInline(parseInline(segment.text), `h3-${index}`)}
              </h3>
            )
          ) : segment.kind === 'list' ? (
            <ul className="max-w-2xl list-disc space-y-2 pl-5">
              {segment.items.map((item, itemIndex) => (
                <li key={itemIndex} className="leading-relaxed text-muted">
                  {renderInline(parseInline(item), `li-${index}-${itemIndex}`)}
                </li>
              ))}
            </ul>
          ) : segment.kind === 'code' ? (
            <pre className="mt-2 max-w-2xl overflow-x-auto rounded-card border border-line bg-ink p-4 text-sm leading-6 text-paper shadow-sm">
              <code className="whitespace-pre-wrap break-words font-mono">{segment.text}</code>
            </pre>
          ) : (
            <p className="max-w-2xl leading-relaxed text-muted">
              {renderInline(parseInline(segment.text), `p-${index}`)}
            </p>
          )}
        </Reveal>
      ))}
    </div>
  );
}
