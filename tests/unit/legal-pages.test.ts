// @polsia:user-owned — legal pages: every "On this page" entry points at a heading on the page
// with the same words, every heading is listed, and the date is the page's own.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const pages = ['privacy', 'terms', 'accessibility'] as const;
const read = (page: string) =>
  readFileSync(path.resolve(__dirname, `../../src/app/(custom)/${page}/page.tsx`), 'utf-8');
const squash = (text: string) => text.replace(/\s+/g, ' ').trim();

describe.each(pages)('/%s', (page) => {
  const source = read(page);
  const sections = [...source.matchAll(/\{ id: '([^']+)', title: '([^']+)' \}/g)].map((m) => ({
    id: m[1],
    title: m[2],
  }));
  const headings = [...source.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => ({
    id: m[1],
    title: squash(m[2] ?? ''),
  }));

  it('lists every heading, in order, with its exact words', () => {
    expect(sections.length).toBeGreaterThan(2);
    expect(sections).toEqual(headings);
  });

  it('has no heading without an id', () => {
    expect(source).not.toMatch(/<h2>/);
  });

  it('shows the date the page already states', () => {
    expect(source).toMatch(/const UPDATED = '\d{1,2} [A-Z][a-z]+ 2026';/);
    expect(source).toMatch(/date=\{UPDATED\}/);
  });
});

describe('skip link target', () => {
  it('every page <main> is the skip link target', async () => {
    const { readdirSync, statSync } = await import('node:fs');
    const root = path.resolve(__dirname, '../../src/app');
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((name) => {
        const full = path.join(dir, name);
        return statSync(full).isDirectory() ? walk(full) : full.endsWith('.tsx') ? [full] : [];
      });
    for (const file of walk(root)) {
      const text = readFileSync(file, 'utf-8');
      for (const tag of text.match(/<main\b[^>]*>/g) ?? [])
        expect(tag, path.relative(root, file)).toMatch(/id="main"\s+tabIndex=\{-1\}/);
    }
  });
});
