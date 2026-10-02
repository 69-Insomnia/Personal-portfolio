import { profile } from '@/data/profile';
import { site } from '@/data/seo';
import { services } from '@/data/services';
import { getPosts, getProjects } from '@/lib/content';

/**
 * `/llms.txt` — a plain-text summary of the site for language models.
 *
 * Worth being straight about what this does: Google Search ignores it, and it
 * is not a ranking factor. It is a convenience for systems that choose to read
 * it, and the honest expectation is that it helps an assistant describe the
 * business accurately if it fetches the file, not that it wins citations on
 * its own. AI citations are driven far more by off-site mentions.
 *
 * Served from a route rather than `public/llms.txt` so the URLs are built from
 * `site.url` and the service and article lists come from the same data the
 * pages render, instead of being a second copy that quietly goes stale.
 */
export const dynamic = 'force-static';

export async function GET() {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);

  const abs = (path: string) => `${site.url}${path}`;

  const body = `# ${profile.name}

> ${profile.title}. Based in ${profile.location}.

${profile.description}

Services are used together far more often than separately, which is the point
of the practice: most problems that arrive looking like four problems turn out
to be one.

## Contact

- Email: ${profile.email}
- WhatsApp: ${profile.whatsapp}
- Location: ${profile.location}
${profile.availability ? `- Availability: ${profile.availabilityText}\n` : ''}
## Services

${services.map((s) => `- [${s.title}](${abs(`/services/${s.slug}`)}): ${s.shortDescription}`).join('\n')}

## Selected work

${projects.map((p) => `- [${p.title}](${abs(`/work/${p.slug}`)}): ${p.description}`).join('\n')}

## Writing

${posts.map((p) => `- [${p.title}](${abs(`/blog/${p.slug}`)}): ${p.excerpt}`).join('\n')}

## Pages

- [Home](${abs('/')})
- [About](${abs('/about')})
- [Work](${abs('/work')})
- [Services](${abs('/services')})
- [Insights](${abs('/blog')})
- [Contact](${abs('/contact')})

## Notes

- Services are available to businesses in Nepal and to international clients
  working remotely.
- Client project pages describe delivered work. Figures are only published
  where they can be stood behind; illustrative interface mockups are labelled
  as such.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate',
    },
  });
}
