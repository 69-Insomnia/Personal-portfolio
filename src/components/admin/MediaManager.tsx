'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ImagePlus, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { getSupabase } from '@/lib/supabase-browser';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { inputClass } from '@/components/admin/FieldControl';
import { cn } from '@/utils/cn';

/**
 * Media library, with alt text that cannot be skipped.
 *
 * ## Where the alt-text rule actually lives
 *
 * The Save button is disabled until a description is written, but that is the
 * *convenience*, not the rule. The rule is `media.alt text not null` plus
 * `check (length(btrim(alt)) > 0)` plus `media_alt_not_filename` in the
 * migration — which hold for `scripts/sync-content.ts`, for the Supabase table
 * editor, and for whatever writes to this table next. A form-level check would
 * hold only for this form.
 *
 * The third constraint is the interesting one. `alt="hero-final-v2"` satisfies
 * "has alt text" while being useless to a screen reader and to image search,
 * and it is exactly what gets typed when a field is merely mandatory. Rejecting
 * a description identical to the filename stem costs nothing legitimate — a
 * real description is never the filename — and it is mirrored here so the
 * message appears next to the field rather than as a Postgres error.
 *
 * ## Why two steps and not one
 *
 * The file is uploaded to Storage first, then the row is inserted. Reversed,
 * a failed upload would leave a row pointing at a file that does not exist.
 * This way a failure between the two leaves an orphaned object in the bucket —
 * wasted bytes, which is the cheaper of the two mistakes.
 */

interface MediaRow {
  id: string;
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  mime_type: string | null;
  entity_type: string | null;
  entity_slug: string | null;
  created_at: string;
}

interface PendingUpload {
  file: File;
  /** Object URL for the preview. Revoked when the pending upload is cleared. */
  previewUrl: string;
  width: number | null;
  height: number | null;
}

/** Mirrors the `media_alt_not_filename` check so the error shows on the field. */
function altProblem(alt: string, filename: string): string | null {
  const trimmed = alt.trim();
  if (trimmed === '') return 'Required. An image cannot be saved without alt text.';

  const stem = filename.replace(/\.[a-z0-9]+$/i, '');
  if (trimmed.toLowerCase() === stem.toLowerCase()) {
    return 'This just repeats the filename. Describe what the picture shows.';
  }
  return null;
}

function humanBytes(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * A storage-safe filename.
 *
 * Supabase Storage keys reject anything outside a conservative character set,
 * and the original name is user-supplied. The timestamp prefix keeps uploads
 * of the same filename from colliding, which matters because `media.src` is
 * unique and a collision would otherwise be a confusing constraint error.
 */
function storagePath(file: File): string {
  const stem = file.name
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? 'bin').toLowerCase();
  return `${Date.now()}-${stem || 'image'}.${ext}`;
}

