'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Plus, Trash2, Upload, X } from 'lucide-react';
import type { Field } from './config';
import {
  altProblem,
  uploadImage,
  type MediaEntityType,
} from './imageUpload';
import { cn } from '@/utils/cn';

/**
 * Shared with `SeoPanel`, which renders its own inputs. Exported rather than
 * duplicated so a change to the admin's field styling cannot land in one panel
 * and miss the other.
 */
export const inputClass =
  'w-full border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent-soft';

interface FieldControlProps {
  field: Field;
  value: unknown;
  error?: string;
  disabled?: boolean;
  onChange: (value: unknown) => void;
  /**
   * Attribution for an upload, so the media library knows which page the image
   * belongs to. Optional — an upload with neither records `entity_type: 'site'`,
   * the same value the standalone media screen uses.
   */
  entityType?: MediaEntityType;
  entitySlug?: string;
}

export function FieldControl({
  field,
  value,
  error,
  disabled,
  onChange,
  entityType,
  entitySlug,
}: FieldControlProps) {
  const describedBy = error ? `${field.name}-error` : undefined;

  return (
    <div>
      <label
        htmlFor={`field-${field.name}`}
        className="text-label font-medium uppercase text-muted"
      >
        {field.label}
        {field.required ? <span className="ml-1 text-accent">*</span> : null}
      </label>

      {field.type === 'toggle' ? (
        <button
          type="button"
          role="switch"
          aria-checked={value === true}
          disabled={disabled}
          onClick={() => onChange(value !== true)}
          className={cn(
            'mt-2 flex h-9 w-[3.75rem] items-center rounded-full border px-0.5 transition-colors duration-300',
            value === true ? 'border-accent bg-accent' : 'border-line-strong bg-surface',
          )}
        >
          <span
            className={cn(
              'h-7 w-7 rounded-full bg-paper shadow-sm transition-transform duration-300',
              value === true && 'translate-x-[1.75rem]',
            )}
          />
          <span className="sr-only">{field.label}</span>
        </button>
      ) : null}

      {field.type === 'select' ? (
        <select
          id={`field-${field.name}`}
          value={String(value ?? '')}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={cn('mt-2', inputClass)}
        >
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === 'text' ? (
        <input
          id={`field-${field.name}`}
          type="text"
          value={String(value ?? '')}
          disabled={disabled}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cn('mt-2', inputClass, field.pk && !disabled && 'font-mono')}
        />
      ) : null}

      {field.type === 'number' ? (
        <input
          id={`field-${field.name}`}
          type="number"
          value={typeof value === 'number' ? value : 0}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className={cn('mt-2', inputClass)}
        />
      ) : null}

      {/*
        Blank means `null`, not `0`. The difference is the whole reason this
        type exists — see the note on `FieldType` in `config.ts`. An empty
        number input reads as `''`, and `Number('')` is `0`, so the coercion has
        to happen explicitly rather than through `type="number"` alone.
      */}
      {field.type === 'price' ? (
        <input
          id={`field-${field.name}`}
          type="number"
          min={0}
          step={1}
          // `''` rather than `0` when unset, so the field renders empty and its
          // placeholder is visible instead of showing a price of zero.
          value={typeof value === 'number' ? value : ''}
          disabled={disabled}
          placeholder={field.placeholder}
          onChange={(event) => {
            const raw = event.target.value.trim();
            const parsed = Number(raw);
            onChange(
              raw === '' || !Number.isFinite(parsed)
                ? null
                : Math.max(0, Math.trunc(parsed)),
            );
          }}
          className={cn('mt-2', inputClass)}
        />
      ) : null}

      {field.type === 'textarea' ? (
        <textarea
          id={`field-${field.name}`}
          rows={4}
          value={String(value ?? '')}
          disabled={disabled}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cn('mt-2 resize-y', inputClass)}
        />
      ) : null}

      {field.type === 'paragraphs' ? (
        <textarea
          id={`field-${field.name}`}
          rows={12}
          value={(Array.isArray(value) ? (value as string[]) : []).join('\n\n')}
          disabled={disabled}
          placeholder={'First paragraph.\n\nSecond paragraph.'}
          onChange={(event) =>
            onChange(
              event.target.value
                .split(/\n\s*\n/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean),
            )
          }
          className={cn('mt-2 resize-y font-mono text-[13px]', inputClass)}
        />
      ) : null}

      {field.type === 'array' ? (
        <ArrayControl
          id={`field-${field.name}`}
          value={Array.isArray(value) ? (value as string[]) : []}
          options={field.options}
          disabled={disabled}
          onChange={(next) => onChange(next)}
        />
      ) : null}

      {field.type === 'results' ? (
        <ResultsControl
          value={Array.isArray(value) ? (value as { label: string; value: string }[]) : []}
          disabled={disabled}
          onChange={(next) => onChange(next)}
        />
      ) : null}

      {field.type === 'image' ? (
        <ImageControl
          id={`field-${field.name}`}
          value={typeof value === 'string' ? value : ''}
          disabled={disabled}
          entityType={entityType}
          entitySlug={entitySlug}
          onChange={onChange}
        />
      ) : null}

      {field.help ? <p className="mt-1.5 text-xs leading-relaxed text-muted">{field.help}</p> : null}

      {error ? (
        <p id={`${field.name}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Free list: textarea lines, or a line-picker when the field has fixed options. */
function ArrayControl({
  id,
  value,
  options,
  disabled,
  onChange,
}: {
  id: string;
  value: string[];
  options?: readonly string[];
  disabled?: boolean;
  onChange: (next: string[]) => void;
}) {
  if (options) {
    const toggle = (option: string) =>
      onChange(
        value.includes(option) ? value.filter((v) => v !== option) : [...value, option],
      );

    return (
      <div id={id} className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => toggle(option)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium tracking-tight transition-colors duration-300',
                active
                  ? 'border-accent bg-accent text-on-accent'
                  : 'border-line text-muted hover:border-ink hover:text-ink',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <textarea
      id={id}
      rows={4}
      value={value.join('\n')}
      disabled={disabled}
      onChange={(event) =>
        onChange(
          event.target.value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        )
      }
      className={cn('mt-2 resize-y font-mono text-[13px]', inputClass)}
    />
  );
}

function ResultsControl({
  value,
  disabled,
  onChange,
}: {
  value: { label: string; value: string }[];
  disabled?: boolean;
  onChange: (next: { label: string; value: string }[]) => void;
}) {
  const update = (index: number, patch: Partial<{ label: string; value: string }>) =>
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <div className="mt-2 space-y-2">
      {value.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            aria-label={`Result value ${index + 1}`}
            placeholder="24/7"
            value={row.value}
            disabled={disabled}
            onChange={(event) => update(index, { value: event.target.value })}
            className={cn(inputClass, 'w-32 shrink-0')}
          />
          <input
            type="text"
            aria-label={`Result label ${index + 1}`}
            placeholder="What it means"
            value={row.label}
            disabled={disabled}
            onChange={(event) => update(index, { label: event.target.value })}
            className={inputClass}
          />
          <button
            type="button"
            aria-label={`Remove result ${index + 1}`}
            disabled={disabled}
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-muted transition-colors hover:border-danger hover:text-danger"
          >
            <Trash2 size={15} aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange([...value, { value: '', label: '' }])}
        className="inline-flex items-center gap-1.5 border border-line px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-ink hover:text-ink"
      >
        <Plus size={13} aria-hidden />
        Add result
      </button>
    </div>
  );
}

/**
 * An image path, with the option to upload one from the machine instead.
 *
 * ## Why this is not just a file picker
 *
 * Every image already on this site is a file committed to `public/` and
 * referenced as `/images/…`. Those paths have to keep working, so the text
 * input stays and remains the source of truth — the upload button fills it in
 * rather than replacing it. A designer who hands over a file, or a path
 * remembered from elsewhere, both still work.
 *
 * ## Why the alt text is asked for here rather than in the media library
 *
 * The `media` table refuses an image without alt text, so an upload from this
 * field has to supply it or the write fails. Asking on the standalone media
 * screen and then again here would mean two places to describe the same file;
 * asking only here means the description is written at the moment the person is
 * looking at the picture in context, which is when they know what belongs in
 * it.
 *
 * ## Why the file is uploaded immediately rather than on form submit
 *
 * The form's save path writes one row to one table. Uploading there would make
 * a save depend on a Storage round trip and a second table's insert, and a
 * failure halfway would leave the content row written and the image missing.
 * Uploading on its own button keeps the two independent: by the time Save runs,
 * the field holds a plain URL and nothing else can fail.
 */
function ImageControl({
  id,
  value,
  disabled,
  entityType,
  entitySlug,
  onChange,
}: {
  id: string;
  value: string;
  disabled?: boolean;
  entityType?: MediaEntityType;
  entitySlug?: string;
  onChange: (value: unknown) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [alt, setAlt] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Object URLs are not garbage collected. Without this, every image the admin
  // picks and then abandons pins the whole file in memory until the tab closes.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const clearPending = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setAlt('');
    setProblem(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const choose = (next: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    setProblem(null);
    setAlt('');
    if (!next) {
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
  };

  const upload = async () => {
    if (!file) return;
    const issue = altProblem(alt, file.name);
    if (issue) {
      setProblem(issue);
      return;
    }

    setBusy(true);
    setProblem(null);
    const result = await uploadImage(file, alt, { entityType, entitySlug });
    setBusy(false);

    if (result.error) {
      setProblem(result.error);
      return;
    }

    onChange(result.url ?? '');
    clearPending();
  };

  return (
    <div className="mt-2 grid gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden border border-line bg-subtle">
          {preview ?? (value ? value : null) ? (
            // A plain <img>: the value may be an arbitrary admin-entered URL
            // that is not in next.config's remotePatterns, and routing it
            // through the optimiser would throw for any host not on that list.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview ?? value}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <ImagePlus size={18} className="text-muted" aria-hidden />
          )}
        </div>

        <div className="grid min-w-0 flex-1 gap-2">
          <input
            id={id}
            type="text"
            value={value}
            disabled={disabled}
            placeholder="/images/my-post.png or an uploaded URL"
            onChange={(event) => onChange(event.target.value)}
            className={cn(inputClass, 'font-mono text-[13px]')}
          />

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              id={`${id}-file`}
              type="file"
              accept="image/*"
              disabled={disabled || busy}
              onChange={(event) => choose(event.target.files?.[0] ?? null)}
              className="sr-only"
            />
            <label
              htmlFor={`${id}-file`}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 border border-line px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-ink hover:text-ink',
                (disabled || busy) && 'pointer-events-none opacity-50',
              )}
            >
              <ImagePlus size={13} aria-hidden />
              Choose from device
            </label>

            {value ? (
              <button
                type="button"
                disabled={disabled || busy}
                onClick={() => onChange('')}
                className="text-xs text-muted transition-colors hover:text-danger"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* The upload is a separate, explicit step — see the note above on why it
          is not folded into the form's Save. */}
      {file ? (
        <div className="grid gap-3 border border-line bg-surface p-3">
          <p className="text-xs text-muted">
            <span className="font-medium text-ink">{file.name}</span>
            {' · '}
            {Math.max(1, Math.round(file.size / 1024))} KB
          </p>

          <div>
            <label
              htmlFor={`${id}-alt`}
              className="text-label font-medium uppercase text-muted"
            >
              Alt text <span className="text-accent">*</span>
            </label>
            <textarea
              id={`${id}-alt`}
              rows={2}
              value={alt}
              disabled={busy}
              placeholder="Describe what is in the picture — a screen reader reads this instead of the image."
              onChange={(event) => {
                setAlt(event.target.value);
                setProblem(null);
              }}
              className={cn(
                'mt-1 resize-y',
                inputClass,
                problem && alt.length > 0 && 'border-danger',
              )}
            />
          </div>

          {problem ? (
            <p className="whitespace-pre-line text-xs text-danger">{problem}</p>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={busy || altProblem(alt, file.name) !== null}
              onClick={() => void upload()}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-medium text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-50"
            >
              {busy ? (
                <LoaderCircle size={13} className="animate-spin" aria-hidden />
              ) : (
                <Upload size={13} aria-hidden />
              )}
              Upload
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={clearPending}
              className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-ink"
            >
              <X size={12} aria-hidden />
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* An error with no pending file means the upload itself failed and the
          picker was cleared — without this it would vanish silently. */}
      {!file && problem ? (
        <p className="whitespace-pre-line text-xs text-danger">{problem}</p>
      ) : null}
    </div>
  );
}
