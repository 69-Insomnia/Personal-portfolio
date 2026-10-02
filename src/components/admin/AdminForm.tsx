'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';
import { FieldControl } from './FieldControl';
import { AdminPageHeader } from './AdminPageHeader';
import type { Collection } from './config';

type Values = Record<string, unknown>;
type Errors = Partial<Record<string, string>>;

export function AdminForm({ collection, id }: { collection: Collection; id: string | null }) {
  const router = useRouter();
  const isNew = id === null;
  const [values, setValues] = useState<Values>(() =>
    isNew ? { ...collection.defaults } : null as unknown as Values,
  );
  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) {
      setValues({ ...collection.defaults });
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await getSupabase()
        .from(collection.table)
        .select('*')
        .eq(collection.pk, id)
        .maybeSingle();
      if (cancelled) return;
      setLoading(false);
      if (error || !data) {
        setNotFound(true);
        return;
      }
      setValues(data as Values);
    })();
    return () => {
      cancelled = true;
    };
  }, [collection, id, isNew]);

  const set = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const save = async () => {
    const nextErrors: Errors = {};
    for (const field of collection.fields) {
      if (!field.required) continue;
      const value = values[field.name];
      const empty =
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '');
      if (empty) nextErrors[field.name] = 'Required.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setSaveError(null);

    const row: Values = {};
    for (const field of collection.fields) {
      const value = values[field.name];
      if (value === undefined) continue;
      if (typeof value === 'string' && field.type !== 'paragraphs') {
        row[field.name] = value.trim();
      } else {
        row[field.name] = value;
      }
    }

    try {
      const supabase = getSupabase();
      if (isNew) {
        const { error } = await supabase.from(collection.table).insert(row);
        if (error) throw new Error(error.message);
      } else {
        const pkValue = values[collection.pk];
        const { error } = await supabase
          .from(collection.table)
          .update(row)
          .eq(collection.pk, String(pkValue));
        if (error) throw new Error(error.message);
      }
      router.push(`/admin/${collection.key}`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
      setSaving(false);
    }
  };

  if (notFound) {
    return (
      <div>
        <AdminPageHeader
          eyebrow={collection.label}
          title="Not found"
          actions={<BackLink collection={collection} />}
        />
        <p className="mt-6 text-sm text-muted">
          No {collection.singular.toLowerCase()} with id <code className="font-mono">{id}</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        eyebrow={collection.label}
        title={
          isNew
            ? `New ${collection.singular.toLowerCase()}`
            : `Edit ${collection.singular.toLowerCase()}`
        }
        actions={<BackLink collection={collection} />}
      />

      {saveError ? (
        <p className="mt-6 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
          {saveError}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-8 h-64 animate-pulse border border-line bg-surface" aria-busy />
      ) : (
        <form
          className="mt-8 grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          {collection.fields.map((field) => (
            <FieldControl
              key={field.name}
              field={field}
              value={values?.[field.name]}
              error={errors[field.name]}
              disabled={saving || (field.pk === true && !isNew)}
              onChange={(value) => set(field.name, value)}
            />
          ))}

          <div className="mt-2 flex items-center gap-3 border-t border-line pt-6">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
            >
              {saving ? <LoaderCircle size={15} className="animate-spin" aria-hidden /> : <Save size={15} aria-hidden />}
              {isNew ? 'Create' : 'Save changes'}
            </button>
            <Link
              href={`/admin/${collection.key}`}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

function BackLink({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/admin/${collection.key}`}
      className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={14} aria-hidden />
      All {collection.label.toLowerCase()}
    </Link>
  );
}
