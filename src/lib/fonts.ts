// @polsia:user-owned — self-hosted fonts via next/font.
//
// next/font downloads each family at build time and serves it from this site (no request to
// Google from the visitor), preloads it and generates a metric-matched fallback so the swap
// causes no layout shift. head-content.tsx points the theme's font tokens at them.
//   Space Grotesk: display headings.  Inter: body copy.  JetBrains Mono: numbers, build log.
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true,
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true,
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true,
  // Only used for short runs of digits and log lines: never block on it.
  preload: false,
});

const SANS_FALLBACK = 'ui-sans-serif, system-ui, sans-serif';

/** The body stack (--font-body). */
export const fontStack = `${inter.style.fontFamily}, ${SANS_FALLBACK}`;
/** The heading stack (--font-display). */
export const displayFontStack = `${spaceGrotesk.style.fontFamily}, ${inter.style.fontFamily}, ${SANS_FALLBACK}`;
/** The mono stack (--font-mono, Tailwind's `font-mono`). */
export const monoFontStack = `${jetbrainsMono.style.fontFamily}, ui-monospace, SFMono-Regular, Menlo, monospace`;
