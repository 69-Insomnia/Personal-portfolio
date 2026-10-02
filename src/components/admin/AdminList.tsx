'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';
import type { Collection } from './config';
import { AdminPageHeader } from './AdminPageHeader';
import { cn } from '@/utils/cn';

type Row = Record<string, unknown>;

export function AdminList({ collection }: { collection: Collection }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data, error: err } = await getSupabase()
        .from(collection.table)
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (err) {
        setError(err.message);
        setRows([]);
        return;
      }
      setRows(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setRows([]);
    }
  }, [collection.table]);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePublished = async (row: Row) => {
    const pk = String(row[collection.pk]);
    const next = row.published !== true;
    setBusy(pk);
    const { error: err } = await getSupabase()
      .from(collection.table)
      .update({ published: next })
      .eq(collection.pk, pk);
    setBusy(null);
    if (err) {
      setError(err.message);
      return;
    }
    setRows((prev) =>
      prev ? prev.map((r) => (r[collection.pk] === row[collection.pk] ? { ...r, published: next } : r)) : prev,
    );
  };

  const remove = async (row: Row) => {
    const pk = String(row[collection.pk]);
    if (!window.confirm(`Delete ${collection.singular.toLowerCase()} “${pk}”? This cannot be undone.`)) {
      return;
    }
    setBusy(pk);
    const { error: err } = await getSupabase()
      .from(collection.table)
      .delete()
      .eq(collection.pk, pk);
    setBusy(null);
    if (err) {
      setError(err.message);
      return;
    }
    setRows((prev) => (prev ? prev.filter((r) => r[collection.pk] !== row[collection.pk]) : prev));
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow={collection.table}
        title={collection.label}
        actions={
          <Link
            href={`/admin/${collection.key}/new`}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong"
          >
            <Plus size={15} aria-hidden />
            New {collection.singular.toLowerCase()}
          </Link>
        }
      />

      {error ? (
        <p className="mt-6 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>
      ) : null}

      {rows === null ? (
        <div className="mt-8 space-y-3" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse border border-line bg-surface" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-sm text-muted">
          Nothing here yet. Create the first {collection.singular.toLowerCase()} — until rows exist
          the public site keeps rendering the static defaults.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-line">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface">
                {collection.columns.map((column) => (
                  <th key={column.name} className="px-4 py-3 text-label font-medium uppercase text-muted">
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-label font-medium uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const pk = String(row[collection.pk]);
                return (
                  <tr key={pk} className="border-b border-line last:border-0">
                    {collection.columns.map((column) => (
                      <td key={column.name} className="max-w-[22rem] truncate px-4 py-3">
                        {column.name === 'published' ? (
                          <button
                            type="button"
                            disabled={busy === pk}
                            onClick={() => togglePublished(row)}
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                              row.published === true
                                ? 'border-accent bg-accent-soft text-accent'
                                : 'border-line text-muted hover:border-ink',
                            )}
                          >
                            {row.published === true ? 'Published' : 'Draft'}
                          </button>
                        ) : (
                          String(row[column.name] ?? '—')
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/${collection.key}/${encodeURIComponent(pk)}`}
                          className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-ink hover:text-ink"
                        >
                          <Pencil size={13} aria-hidden />
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={busy === pk}
                          onClick={() => remove(row)}
                          aria-label={`Delete ${pk}`}
                          className="inline-flex items-center justify-center border border-line p-1.5 text-muted transition-colors hover:border-danger hover:text-danger"
                        >
                          <Trash2 size={13} aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
