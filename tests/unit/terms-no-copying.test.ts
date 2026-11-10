import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Founder direction (10 Nov 2026): nobody may copy Renor, and the website must say so.
describe('Terms: no copying of Renor', () => {
  const page = readFileSync('src/app/(custom)/terms/page.tsx', 'utf8');
  it('has its own section, listed in the contents', () => {
    expect(page).toContain("{ id: 'no-copying', title: 'No copying of Renor' }");
    expect(page).toContain('<h2 id="no-copying">No copying of Renor</h2>');
  });
  it('forbids cloning the product and brand, and using Renor to copy Renor, while allowing original work', () => {
    expect(page).toMatch(/may not copy, clone, imitate or reverse-engineer Renor/);
    expect(page).toMatch(/use Renor, its AI or this website to build a\s+copy of Renor/);
    expect(page).toMatch(/build your own, original products/);
  });
  it('makes clear the public source licence grants no brand rights', () => {
    expect(page).toMatch(/gives no right\s+to use the Renor or FounderLab names, logos, product design/);
  });
});