export function MediaManager() {
  const [rows, setRows] = useState<MediaRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [alt, setAlt] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data, error: err } = await getSupabase()
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) {
        setError(err.message);
        setRows([]);
        return;
      }
      setRows((data as MediaRow[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load media');
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Object URLs are not garbage collected; leaking one per cancelled upload
  // would pin the whole file in memory until the tab closes.
  useEffect(() => {
    return () => {
      if (pending) URL.revokeObjectURL(pending.previewUrl);
    };
  }, [pending]);

  const choose = (file: File | null) => {
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    setSaveError(null);
    setAlt('');
    if (!file) {
      setPending(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPending({ file, previewUrl, width: null, height: null });

    // Dimensions come from the decoded image, so the admin can see — before
    // saving — whether this is going to be a CLS problem on the public site.
    const img = new window.Image();
    img.onload = () => {
      setPending((prev) =>
        prev && prev.file === file
          ? { ...prev, width: img.naturalWidth, height: img.naturalHeight }
          : prev,
      );
    };
    img.src = previewUrl;
  };

  const upload = async () => {
    if (!pending) return;
    const problem = altProblem(alt, pending.file.name);
    if (problem) {
      setSaveError(problem);
      return;
    }

    setSaving(true);
    setSaveError(null);
    const supabase = getSupabase();
    const path = storagePath(pending.file);

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, pending.file, {
        cacheControl: '31536000',
        contentType: pending.file.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      setSaving(false);
      setSaveError(`Upload failed: ${uploadError.message}`);
      return;
    }

    const { data: publicUrl } = supabase.storage.from('media').getPublicUrl(path);

    const { error: insertError } = await supabase.from('media').insert({
      src: publicUrl.publicUrl,
      alt: alt.trim(),
      width: pending.width,
      height: pending.height,
      bytes: pending.file.size,
      mime_type: pending.file.type || null,
      entity_type: 'site',
    });

    setSaving(false);

    if (insertError) {
      /**
       * The object is already in the bucket and the row is not. That is the
       * safe order, but it leaves an orphan, so the message says so rather
       * than reporting a bare database error — otherwise the next person
       * deletes nothing and the bucket accumulates files nobody can account
       * for.
       */
      setSaveError(
        `${insertError.message}\n\nThe file was uploaded but the record was not saved. ` +
          `Remove ${path} from the media bucket, or fix the description and try again.`,
      );
      return;
    }

    URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
    setAlt('');
    if (fileInput.current) fileInput.current.value = '';
    await load();
  };

  const remove = async (row: MediaRow) => {
    if (!window.confirm(`Delete this image?\n\n${row.src}`)) return;
    setBusy(row.id);

    // Bucket first. If the row went first and the object delete failed, the
    // file would be unreachable from the admin forever.
    const marker = '/media/';
    const index = row.src.indexOf(marker);
    if (index !== -1) {
      await getSupabase()
        .storage.from('media')
        .remove([row.src.slice(index + marker.length)]);
    }

    const { error: err } = await getSupabase().from('media').delete().eq('id', row.id);
    setBusy(null);
    if (err) {
      setError(err.message);
      return;
    }
    setRows((prev) => (prev ? prev.filter((r) => r.id !== row.id) : prev));
  };

  const problem = pending ? altProblem(alt, pending.file.name) : null;

  return (
    <div>
      <AdminPageHeader eyebrow="media" title="Media" />

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Uploaded images with their alt text. Alt text is required — it is what a screen
        reader announces and what image search indexes, and the database refuses to
        store an image without it.
      </p>

      {error ? (
        <p className="mt-6 border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {/* ------------------------------------------------------- upload --- */}
      <div className="mt-8 border border-line bg-surface p-5">
        <h2 className="text-label font-medium uppercase text-muted">Upload an image</h2>

        <div className="mt-4 grid gap-5 md:grid-cols-[14rem_1fr]">
          <div>
            <input
              ref={fileInput}
              id="media-file"
              type="file"
              accept="image/*"
              onChange={(e) => choose(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
            <label
              htmlFor="media-file"
              className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line-strong bg-subtle text-muted transition-colors hover:border-ink hover:text-ink"
            >
              {pending ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pending.previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <ImagePlus size={20} aria-hidden />
                  <span className="text-xs font-medium">Choose a file</span>
                </>
              )}
            </label>
          </div>

          <div className="grid content-start gap-4">
            {pending ? (
              <p className="text-xs text-muted">
                <span className="font-medium text-ink">{pending.file.name}</span>
                {' · '}
                {humanBytes(pending.file.size)}
                {pending.width && pending.height ? (
                  <>
                    {' · '}
                    {pending.width}×{pending.height}
                    {pending.width < 1200 ? (
                      <span className="text-danger">
                        {' '}
                        — narrower than the 1200px an OG card wants
                      </span>
                    ) : null}
                  </>
                ) : null}
              </p>
            ) : (
              <p className="text-xs text-muted">
                PNG, JPEG, WebP or AVIF. Images are served as WebP or AVIF by the site
                regardless of what you upload here.
              </p>
            )}

            <div>
              <label
                htmlFor="media-alt"
                className="text-label font-medium uppercase text-muted"
              >
                Alt text <span className="text-accent">*</span>
              </label>
              <textarea
                id="media-alt"
                rows={2}
                value={alt}
                disabled={!pending || saving}
                placeholder="Homepage of the DrillThru agency site, with a dark hero headline and a row of proof statistics"
                onChange={(e) => {
                  setAlt(e.target.value);
                  setSaveError(null);
                }}
                className={cn(
                  'mt-2 resize-y',
                  inputClass,
                  pending && problem && alt.length > 0 && 'border-danger',
                )}
              />
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                Describe what is in the picture, not what the project is. A screen reader
                reads this in place of the image, so it should make sense on its own.
              </p>
            </div>

            {saveError ? (
              <p className="flex items-start gap-2 whitespace-pre-line border border-danger bg-danger/5 px-4 py-3 text-xs text-danger">
                <AlertTriangle size={14} aria-hidden className="mt-0.5 shrink-0" />
                {saveError}
              </p>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!pending || saving || problem !== null}
                onClick={() => void upload()}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-50"
              >
                {saving ? (
                  <LoaderCircle size={15} className="animate-spin" aria-hidden />
                ) : (
                  <Upload size={15} aria-hidden />
                )}
                Save image
              </button>
              {pending && problem && alt.length === 0 ? (
                <span className="text-xs text-muted">
                  Add alt text to enable saving.
                </span>
              ) : null}
              {pending ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => choose(null)}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- list --- */}
      {rows === null ? (
        <div className="mt-8 space-y-3" aria-busy>
          {[0, 1].map((i) => (
            <div key={i} className="h-20 animate-pulse border border-line bg-surface" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-sm text-muted">
          Nothing uploaded yet. Images already in <code className="font-mono">public/</code>{' '}
          keep working — they use the alt text defined in{' '}
          <code className="font-mono">src/utils/images.ts</code>.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <li key={row.id} className="border border-line bg-surface">
              <div className="flex h-36 items-center justify-center overflow-hidden border-b border-line bg-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.src} alt={row.alt} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="p-3">
                <p className="line-clamp-3 text-xs leading-relaxed text-ink">{row.alt}</p>
                <p className="mt-2 text-[11px] text-muted">
                  {row.width && row.height ? `${row.width}×${row.height} · ` : ''}
                  {humanBytes(row.bytes)}
                  {row.entity_type ? ` · ${row.entity_type}` : ''}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(row.src)}
                    className="text-[11px] font-medium text-muted transition-colors hover:text-ink"
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    disabled={busy === row.id}
                    onClick={() => void remove(row)}
                    aria-label="Delete image"
                    className="ml-auto inline-flex items-center justify-center border border-line p-1.5 text-muted transition-colors hover:border-danger hover:text-danger"
                  >
                    <Trash2 size={13} aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
