import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { profile } from '@/data/profile';
import { whatsappUrl } from '@/utils/links';

/**
 * The floating WhatsApp button, fixed to the bottom-right of every public
 * page. Mounted in `SiteChrome`, so it also covers the 404 — and never `/admin`.
 *
 * The header's WhatsApp pill only renders from `lg` up, and on a phone it
 * leaves the screen as soon as the visitor scrolls. This keeps a contact path
 * one tap away at any scroll depth, on whatever section happens to be under
 * the thumb — the same "floating WhatsApp widget" move the case studies in
 * `src/data/projects.ts` describe, as a circle rather than a pill so it covers
 * less of the content beneath it.
 *
 * It reuses the number, the glyph and the brand colours of the header pill
 * (`whatsappUrl`, `bg-whatsapp`, `WhatsAppIcon`), so the two read as the same
 * action rather than two competing widgets. `z-50` puts it above the page but
 * below `z-nav` (70), `z-menu` (80) and `z-modal` (90): the header, the open
 * mobile menu and the image lightbox still stack over it instead of being
 * trapped under a floating circle.
 *
 * Renders nothing when the profile carries no WhatsApp number — the same
 * guard as every other WhatsApp entry point on the site.
 */
export function FloatingWhatsApp() {
  const href = whatsappUrl(profile.whatsapp);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Message me on WhatsApp at ${profile.whatsapp}`}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-control border border-line bg-whatsapp text-whatsapp-ink shadow-md transition-all duration-200 ease-out hover:scale-105 hover:bg-whatsapp-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <WhatsAppIcon size={26} />
    </a>
  );
}
