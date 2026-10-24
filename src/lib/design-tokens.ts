// @polsia:user-owned — FounderLab / Renor design tokens, as data.
//
// The CSS custom properties in src/app/custom-style.css are the source the site renders from.
// This module mirrors the same values for the few places that cannot read CSS variables:
// next/og social images, the web manifest and the browser theme colour. A unit test
// (tests/unit/design-tokens.test.ts) keeps the two in step and checks text contrast.

/** Dark surfaces, deepest first: page, raised, card, hover. */
export const SURFACE = {
  bg0: '#05070F',
  bg1: '#0A1024',
  bg2: '#101935',
  bg3: '#18244A',
  line: '#22305C',
  lineStrong: '#33468A',
} as const;

/** Text on dark surfaces. `text3` is the faintest colour any text may use. */
export const INK = {
  text1: '#F2F5FF',
  text2: '#C3CCE8',
  text3: '#93A0C8',
} as const;

/** Renor's orb, from its bright core to the deep edge, plus the violet rim light. */
export const ORB = {
  core: '#E8F1FF',
  orb1: '#7FB2FF',
  orb2: '#3D7BFF',
  orb3: '#1F4FE0',
  violet: '#7A5CFF',
} as const;

export const ACCENT = { base: '#3D7BFF', hover: '#5C93FF' } as const;

/** Status colours. They tint badges; they never change what a status says. */
export const STATUS_COLOR = {
  live: '#2FD98B',
  preview: '#FFC24A',
  planned: '#8E9BC4',
  danger: '#FF5C7A',
} as const;

/** The light theme's counterparts, chosen for the same contrast ratios on light surfaces. */
export const LIGHT = {
  bg0: '#F6F8FD',
  bg1: '#FFFFFF',
  bg2: '#EDF1FA',
  bg3: '#E2E8F6',
  line: '#D3DBEE',
  lineStrong: '#AEBBDD',
  text1: '#0A1024',
  text2: '#2B3658',
  text3: '#4A5577',
  accent: '#1F4FE0',
} as const;

export const RADIUS = { sm: 8, md: 14, lg: 22 } as const;

export const EASE = {
  out: 'cubic-bezier(.22,1,.36,1)',
  spring: 'cubic-bezier(.34,1.56,.64,1)',
} as const;

/** Browser chrome and manifest colour: the page surface. */
export const THEME_COLOR = SURFACE.bg0;

/** WCAG relative luminance of a #RRGGBB colour. */
export function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
  const [r, g, b] = channels.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #RRGGBB colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
