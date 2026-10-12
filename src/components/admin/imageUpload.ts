import { getSupabase } from '@/lib/supabase-browser';

/**
 * Local-device image upload, shared by the media library and the inline image
 * fields on the content forms.
 *
 * ## Why this is a module and not a component
 *
 * The two-step upload — file to Storage, then a row into `media` — used to live
 * inline in `MediaManager`. Adding an uploader to the post and project forms
 * would have meant a second copy of the same logic, and the parts that are easy
 * to get subtly wrong are exactly the parts that would have been duplicated:
 * the filename sanitiser, the ordering of the two writes, and the compensation
 * message when the second one fails.
 *
 * ## The order of the two writes, and why it is this way round
 *
 * The file goes to the bucket **first**, then the row is inserted. Reversed, a
 * failed upload leaves a row pointing at a file that does not exist — a broken
 * image on the public site with nothing to indicate why. This way a failure
 * between the two leaves an orphaned object in the bucket: wasted bytes, which
 * is the cheaper of the two mistakes. The caller is told the path so it can say
 * so rather than reporting a bare database error.
 *
 * ## Alt text
 *
 * `media.alt` is `not null` with `check (length(btrim(alt)) > 0)` plus a
 * constraint rejecting an alt identical to the filename stem. Those hold for
 * every writer, including this one. `altProblem` mirrors them so the message
 * appears beside the field rather than as a Postgres error.
 */

/** Mirrors the `media_alt_not_filename` check so the error shows on the field. */
export function altProblem(alt: string, filename: string): string | null {
  const trimmed = alt.trim();
  if (trimmed === '') return 'Required. An image cannot be saved without alt text.';

  const stem = filename.replace(/\.[a-z0-9]+$/i, '');
  if (trimmed.toLowerCase() === stem.toLowerCase()) {
    return 'This just repeats the filename. Describe what the picture shows.';
  }
  return null;
}

/**
 * A storage-safe filename.
 *
 * Supabase Storage keys reject anything outside a conservative character set,
 * and the original name is user-supplied. The timestamp prefix keeps uploads of
 * the same filename from colliding, which matters because `media.src` is unique
 * and a collision would otherwise be a confusing constraint error.
 */
export function storagePath(file: File): string {
  const stem = file.name
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? 'bin').toLowerCase();
  return `${Date.now()}-${stem || 'image'}.${ext}`;
}

/**
 * Intrinsic dimensions, read from the decoded image.
 *
 * Resolves `null` rather than rejecting when the image will not decode — a
 * corrupt file should produce an upload error from Storage, not an unhandled
 * rejection here. The dimensions are only used to warn about a CLS risk and to
 * populate nullable columns.
 */
export function imageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export interface UploadResult {
  /** Public URL of the stored file. Absent when the upload failed. */
  url?: string;
  /** Set when the file reached the bucket but the `media` row did not. */
  orphanPath?: string;
  error?: string;
}

/**
 * Uploads one file and records it in `media`.
 *
 * `entityType` / `entitySlug` attribute the upload to what it belongs to, which
 * is what makes the library searchable later. They default to `'site'`, the
 * value the standalone media screen uses for images that belong to no single
 * page.
 */
export async function uploadImage(
  file: File,
  alt: string,
  attribution: { entityType?: MediaEntityType; entitySlug?: string } = {},
): Promise<UploadResult> {
  const problem = altProblem(alt, file.name);
  if (problem) return { error: problem };

  const supabase = getSupabase();
  const path = storagePath(file);
  const dimensions = await imageDimensions(file);

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type || undefined,
      upsert: false,
    });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const { data: publicUrl } = supabase.storage.from('media').getPublicUrl(path);

  const { error: insertError } = await supabase.from('media').insert({
    src: publicUrl.publicUrl,
    alt: alt.trim(),
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
    bytes: file.size,
    mime_type: file.type || null,
    entity_type: attribution.entityType ?? 'site',
    entity_slug: attribution.entitySlug ?? null,
  });

  if (insertError) {
    return {
      orphanPath: path,
      error:
        `${insertError.message}\n\nThe file was uploaded but the record was not ` +
        `saved. Remove ${path} from the media bucket, or fix the description ` +
        `and try again.`,
    };
  }

  return { url: publicUrl.publicUrl };
}

/** The `media.entity_type` values the check constraint allows. */
export type MediaEntityType = 'project' | 'post' | 'service' | 'page' | 'site';
