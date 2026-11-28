import { Container } from '@/components/ui/Container';
import { CountUp } from '@/components/ui/CountUp';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { experience } from '@/data/experience';
import { projects } from '@/data/projects';

/**
 * Months of client work, derived from the `period` strings on the experience
 * entries rather than typed as a literal.
 *
 * The parser is deliberately narrow — it reads "1 Year" and "6 Months" and
 * returns `null` for anything it does not recognise, including a date range
 * like "2023 – 2024". A stat that silently counts wrong is worse than one that
 * does not appear, so an unparseable period drops the figure rather than
 * guessing at it through a year subtraction.
 */
function clientMonths(): number | null {
  let months = 0;
  let matched = false;

  for (const item of experience) {
    if (item.isPlaceholder) continue;
    const years = /(\d+)\s*year/i.exec(item.period);
    const mo = /(\d+)\s*month/i.exec(item.period);
    if (!years && !mo) continue;
    matched = true;
    months += years ? Number(years[1]) * 12 : 0;
    months += mo ? Number(mo[1]) : 0;
  }

  return matched && months > 0 ? months : null;
}

/**
 * The proof strip.
 *
 * ## Every number here is computed, not typed
 *
 * Each figure is read off the same arrays the rest of the page renders, so it
 * cannot drift out of step with the content the way a hand-written "50+
 * projects" does the moment a project is unpublished. If a count is zero — or,
 * for the duration, unparseable — that stat is dropped and the strip renders
 * short rather than rendering a lie.
 *
 * ## What is deliberately NOT here
 *
 * No revenue figures, no traffic lifts, no client-satisfaction percentages, no
 * "3x ROI". This is a portfolio selling measurement, and an unsourced
 * performance claim is the first thing a careful buyer checks and the fastest
 * way to lose the room. The counts below describe *the site you are looking
 * at*, which is the one thing it can prove from where it stands.
 *
 * See the note in the handoff for where stronger numbers should go once real
 * outcomes exist to back them.
 */
export function Stats({ serviceCount }: { serviceCount: number }) {
  const months = clientMonths();

  const stats = [
    {
      value: String(projects.filter((project) => !project.isPlaceholder).length),
      label: 'Case studies, written up in full',
    },
    {
      // Passed in from the home page's `getServices()` read — the database
      // count, not `src/data/services.ts`'s. The file ships twelve records
      // (seven live services plus five URL-variant rows), so reading it here
      // published a number the site's own /services grid contradicted.
      value: String(serviceCount),
      label: 'Services, from storefront to paid media',
    },
    {
      value: String(experience.filter((item) => !item.isPlaceholder).length),
      label: 'Client engagements, from first brief to launch',
    },
    ...(months
      ? [
          {
            // Rounded down to whole years once past 12 months: "18 months" reads
            // as a precise claim, "1 year and 6 months" as a résumé line.
            value: months >= 12 ? `${Math.floor(months / 12)}+` : String(months),
            label: months >= 12 ? 'Years of client work' : 'Months of client work',
          },
        ]
      : []),
  ];

  return (
    <Section id="numbers" padded={false} className="section-inverse relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 80% at 85% 0%, rgba(190, 242, 100, 0.10), transparent 70%), radial-gradient(40% 70% at 0% 100%, rgba(16, 185, 129, 0.14), transparent 70%)',
        }}
      />
      <Container className="relative">
        {/* A plain list: four figures and what they count. Bento cards on a
            charcoal band; the figures count up once on view (CountUp renders
            the final value on the server). */}
        <ul className="grid grid-cols-2 gap-3 py-16 md:gap-4 md:py-20 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal
              key={stat.label}
              as="li"
              delay={index * 0.06}
              className="group relative flex min-h-[11rem] flex-col justify-between overflow-hidden rounded-[1.25rem] border border-line bg-surface p-5 transition-colors duration-300 hover:border-accent md:min-h-[13rem] md:p-7"
            >
              <span
                aria-hidden
                className="absolute right-5 top-5 h-2 w-2 rounded-full bg-marigold opacity-70 transition-opacity duration-300 group-hover:opacity-100"
              />
              <CountUp
                value={stat.value}
                className="block font-display text-[clamp(2.75rem,5vw,4.25rem)] font-semibold leading-none tracking-[-0.04em] text-ink tabular-nums"
              />
              <span className="mt-6 block max-w-[22ch] text-sm leading-relaxed text-muted">
                {stat.label}
              </span>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
