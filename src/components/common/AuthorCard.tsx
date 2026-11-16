import Image from 'next/image';
import Link from 'next/link';
import { SocialIcon } from '@/components/common/SocialIcon';
import { profile } from '@/data/profile';
import type { SocialLinks as SocialLinksType } from '@/types';

const socialLinks: Array<{
  href: string;
  network: keyof SocialLinksType;
  label: string;
}> = [
  { href: profile.socialLinks.instagram ?? 'https://www.instagram.com/', network: 'instagram', label: 'Instagram' },
  { href: profile.socialLinks.linkedin ?? 'https://www.linkedin.com/', network: 'linkedin', label: 'LinkedIn' },
  { href: profile.socialLinks.x ?? 'https://x.com/', network: 'x', label: 'X' },
];

export function AuthorCard() {
  return (
    <aside
      className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-9 md:gap-10"
      aria-label={`About ${profile.name}`}
    >
      <div className="relative shrink-0 self-start">
        <div className="absolute -left-2 top-3 h-7 w-14 rotate-[-9deg] rounded-[2px] bg-[#e9dfbf]/90 shadow-[0_1px_0_rgba(15,23,42,0.08)]" />
        <div className="relative overflow-hidden rounded-[16px] border border-[#d9d9d0] bg-[#f7f3ed] p-2.5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <Image
            src={profile.avatar}
            alt=""
            width={260}
            height={260}
            className="h-[255px] w-[255px] rounded-[12px] border border-[#ebeae6] object-cover object-center shadow-inner"
          />
        </div>
      </div>

      <div className="min-w-0 flex-1 pt-1">
        <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.28em] text-[#1f2937]">
          Article by
        </p>

        <h2 className="mt-2 text-[2.8rem] font-black leading-[0.96] tracking-[-0.06em] text-ink sm:text-[3.2rem]">
          {profile.name}
        </h2>

        <p className="mt-3 font-mono text-[0.76rem] font-medium uppercase tracking-[0.24em] text-[#df6d42]">
          {profile.title}
        </p>

        <p className="mt-5 max-w-[700px] text-[1.12rem] leading-[1.65] text-[#1f2937] sm:text-[1.3rem]">
          {profile.description}
        </p>

        <div className="mt-7 flex items-center gap-4">
          {socialLinks.map(({ href, network, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d9d5d0] bg-[#f8f6f3] text-[#0f172a] transition-colors duration-200 hover:border-[#b9b7b1] hover:bg-white"
            >
              <SocialIcon network={network} size={18} />
            </a>
          ))}

          <Link
            href="/about"
            className="ml-2 inline-flex items-center justify-center rounded-full border border-[#d9d5d0] bg-[#f8f6f3] px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#1f2937] transition-colors duration-200 hover:border-[#b9b7b1] hover:bg-white"
          >
            About me
          </Link>
        </div>
      </div>
    </aside>
  );
}
