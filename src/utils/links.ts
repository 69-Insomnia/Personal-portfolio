import type { SocialLinks } from '@/types';

/**
 * The contact and social links the site builds by hand at every call site.
 *
 * The wa.me pattern — strip everything that is not a digit, prefix the domain —
 * was written out seven times across four files, and the `mailto:` prefix five
 * times across four more. Each copy was individually correct, which is exactly
 * how they stay correct until someone changes the WhatsApp display format in
 * `src/data/profile.ts` and six of the seven keep working.
 *
 * A helper that returns `null` for a missing value (rather than throwing or
 * rendering the string "undefined") matches how every call site already
 * guards: `{waHref ? <Button …> : null}`.
 */

/**
 * `https://wa.me/…` for a phone in display format (`'+977-9840814142'`).
 * WhatsApp wants digits only; the leading `+` is implied by the domain.
 */
export function whatsappUrl(phone?: string | null): string | null {
  const digits = phone?.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

/** `tel:` link. Keeps `+` (international prefix) and every digit. */
export function telUrl(phone?: string | null): string | null {
  const digits = phone?.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : null;
}

/**
 * `mailto:` link, optionally with a subject. The subject is encoded here
 * because the one call site with a subject — the reply link on an admin
 * message — was hand-rolling `encodeURIComponent` around it.
 */
export function mailtoUrl(email?: string | null, subject?: string): string | null {
  if (!email) return null;
  const base = `mailto:${email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}

/**
 * Repair the one URL typo CMS fields actually produce: a scheme pasted
 * without its `://` (`https//example.com`). Was written out identically in
 * `normalizeMetadataImage` and `imageUrl` — same regex, same intent.
 *
 * Only fixes the scheme; validity (local path vs. absolute HTTPS) stays the
 * caller's decision, since one caller falls back to a default image and the
 * other returns `undefined`.
 */
export function normalizeHttpUrl(value: string): string {
  return value.replace(/^https\/\//i, 'https://').replace(/^http\/\//i, 'http://');
}

/**
 * Network names, for `aria-label`s on icon-only links.
 *
 * Two copies of this map existed — the footer's icon row and the standalone
 * `SocialLinks` list — identical in every key. One map means adding a network
 * cannot update one and miss the other.
 */
export const socialLabels: Record<keyof SocialLinks, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
};
