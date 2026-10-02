'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import type { User } from '@supabase/supabase-js';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';
import { cn } from '@/utils/cn';

/**
 * The admin nav. Dashboard is an exact match; every other entry owns the
 * subtree beneath it, so `/admin/projects/new` still lights up "Projects".
 */
const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/messages', label: 'Messages', badge: true },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/posts', label: 'Posts' },
  { href: '/admin/experience', label: 'Experience' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/services', label: 'Services' },
] as const;

interface AdminShellProps {
  user: User;
  onSignOut: () => void;
  children: ReactNode;
}

/**
 * The signed-in admin chrome: a fixed rail from `lg` up, a collapsible panel
 * below it.
 *
 * The mobile nav is a disclosure panel rather than a modal drawer like the
 * public `MobileMenu`. That component's focus trap works by marking every
 * other child of `<body>` inert, which only holds because it renders the
 * dialog as a direct child of the body — a drawer nested inside this layout
 * would mark itself inert along with the page. A panel needs no trap, and
 * seven links don't warrant one.
 */
export function AdminShell({ user, onSignOut, children }: AdminShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // The panel is only ever open on mobile; a navigation should dismiss it.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Kept in step with the route so the badge clears as messages are read.
  useEffect(() => {
    let cancelled = false;
    void getSupabase()
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new')
      .then(({ count, error }) => {
        if (!cancelled && !error) setUnread(count ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const nav = ADMIN_NAV.map((item) => (
    <NavLink
      key={item.href}
      href={item.href}
      label={item.label}
      badge={'badge' in item && item.badge ? unread : 0}
      pathname={pathname}
      onNavigate={() => setMenuOpen(false)}
    />
  ));

  const footer = (
    <>
      <Link
        href="/"
        className="flex items-center justify-between gap-3 rounded-card px-3 py-2 text-sm text-muted transition-colors hover:bg-subtle hover:text-ink"
      >
        View site
        <ArrowUpRight size={14} aria-hidden />
      </Link>
      <button
        type="button"
        onClick={onSignOut}
        className="flex w-full items-center rounded-card px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-subtle hover:text-ink"
      >
        Sign out
      </button>
      <p className="mt-2 truncate px-3 text-xs text-faint" title={user.email ?? undefined}>
        {user.email}
      </p>
    </>
  );

  return (
    <div className="min-h-dvh bg-surface">
      <div className="sticky top-0 z-40 border-b border-line bg-paper-blur backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Brand />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
          >
            {menuOpen ? <X size={16} aria-hidden /> : <Menu size={16} aria-hidden />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen ? (
            <motion.div
              key="admin-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="overflow-hidden border-t border-line"
            >
              <nav
                aria-label="Admin"
                className="max-h-[70dvh] overflow-y-auto px-3 py-3"
              >
                <div className="grid gap-0.5">{nav}</div>
                <div className="mt-3 grid gap-0.5 border-t border-line pt-3">{footer}</div>
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-line lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
          <div className="px-5 py-6">
            <Brand />
          </div>
          <nav aria-label="Admin" className="min-h-0 flex-1 overflow-y-auto px-3">
            <div className="grid gap-0.5">{nav}</div>
          </nav>
          <div className="grid gap-0.5 border-t border-line px-3 py-4">{footer}</div>
        </aside>

        {/* minmax(0,1fr) above plus min-w-0 here: without both, a wide table
            inside a grid item stretches the track and the page scrolls
            sideways instead of the table's own overflow-x container. */}
        <main className="min-w-0 px-5 py-8 lg:px-10 lg:py-12">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex min-w-0 flex-col">
      <span className="truncate text-sm font-semibold tracking-tight">
        Dipendra <span className="text-muted">/ admin</span>
      </span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        Content
      </span>
    </Link>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  badge: number;
  pathname: string;
  onNavigate: () => void;
}

function NavLink({ href, label, badge, pathname, onNavigate }: NavLinkProps) {
  const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center justify-between gap-3 rounded-card px-3 py-2 text-sm transition-colors',
        active ? 'bg-accent-soft font-medium text-accent' : 'text-muted hover:bg-subtle hover:text-ink',
      )}
    >
      <span className="truncate">{label}</span>
      {badge > 0 ? (
        <span
          className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold leading-none text-on-accent"
          aria-label={`${badge} new`}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
