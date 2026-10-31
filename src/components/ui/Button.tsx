import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'inverse' | 'secondary' | 'outline' | 'ghost' | 'whatsapp';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  showArrow?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  /** Force a new tab for external URLs (defaults to true for http(s) hrefs). */
  external?: boolean;
}

/**
 * Outline colour lives on the variant, not in the base: `outline-accent` and
 * `outline-ink` are both plain `outline-color` utilities, so which one wins
 * would depend on Tailwind's internal ordering rather than the order they
 * appear in the class string.
 *
 * `primary` is the green, and it is the only variant that should ever appear
 * twice in one viewport. `secondary` is its outlined twin — a white fill with a
 * green border, for the lower-priority half of a pair (the brief's "one primary
 * button and one text link" is the `primary` + `ghost` case; a genuinely
 * two-button row is `primary` + `secondary`).
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-on-accent hover:bg-accent-strong focus-visible:outline-ink',
  inverse: 'bg-ink text-paper hover:opacity-85 focus-visible:outline-accent',
  secondary:
    'border border-accent bg-surface text-accent hover:bg-accent-soft focus-visible:outline-accent',
  outline:
    'border border-line-strong text-ink hover:border-accent hover:text-accent focus-visible:outline-accent',
  ghost:
    'px-0 text-accent underline-offset-4 hover:underline hover:text-accent-strong focus-visible:outline-accent',
  whatsapp:
    'bg-whatsapp text-whatsapp-ink hover:bg-whatsapp-hover focus-visible:outline-ink',
};

/**
 * Every size clears 44px on its short edge, which is WCAG 2.5.5's target size
 * and roughly a fingertip.
 *
 * `sm` was previously `h-9` (36px) and is the one that actually mattered — it is
 * the size the navigation and every card CTA use, so the smallest, most-tapped
 * control on the site was also the only one under the threshold. The visual
 * weight is recovered with horizontal padding rather than height: a pill that
 * is wide and short reads as small, and one that is wide and 44px tall reads as
 * a button.
 *
 * `ghost` is exempt by design — it renders as plain text, and its hit area is
 * its own line box. Where a ghost sits next to a primary button the row's
 * height is already set by the button beside it.
 */
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-11 gap-1.5 px-5 text-sm',
  md: 'h-12 gap-2 px-6 text-[15px]',
  lg: 'h-14 gap-2 px-7 text-base',
};

export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  showArrow = false,
  className,
  type = 'button',
  disabled = false,
  onClick,
  ariaLabel,
  external,
}: ButtonProps) {
  const classes = cn(
    'group inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 ease-out active:scale-[0.98]',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-60',
    variantClasses[variant],
    variant === 'ghost' ? 'h-11 text-[15px]' : sizeClasses[size],
    className,
  );

  // External hrefs (WhatsApp, mailto, any absolute URL) open in a new tab with
  // the opener stripped. Internal routes stay in-tab — a middle-click or
  // Ctrl-click still works either way, since this only sets the default.
  const isExternal = external ?? /^https?:\/\//.test(href ?? '');

  const arrow = showArrow ? (
    <ArrowRight
      size={16}
      strokeWidth={2}
      aria-hidden
      className="transition-transform duration-200 ease-out group-hover:translate-x-1"
    />
  ) : null;

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-label={ariaLabel}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {children}
        {arrow}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={classes}
    >
      {children}
      {arrow}
    </button>
  );
}
