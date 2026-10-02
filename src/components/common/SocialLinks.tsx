import { ArrowUpRight } from 'lucide-react';
import { SocialIcon } from '@/components/common/SocialIcon';
import type { SocialLinks as SocialLinksType } from '@/types';
import { cn } from '@/utils/cn';

const socialLabels: Record<keyof SocialLinksType, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
};

interface SocialLinksProps {
  links: SocialLinksType;
  className?: string;
}

export function SocialLinks({ links, className }: SocialLinksProps) {
  const entries = Object.entries(links).filter(
    ([, href]) => typeof href === 'string' && href.trim().length > 0,
  ) as Array<[keyof SocialLinksType, string]>;

  if (entries.length === 0) {
    return null;
  }

  return (
    <ul className={cn('flex flex-wrap items-center gap-x-6 gap-y-3', className)}>
      {entries.map(([key, href]) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors duration-300 hover:text-accent"
          >
            <SocialIcon network={key} size={15} />
            {socialLabels[key]}
            <ArrowUpRight
              size={13}
              aria-hidden
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
