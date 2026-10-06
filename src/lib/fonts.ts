// @polsia:user-owned — self-hosted Inter via next/font.
//
// The theme (brand_tokens) names "Inter", but nothing loaded it, so visitors saw
// whatever sans-serif their device had. next/font downloads Inter at build time,
// serves it from this site (no request to Google from the visitor), preloads it
// and generates a metric-matched fallback so the swap causes no layout shift.
// head-content.tsx points the theme's font tokens at it.
import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true,
});

/** The full stack the theme's --font-display and --font-body resolve to. */
export const fontStack = `${inter.style.fontFamily}, ui-sans-serif, system-ui, sans-serif`;
