// @polsia:user-owned — the company is FounderLab and its product is Renor.
// Guards against the retired company name creeping back into anything a visitor reads.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { siteDescription, siteName } from '../../src/lib/brand';

const srcDir = path.resolve(__dirname, '../../src');

/** Addresses that keep their original spelling on purpose: the public email and GitHub URLs. */
const KEPT_ADDRESSES = [
  /founder\.nexoralabs@gmail\.com/gi,
  /github\.com\/foundernexoralabs-debug\/[\w.-]+/gi,
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx?|css|svg)$/.test(entry) ? [full] : [];
  });
}

describe('brand', () => {
  it('names the company FounderLab and introduces Renor as its product', () => {
    expect(siteName).toBe('FounderLab');
    expect(siteDescription).toMatch(/^FounderLab builds Renor/);
  });

  it('never shows the retired company name outside the kept email and repository addresses', () => {
    for (const file of sourceFiles(srcDir)) {
      let text = readFileSync(file, 'utf-8');
      for (const kept of KEPT_ADDRESSES) text = text.replace(kept, '');
      expect(/nexora/i.test(text), path.relative(srcDir, file)).toBe(false);
    }
  });
});
