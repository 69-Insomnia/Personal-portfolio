import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'inverse' | 'outline' | 'ghost' | 'whatsapp';
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
 */
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-strong focus-visible:outline-ink',
  inverse: 'bg-ink text-paper hover:opacity-85 focus-visible:outline-accent',
  outline:
    'border border-line text-ink hover:border-ink hover:bg-surface focus-visible:outline-accent',
  ghost: 'text-ink hover:text-accent focus-visible:outline-accent',
  whatsapp:
    'bg-whatsapp text-whatsapp-ink hover:bg-whatsapp-hover focus-visible:outline-ink',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 px-4 text-sm',
  md: 'h-11 gap-2 px-5 text-base',
  lg: 'h-12 gap-2 px-6 text-base md:h-[3.375rem] md:px-7',
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
    'group inline-flex items-center justify-center rounded-full font-medium tracking-tight transition-all duration-300 ease-out active:scale-[0.98]',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-60',
    variantClasses[variant],
    sizeClasses[size],
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
      className="transition-transform duration-300 ease-out group-hover:translate-x-1"
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
