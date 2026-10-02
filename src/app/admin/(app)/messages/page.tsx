'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { cn } from '@/utils/cn';

type Row = Record<string, unknown>;

const STATUSES = ['new', 'read', 'replied', 'archived'] as const;

export default function AdminMessagesPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data, error: err } = await getSupabase()
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (err) {
        setError(err.message);
        setRows([]);
        return;
      }
      setRows(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages');
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (row: Row, status: string) => {
    const id = String(row.id);
    setBusy(id);
    const { error: err } = await getSupabase().from('messages').update({ status }).eq('id', id);
    setBusy(null);
    if (err) {
      setError(err.message);
      return;
    }
    setRows((prev) => (prev ? prev.map((r) => (r.id === row.id ? { ...r, status } : r)) : prev));
  };

  const remove = async (row: Row) => {
    const id = String(row.id);
    if (!window.confirm(`Delete the message from ${String(row.name)}?`)) return;
    setBusy(id);
    const { error: err } = await getSupabase().from('messages').delete().eq('id', id);
    setBusy(null);
    if (err) {
      setError(err.message);
      return;
    }
    setRows((prev) => (prev ? prev.filter((r) => r.id !== row.id) : prev));
  };

  return (
    <div>
      <AdminPageHeader eyebrow="Contact form inbox" title="Messages" />

      {error ? (
        <p className="mt-6 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>
      ) : null}

      {rows === null ? (
        <div className="mt-8 h-40 animate-pulse border border-line bg-paper" aria-busy />
      ) : rows.length === 0 ? (
        <p className="mt-10 text-sm text-muted">
          No messages yet — submissions from the contact form land here.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((row) => {
            const id = String(row.id);
            const isOpen = open === id;
            return (
              <li key={id} className="border border-line bg-paper">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : id)}
                    aria-expanded={isOpen}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-sm font-medium">
                      {String(row.name)}
                      <span className="ml-2 font-normal text-muted">{String(row.email)}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {String(row.service ?? '—')} · {String(row.budget ?? '—')} ·{' '}
                      {new Date(String(row.created_at)).toLocaleString()}
                    </span>
                  </button>

                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs font-medium',
                      row.status === 'new'
                        ? 'border-accent bg-accent-soft text-accent'
                        : 'border-line text-muted',
                    )}
                  >
                    {String(row.status)}
                  </span>

                  <select
                    aria-label="Change status"
                    value={String(row.status)}
                    disabled={busy === id}
                    onChange={(event) => void setStatus(row, event.target.value)}
                    className="border border-line bg-surface px-2 py-1.5 text-xs text-muted focus:border-accent"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    aria-label="Delete message"
                    disabled={busy === id}
                    onClick={() => void remove(row)}
                    className="border border-line p-1.5 text-muted transition-colors hover:border-danger hover:text-danger"
                  >
                    <Trash2 size={13} aria-hidden />
                  </button>
                </div>

                {isOpen ? (
                  <div className="border-t border-line px-4 py-4">
                    {row.company ? (
                      <p className="text-xs text-muted">Company: {String(row.company)}</p>
                    ) : null}
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                      {String(row.message)}
                    </p>
                    <a
                      href={`mailto:${String(row.email)}?subject=${encodeURIComponent(`Re: your message — ${String(row.name)}`)}`}
                      className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
                    >
                      Reply by email →
                    </a>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
