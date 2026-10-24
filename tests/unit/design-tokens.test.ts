// @polsia:user-owned — the v2 design tokens: CSS and TS agree, and every text colour passes
// WCAG AA (4.5:1) on every surface it can sit on, in both themes.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ACCENT,
  contrastRatio,
  INK,
  LIGHT,
  ORB,
  STATUS_COLOR,
  SURFACE,
  THEME_COLOR,
} from '../../src/lib/design-tokens';

const css = readFileSync(path.resolve(__dirname, '../../src/app/custom-style.css'), 'utf-8');

/** The value of `--name` inside the first block that starts with `selector {`. */
function tokenIn(selector: string, name: string): string | undefined {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return undefined;
  const block = css.slice(start, css.indexOf('\n}', start));
  return block
    .match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]
    ?.trim()
    .toLowerCase();
}

describe('design tokens', () => {
  it('ships the brief’s dark surfaces and text exactly', () => {
    const expected: Record<string, string> = {
      'bg-0': SURFACE.bg0,
      'bg-1': SURFACE.bg1,
      'bg-2': SURFACE.bg2,
      'bg-3': SURFACE.bg3,
      line: SURFACE.line,
      'line-strong': SURFACE.lineStrong,
      'text-1': INK.text1,
      'text-2': INK.text2,
      'text-3': INK.text3,
    };
    for (const [name, hex] of Object.entries(expected)) {
      expect(tokenIn('html.dark', name), name).toBe(hex.toLowerCase());
    }
    expect(SURFACE.bg0).toBe('#05070F');
    expect(INK.text3).toBe('#93A0C8');
  });

  it('ships the light counterparts from the same module', () => {
    expect(tokenIn('html:root', 'bg-0')).toBe(LIGHT.bg0.toLowerCase());
    expect(tokenIn('html:root', 'text-3')).toBe(LIGHT.text3.toLowerCase());
    expect(tokenIn('html:root', 'link')).toBe(LIGHT.accent.toLowerCase());
  });

  it('ships the orb, accent and status colours', () => {
    const shared: Record<string, string> = {
      'orb-core': ORB.core,
      'orb-1': ORB.orb1,
      'orb-2': ORB.orb2,
      'orb-3': ORB.orb3,
      'orb-violet': ORB.violet,
      'brand-accent': ACCENT.base,
      'brand-accent-hover': ACCENT.hover,
      live: STATUS_COLOR.live,
      preview: STATUS_COLOR.preview,
      planned: STATUS_COLOR.planned,
      danger: STATUS_COLOR.danger,
    };
    for (const [name, hex] of Object.entries(shared)) {
      expect(tokenIn(':root', name), name).toBe(hex.toLowerCase());
    }
  });

  it('defines the easings, radii and glows', () => {
    expect(css).toMatch(/--ease-out:\s*cubic-bezier\(0\.22, 1, 0\.36, 1\)/);
    expect(css).toMatch(/--ease-spring:\s*cubic-bezier\(0\.34, 1\.56, 0\.64, 1\)/);
    for (const radius of ['--r-sm: 8px', '--r-md: 14px', '--r-lg: 22px', '--r-pill: 9999px']) {
      expect(css).toContain(radius);
    }
    for (const glow of ['--glow-sm', '--glow-md', '--glow-lg']) expect(css).toContain(`${glow}:`);
  });

  it('uses the brief’s H1 size', () => {
    expect(css).toContain('font-size: clamp(2.75rem, 6vw + 1rem, 5.5rem);');
  });

  it('keeps every text colour at WCAG AA or better on every dark surface', () => {
    for (const text of Object.values(INK)) {
      for (const surface of [SURFACE.bg0, SURFACE.bg1, SURFACE.bg2, SURFACE.bg3]) {
        expect(contrastRatio(text, surface), `${text} on ${surface}`).toBeGreaterThanOrEqual(4.5);
      }
    }
    expect(contrastRatio(ORB.orb1, SURFACE.bg2)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps every text colour at WCAG AA or better on every light surface', () => {
    for (const text of [LIGHT.text1, LIGHT.text2, LIGHT.text3, LIGHT.accent]) {
      for (const surface of [LIGHT.bg0, LIGHT.bg1, LIGHT.bg2, LIGHT.bg3]) {
        expect(contrastRatio(text, surface), `${text} on ${surface}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('computes contrast the WCAG way', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('uses the deepest surface as the browser theme colour', () => {
    expect(THEME_COLOR).toBe('#05070F');
  });
});
