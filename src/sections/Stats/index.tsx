import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { experience } from '@/data/experience';
import { projects } from '@/data/projects';
import { services } from '@/data/services';

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
export function Stats() {
  const months = clientMonths();

  const stats = [
    {
      value: String(projects.filter((project) => !project.isPlaceholder).length),
      label: 'Case studies, written up in full',
    },
    {
      value: String(services.length),
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
    <Section id="numbers" padded={false} className="bg-subtle">
      <Container>
        {/*
          A plain list, not a `<dl>`.

          A definition list would be the tempting choice here, but the visual
          order is number-then-label while a `<dl>` requires `dt` before `dd` —
          so getting the semantics right meant either reversing the visual order
          or hiding a duplicate `<dt>` and having a screen reader hear every
          label twice. Neither is worth it: there is no term being defined, just
          four figures and what they count, which is a list.
        */}
        <ul className="grid grid-cols-2 gap-y-10 py-14 md:py-16 lg:grid-cols-4 lg:gap-y-0">
          {stats.map((stat, index) => (
            <Reveal
              key={stat.label}
              as="li"
              delay={index * 0.06}
              className="border-line px-1 lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pl-0"
            >
              {/* `font-display` and no tracking override — Fraunces at 600 is
                  the only place on this page a number is the loudest thing, and
                  optical sizing handles the pairing with the label. */}
              <span className="block font-display text-5xl font-semibold leading-none text-ink md:text-6xl">
                {stat.value}
              </span>
              <span className="mt-3 block max-w-[22ch] text-sm leading-relaxed text-muted">
                {stat.label}
              </span>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
