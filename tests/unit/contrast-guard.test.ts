// @polsia:user-owned — v2 contrast rules, checked across the source:
//   - no text under 14px (no text-xs, no arbitrary sizes below 0.875rem / 14px);
//   - no hard-coded hex colours in components or pages (colours come from the tokens;
//     src/lib/design-tokens.ts is the one TS place that holds them, for next/og and the manifest);
//   - no faded text (opacity utilities on text) that would drop below the faintest token.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const srcDir = path.resolve(__dirname, '../../src');

function files(dir: string, pattern: RegExp): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return files(full, pattern);
    return pattern.test(entry) ? [full] : [];
  });
}

const markup = files(srcDir, /\.tsx$/);

describe('contrast guard', () => {
  it('has no text smaller than 14px', () => {
    for (const file of markup) {
      const text = readFileSync(file, 'utf-8');
      const rel = path.relative(srcDir, file);
      expect(/\btext-xs\b/.test(text), `${rel}: text-xs`).toBe(false);
      for (const match of text.matchAll(/text-\[(\d*\.?\d+)(rem|px)\]/g)) {
        const px = match[2] === 'rem' ? Number(match[1]) * 16 : Number(match[1]);
        expect(px, `${rel}: ${match[0]}`).toBeGreaterThanOrEqual(14);
      }
    }
  });

  it('has no hard-coded hex colours outside the token module', () => {
    for (const file of files(srcDir, /\.(tsx?|css)$/)) {
      const rel = path.relative(srcDir, file);
      if (
        rel === path.join('lib', 'design-tokens.ts') ||
        rel === path.join('app', 'custom-style.css')
      )
        continue;
      if (rel === path.join('app', 'globals.css')) continue;
      const text = readFileSync(file, 'utf-8');
      // `#` followed by 3, 4, 6 or 8 hex digits and a non-word boundary: a colour literal.
      const hits = text.match(/(?<![\w&/])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g);
      expect(hits, rel).toBeNull();
    }
  });

  it('never fades text with an opacity utility', () => {
    for (const file of markup) {
      const text = readFileSync(file, 'utf-8');
      const rel = path.relative(srcDir, file);
      expect(/text-(?:muted-)?foreground\/\d+/.test(text), rel).toBe(false);
    }
  });
});
