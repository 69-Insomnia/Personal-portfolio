'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';
import { COLLECTIONS } from '@/components/admin/config';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

type Row = Record<string, unknown>;

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [newMessages, setNewMessages] = useState<number | null>(null);
  const [recent, setRecent] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    let cancelled = false;

    (async () => {
      try {
        const entries = await Promise.all(
          Object.values(COLLECTIONS).map(async (collection) => {
            const { count, error: err } = await supabase
              .from(collection.table)
              .select('*', { count: 'exact', head: true });
            return [collection.key, err ? null : (count ?? 0)] as const;
          }),
        );
        const { count: newCount, error: msgErr } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new');
        const { data: latest } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (cancelled) return;
        setCounts(Object.fromEntries(entries));
        setNewMessages(msgErr ? null : (newCount ?? 0));
        setRecent(latest ?? []);
        if (msgErr) setError(msgErr.message);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Collections and the contact-form inbox."
      />

      {error ? (
        <p className="mt-6 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/messages"
          className="border border-line bg-paper p-5 transition-colors hover:border-ink"
        >
          <span className="flex items-center gap-2 text-label font-medium uppercase text-muted">
            <MessageSquareText size={14} aria-hidden />
            Messages
          </span>
          <p className="mt-3 text-3xl font-medium tracking-tight">
            {newMessages === null ? '—' : newMessages}
          </p>
          <p className="mt-1 text-xs text-muted">new, unread</p>
        </Link>

        {Object.values(COLLECTIONS).map((collection) => (
          <Link
            key={collection.key}
            href={`/admin/${collection.key}`}
            className="border border-line bg-paper p-5 transition-colors hover:border-ink"
          >
            <span className="text-label font-medium uppercase text-muted">{collection.label}</span>
            <p className="mt-3 text-3xl font-medium tracking-tight">
              {counts[collection.key] === undefined || counts[collection.key] === null
                ? '—'
                : counts[collection.key]}
            </p>
            <p className="mt-1 text-xs text-muted">rows</p>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-label font-medium uppercase text-muted">Latest messages</h2>
          <Link href="/admin/messages" className="text-sm text-muted hover:text-ink">
            View inbox →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No messages yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border border-line bg-paper">
            {recent.map((message) => (
              <li key={String(message.id)} className="flex flex-wrap items-baseline gap-x-3 px-4 py-3">
                <span className="text-sm font-medium">{String(message.name)}</span>
                <span className="text-xs text-muted">{String(message.email)}</span>
                <span className="ml-auto text-xs text-faint">
                  {new Date(String(message.created_at)).toLocaleString()}
                </span>
                <span
                  className={
                    message.status === 'new'
                      ? 'rounded-full border border-accent bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent'
                      : 'rounded-full border border-line px-2 py-0.5 text-[11px] text-muted'
                  }
                >
                  {String(message.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
