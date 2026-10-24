// @polsia:user-owned — founder presence: only the three approved photos, at their real sizes,
// with the approved alt text and line, and nothing invented.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FOUNDER, FOUNDER_PHOTO_READY, FOUNDER_PHOTOS } from '../../src/lib/business/founder';

const publicDir = path.resolve(__dirname, '../../public');

/** Width and height from a PNG's IHDR chunk. */
function pngSize(file: string) {
  const bytes = readFileSync(file);
  expect(bytes.subarray(1, 4).toString('latin1')).toBe('PNG');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('founder', () => {
  it('ships exactly the three approved photos', () => {
    expect(readdirSync(path.join(publicDir, 'founder')).sort()).toEqual([
      'founder_hero_wide_1600x900.png',
      'founder_portrait_1200.png',
      'founder_round_400.png',
    ]);
  });

  it('declares each photo at its real pixel size', () => {
    for (const photo of Object.values(FOUNDER_PHOTOS)) {
      const file = path.join(publicDir, photo.src.slice(1));
      expect(existsSync(file), file).toBe(true);
      expect(pngSize(file)).toEqual({ width: photo.width, height: photo.height });
    }
  });

  it('shows the photos only when all three exist', () => {
    const allThere = Object.values(FOUNDER_PHOTOS).every((photo) =>
      existsSync(path.join(publicDir, photo.src.slice(1))),
    );
    expect(FOUNDER_PHOTO_READY).toBe(allThere);
  });

  it('uses the approved name, alt text and line', () => {
    expect(FOUNDER.name).toBe('Ahmed');
    expect(FOUNDER.alt).toBe('Ahmed, founder of FounderLab, in front of the Renor blue orb glow');
    expect(FOUNDER.byline).toBe('Ahmed · Founder');
    expect(FOUNDER.line).toContain('I’m Ahmed');
    expect(FOUNDER.line).toContain('AI technology company for the long term');
  });

  it('makes no retired or invented claims', () => {
    const text = JSON.stringify(FOUNDER);
    expect(text).not.toMatch(/run by AI agents/i);
    expect(text).not.toMatch(/\bbots?\b/i);
    expect(text).not.toMatch(/\b(19|20)\d{2}\b/);
  });

  it('keeps the story paragraphs as a TODO for the founder, not invented text', () => {
    const source = readFileSync(
      path.resolve(__dirname, '../../src/lib/business/founder.ts'),
      'utf-8',
    );
    expect(source).toContain('TODO(owner)');
    expect(source).not.toMatch(/export const FOUNDER_STORY/);
  });
});
