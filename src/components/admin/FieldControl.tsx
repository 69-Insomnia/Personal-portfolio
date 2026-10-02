'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { Field } from './config';
import { cn } from '@/utils/cn';

const inputClass =
  'w-full border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent-soft';

interface FieldControlProps {
  field: Field;
  value: unknown;
  error?: string;
  disabled?: boolean;
  onChange: (value: unknown) => void;
}

export function FieldControl({ field, value, error, disabled, onChange }: FieldControlProps) {
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
