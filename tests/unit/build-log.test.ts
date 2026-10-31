// @polsia:user-owned — the build log: every entry carries one honest kind tag, and the tags
// are only a reading of entries that already exist.
import { describe, expect, it } from 'vitest';
import { MILESTONE_KIND, MILESTONES } from '../../src/lib/business/ecosystem';

describe('build log', () => {
  it('tags every entry with a known kind', () => {
    for (const entry of MILESTONES) expect(Object.keys(MILESTONE_KIND)).toContain(entry.kind);
  });

  it('labels the kinds Shipped, Fix and Test', () => {
    expect(Object.values(MILESTONE_KIND).map((kind) => kind.label)).toEqual([
      'Shipped',
      'Fix',
      'Test',
    ]);
  });

  it('tags a fix only where the entry itself describes fixing or removing something', () => {
    for (const entry of MILESTONES.filter((item) => item.kind === 'fix'))
      expect(entry.detail, entry.title).toMatch(/fix|removed|rewritten/i);
  });

  it('tags a test only where the entry itself says it was tested', () => {
    for (const entry of MILESTONES.filter((item) => item.kind === 'test'))
      expect(`${entry.title} ${entry.detail}`, entry.title).toMatch(/tested|tests/i);
  });
});
