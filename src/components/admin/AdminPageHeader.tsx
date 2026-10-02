import type { ReactNode } from 'react';

interface AdminPageHeaderProps {
  /** Small uppercase eyebrow — the table name, or the section it belongs to. */
  eyebrow: string;
  title: string;
  description?: string;
  /** Right-hand slot for page-level actions, e.g. the "New project" button. */
  actions?: ReactNode;
}

/**
 * The masthead for every admin page.
 *
 * All four admin surfaces hand-rolled the same eyebrow-plus-`text-h2` pair,
 * which is how they drifted apart on spacing. One component keeps them lined
 * up, the same way `PageHeader` does for the public routes.
 *
 * `PageHeader` itself is not reusable here — it is built on `Section`,
 * `Container` and `RevealText`, and carries the public site's `pt-32` offset
 * for the fixed Navbar.
 */
export function AdminPageHeader({ eyebrow, title, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-line pb-6">
      <div className="min-w-0">
        <p className="text-label font-medium uppercase text-muted">{eyebrow}</p>
        <h1 className="mt-1 text-h2">{title}</h1>
        {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
