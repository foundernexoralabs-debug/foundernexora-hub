// @polsia:user-owned — the founder's public display name is exactly "Ahmad" (first name only),
// as the founder confirmed on 9 November 2026. No other spelling and no full name may appear in
// anything the site serves: the source in src/ and every text file in public/.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FOUNDER } from '../../src/lib/business/founder';
import { llmsText } from '../../src/lib/business/llms';
import { identityGraph } from '../../src/lib/business/search-identity';

const root = path.resolve(__dirname, '../..');
const TEXT = /\.(ts|tsx|js|mjs|css|txt|md|json|svg|html|xml|webmanifest)$/;
/** Other spellings, and the surname, built from parts so this file never trips a site-wide search. */
const WRONG = new RegExp(`\\b(${['Ahm' + 'ed', 'Ahm' + 'et', 'Ahm' + 'adi'].join('|')})\\b`, 'i');

function textFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) return textFiles(file);
    return TEXT.test(name) ? [file] : [];
  });
}

describe('founder display name', () => {
  it('is exactly "Ahmad", first name only', () => {
    expect(FOUNDER.name).toBe('Ahmad');
    expect(FOUNDER.byline).toBe('Ahmad · Founder');
    expect(FOUNDER.alt.startsWith('Ahmad,')).toBe(true);
  });

  it('never appears misspelt, or with the surname, in src/ or public/ text files', () => {
    const files = [...textFiles(path.join(root, 'src')), ...textFiles(path.join(root, 'public'))];
    expect(files.length).toBeGreaterThan(50);
    const offenders = files.filter((file) => WRONG.test(readFileSync(file, 'utf-8')));
    expect(offenders.map((file) => path.relative(root, file))).toEqual([]);
  });

  it('is the name in the structured data and /llms.txt', () => {
    expect(JSON.stringify(identityGraph())).toContain('"name":"Ahmad"');
    expect(llmsText()).toContain('Founder: Ahmad.');
    expect(llmsText()).not.toMatch(WRONG);
  });
});
