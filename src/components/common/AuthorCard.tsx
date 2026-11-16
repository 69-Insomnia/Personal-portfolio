import Image from 'next/image';
import Link from 'next/link';
import { profile } from '@/data/profile';

/**
 * The author card that closes every article.
 *
 * The byline at the top answers "who wrote this" in one line; this answers it
 * properly at the moment a reader finishes — face, role, what the writing is
 * based on, and the paths off the page (about, profiles). It sits at the end
 * of the article column, after the FAQ and before the related blocks, which
 * is where a reader decides whether to trust the next recommendation.
 *
 * The layout follows the reference the owner supplied (avatar left; label,
 * name, role, bio and pill links right) but is built from this site's own
 * tokens: `.card` for the surface, chip-shaped pills, `text-micro` at the
 * reference's wide tracking for the two mono lines. The label is the one red
 * (`text-danger`) on an otherwise blue-and-white page — that contrast is
 * what makes it read as a stamp rather than as another section eyebrow.
 *
 * The role line is deliberately not `profile.title` ("Ecommerce Growth
 * Expert"): the owner asked for "Ecommerce Specialist in Nepal" here — the
 * phrasing readers search with — while the navbar keeps the short micro-type.
 *
 * The avatar carries an empty `alt` for the same reason the byline's does:
 * the name sits right beside it, and a screen reader announcing it twice is
 * noise, not description.
 */
const links = [
  { label: 'About me', href: '/about' },
  ...(profile.socialLinks.linkedin
    ? [{ label: 'LinkedIn', href: profile.socialLinks.linkedin }]
    : []),
  ...(profile.socialLinks.github
    ? [{ label: 'GitHub', href: profile.socialLinks.github }]
    : []),
  ...(profile.socialLinks.facebook
    ? [{ label: 'Facebook', href: profile.socialLinks.facebook }]
    : []),
];

export function AuthorCard() {
  const pillClass =
    'rounded-full border border-line px-4 py-2 font-mono text-label text-muted transition-colors duration-300 hover:border-line-strong hover:text-ink';

  return (
    <aside className="card p-7 md:p-9" aria-label={`About ${profile.name}`}>
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-7">
        <Image
          src={profile.avatar}
          alt=""
          width={80}
          height={80}
          className="h-20 w-20 shrink-0 self-start rounded-2xl border border-line object-cover"
        />
        <div className="min-w-0">
          <p className="font-mono text-micro font-medium uppercase tracking-[0.16em] text-danger">
            Written by
          </p>
          <h2 className="mt-1.5 text-h3">{profile.name}</h2>
          <p className="mt-1.5 font-mono text-micro uppercase tracking-[0.14em] text-faint">
            Ecommerce Specialist in Nepal
          </p>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            I run ecommerce SEO and paid growth for online stores, and I build the
            stores and tools the campaigns depend on. Everything on this blog is
            based on work on live accounts. I do not write from benchmark reports.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {links.map((link) =>
              link.href.startsWith('http') ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={pillClass}
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} href={link.href} className={pillClass}>
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
