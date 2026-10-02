'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * Whether the section eyebrows on the current page show their ordinal.
 *
 * An eyebrow like "04 — Stack" numbers a section by its position on the *home
 * page*. Four other routes reuse those same section components, and there the
 * numbers don't describe anything: `/about` would show 01, 02, 09, 10, 12, 15,
 * and `/contact` would show Contact (16) directly above FAQ (15) — descending.
 *
 * Providing this only around the home page keeps the numbering honest and
 * leaves every other route with a plain label. Doing it with context means the
 * section components don't each need a `showIndex` prop threaded through them.
 */
const SectionNumberingContext = createContext(false);

export function SectionNumberingProvider({ children }: { children: ReactNode }) {
  return <SectionNumberingContext.Provider value>{children}</SectionNumberingContext.Provider>;
}

export function useSectionNumbering(): boolean {
  return useContext(SectionNumberingContext);
}
