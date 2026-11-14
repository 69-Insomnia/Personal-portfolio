import type { ElementType, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type CardVariant = 'surface' | 'outline' | 'plain';

interface CardProps {
  children: ReactNode;
  /**
   * `surface` — fill + hairline + the one soft shadow. The default, and what a
   *            top-level piece of content wants.
   * `outline` — hairline, no fill. For a card sitting on a white band, where a
   *            white-on-white fill would leave the border doing all the work
   *            anyway.
   * `plain`  — no border, no fill, no shadow. For a card whose parent already
   *            draws a frame.
   */
  variant?: CardVariant;
  /** Adds the hover lift. Only for cards that are links — see below. */
  interactive?: boolean;
  /** Rendered tag. Use `article` / `li` / `figure` when the card has that role. */
  as?: ElementType;
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  /* Routed through the `.card` recipe in globals.css rather than retyping its
     classes here — the recipe is the single source of truth for what a card
     looks like, and this component is its API. */
  surface: 'card',
  outline: 'rounded-card border border-line',
  plain: 'rounded-card',
};

/**
 * The card surface, as a component rather than a class string.
 *
 * `.card` in globals.css already encodes the visual recipe, and this wraps it
 * so the *hover* decision travels with the card instead of being remembered at
 * every call site. The bug that motivated it was real: twenty-four capability
 * chips once carried `card-interactive` and so lifted and flashed a border on
 * hover while doing nothing when clicked — a control promising an action it did
 * not have.
 *
 * `interactive` therefore defaults to FALSE. A card is inert unless it is
 * genuinely a link or button, which means the lift is now something you opt
 * into and can be read off the markup.
 */
export function Card({
  children,
  variant = 'surface',
  interactive = false,
  as: Tag = 'div',
  className,
}: CardProps) {
  return (
    <Tag
      className={cn(
        variantClasses[variant],
        interactive && 'card-interactive',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
