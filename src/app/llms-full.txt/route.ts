import { profile } from '@/data/profile';
import { site } from '@/data/seo';
import { getServices } from '@/lib/content';

/**
 * `/llms-full.txt` — the long companion to `/llms.txt`.
 *
 * `/llms.txt` is an index of one-line summaries. This file carries the full
 * service copy (answer block, capabilities and long-form body) so a model that
 * chooses to read it does not have to crawl every page. Built from the same
 * `getServices()` read the pages use, so it cannot drift from them. Like
 * `llms.txt`, it is a convenience, not a ranking factor.
 */
export const dynamic = 'force-static';

export async function GET() {
  const services = await getServices();

  const sections = services.map((s) => {
    const body = (s.body ?? [])
      .map((b) => `### ${b.heading}\n\n${b.paragraphs.join('\n\n')}`)
      .join('\n\n');

    return [
      `## ${s.title}`,
      `URL: ${site.url}/services/${s.slug}`,
      s.description,
      s.capabilities.length
        ? `Capabilities:\n${s.capabilities.map((c) => `- ${c}`).join('\n')}`
        : '',
      body,
    ]
      .filter(Boolean)
      .join('\n\n');
  });

  const text = `# ${profile.name}

> ${profile.title}. Based in ${profile.location}.

${profile.description}

Contact: ${profile.email} · WhatsApp ${profile.whatsapp}

${sections.join('\n\n---\n\n')}
`;

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate',
    },
  });
}
