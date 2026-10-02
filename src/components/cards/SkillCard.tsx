'use client';

import { Icon } from '@/components/common/Icon';
import type { IconName } from '@/types';

interface SkillCardProps {
  title: string;
  icon?: IconName;
  index?: string;
}

/**
 * A capability label. Not a control.
 *
 * This used to carry `card-interactive`, which lifts the card and flashes a
 * near-white border on hover — a promise that clicking does something. Nothing
 * on this site wraps a SkillCard in a link, so every one of them was lying.
 * The `group-hover` accent shift on the icon and text is kept: it reads as
 * emphasis on hover rather than as affordance, because nothing moves.
 */
export function SkillCard({ title, icon, index }: SkillCardProps) {
  return (
    <li className="card group flex items-center gap-3 px-4 py-3">
      {icon ? (
        <Icon
          name={icon}
          size={15}
          className="shrink-0 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-accent"
        />
      ) : null}
      {index ? (
        <span className="text-label font-semibold text-muted transition-colors duration-300 group-hover:text-accent">
          {index}
        </span>
      ) : null}
      <span className="text-sm font-medium tracking-tight text-ink">{title}</span>
    </li>
  );
}
