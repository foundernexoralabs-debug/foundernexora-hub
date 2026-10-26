// @polsia:user-owned — the brand mark is Renor's living orb, the Renor app's own: header and
// footer mark, the Ask Renor launcher, the Guide, and the favicon and apple-touch icon made from
// the approved picture.
//
// Founder, 26 Oct: keep the blue orb that flashes and sparkles, the shape it had; no "F". These
// tests pin that: no "F" glyph anywhere, the mark is decorative beside the visible name, every
// orb is FounderOrb (the app's engine and picture), and the hand-drawn vector orb is gone.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LAUNCHER_ORB_STATE } from '../../src/lib/business/orb-launcher';

vi.mock('../../src/components/custom/founder-orb.css', () => ({}));
vi.mock('../../src/components/custom/receptionist/receptionist.css', () => ({}));

const { BrandMark } = await import('../../src/components/custom/brand-mark');
const { FounderOrb } = await import('../../src/components/custom/founder-orb');
const { GuideOrb } = await import('../../src/components/custom/receptionist/guide-orb');

const root = path.resolve(__dirname, '../..');
const read = (file: string) => readFileSync(path.join(root, file), 'utf-8');
const exists = (file: string) => existsSync(path.join(root, file));

/** The old "F" glyph's path: it must not come back. */
const F_GLYPH = 'M10 8.5h12v3.2h-8.6v3.4h7.2v3.2h-7.2v5.2H10z';

describe('header and footer mark', () => {
  it('is the living orb, decorative, with no "F" glyph and no text', () => {
    const html = renderToStaticMarkup(createElement(BrandMark));
    expect(html).toMatch(
      /^<span aria-hidden="true" data-live="true" class="fl-orb-mark size-\[30px\]"/,
    );
    expect(html).toContain('class="fl-orb fl-orb--active fl-orb--compact"');
    expect(html).toContain('<canvas');
    expect(html).not.toContain(F_GLYPH);
    expect(html).not.toMatch(/<text|<title|<path/);
    expect(html.replace(/<[^>]+>/g, '')).toBe('');
  });

  it('accepts a size override, and holds a still frame when told to (the 16px hero chip)', () => {
    const html = renderToStaticMarkup(
      createElement(BrandMark, { className: 'size-4', animate: false }),
    );
    expect(html).toContain('class="fl-orb-mark size-4"');
    expect(html).toContain('data-live="false"');
    expect(html).toContain('data-orb-running="false"');
    expect(read('src/app/(setup)/page.tsx')).toContain(
      '<BrandMark className="size-4" animate={false} />',
    );
  });

  it('is used beside the visible site name in the header and the footer', () => {
    const nav = read('src/components/custom/site-nav.tsx');
    expect(nav.match(/<BrandMark \/>\s*<span>\{siteName\}<\/span>/g)).toHaveLength(2);
  });

  it('stands in with the approved picture before the canvas paints', () => {
    const html = renderToStaticMarkup(createElement(BrandMark));
    expect(html).toContain(
      '--orb-texture:url(&quot;/assets/renor/founderlab-energy-orb.png&quot;)',
    );
    expect(read('src/components/custom/founder-orb.css')).toMatch(
      /\.fl-orb-body \{[^}]*background: var\(--orb-texture\)/,
    );
  });
});

describe('favicon and apple-touch icon', () => {
  const png = (file: string) => readFileSync(path.join(root, file));

  it("are made from the approved picture: PNG icons, and the manifest's icon.svg carries it", () => {
    const icon = png('src/app/icon.png');
    expect(icon.subarray(1, 4).toString()).toBe('PNG');
    expect(icon.readUInt32BE(16)).toBe(64);
    const apple = png('src/app/apple-icon.png');
    expect(apple.readUInt32BE(16)).toBe(180);
    expect(apple[25], 'opaque: iOS needs a filled square').toBe(2);
    const svg = read('src/app/icon.svg');
    expect(svg).toMatch(
      /^<svg [^>]*aria-label="FounderLab"><image [^>]*href="data:image\/png;base64,/,
    );
    expect(svg).not.toContain(F_GLYPH);
    expect(svg).not.toMatch(/<script|<path|href="http/);
  });

  it('drops the vector drawing they used to come from', () => {
    expect(exists('src/app/apple-icon.tsx')).toBe(false);
    expect(exists('src/lib/business/living-orb.ts')).toBe(false);
    expect(exists('src/components/custom/living-orb.tsx')).toBe(false);
    expect(exists('src/components/custom/renor-orb.tsx')).toBe(false);
  });
});

describe('Ask Renor launcher', () => {
  it('draws the living orb, keeps its accessible name, and maps its states to orb energy', () => {
    const source = read('src/components/custom/orb-launcher.tsx');
    expect(source).toContain('<FounderOrb state={LAUNCHER_ORB_STATE[state]}');
    expect(source).toContain('aria-label="Ask Renor: questions and problem reports"');
    expect(source).not.toMatch(/LivingOrb|RenorOrb/);
    expect(read('src/components/custom/orb-launcher.css')).not.toMatch(/\.renor-orb|lorb/);
    expect(LAUNCHER_ORB_STATE).toEqual({
      idle: 'active',
      hover: 'active',
      typing: 'listening',
      answering: 'generating',
      error: 'active',
    });
  });
});

describe('every orb on the site is the one living orb', () => {
  it('uses FounderOrb in the /renor hero, the 404 page, the Guide and the founder avatar', () => {
    for (const file of [
      'src/app/(custom)/renor/page.tsx',
      'src/app/not-found.tsx',
      'src/components/custom/founder.tsx',
      'src/components/custom/receptionist/guide-orb.tsx',
    ]) {
      const source = read(file);
      expect(source, file).toContain('<FounderOrb');
      expect(source, file).not.toMatch(/RenorOrb|LivingOrb/);
    }
  });
});

describe('living orb in the page', () => {
  let container: HTMLDivElement;
  let reactRoot: Root;
  const observed: Element[] = [];

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    observed.length = 0;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe(node: Element) {
          observed.push(node);
        }
        unobserve() {}
        disconnect() {}
      },
    );
    // jsdom has no 2D canvas; the orb keeps its picture stand-in.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    container = document.createElement('div');
    document.body.append(container);
    reactRoot = createRoot(container);
  });

  afterEach(() => {
    act(() => reactRoot.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('watches every orb for visibility, and runs only the ones allowed to move', () => {
    act(() => {
      reactRoot.render(
        createElement('div', null, [
          createElement(FounderOrb, { key: 'live', size: 56, state: 'active' }),
          createElement(FounderOrb, { key: 'still', size: 30, animate: false }),
        ]),
      );
    });
    const [live, still] = container.querySelectorAll('.fl-orb');
    expect(live?.getAttribute('data-orb-running')).toBe('true');
    expect(still?.getAttribute('data-orb-running')).toBe('false');
    expect(observed).toEqual([live, still]);
  });

  it('pauses while the tab is hidden', () => {
    act(() => {
      reactRoot.render(createElement(FounderOrb, { size: 56, state: 'active' }));
    });
    const orb = container.querySelector('.fl-orb');
    expect(orb?.getAttribute('data-orb-running')).toBe('true');
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(orb?.getAttribute('data-orb-running')).toBe('false');
    expect(orb?.getAttribute('data-orb-active')).toBe('false');
  });

  it('keeps Guide avatars still unless the Guide is thinking; the welcome orb lives', () => {
    act(() => {
      reactRoot.render(
        createElement('div', null, [
          createElement(GuideOrb, { key: 'a' }),
          createElement(GuideOrb, { key: 'b', thinking: true }),
          createElement(GuideOrb, { key: 'c', welcome: true, className: 'size-16' }),
        ]),
      );
    });
    const [avatar, thinking, welcome] = container.querySelectorAll('.fl-orb');
    expect(avatar?.getAttribute('data-orb-running')).toBe('false');
    expect(thinking?.getAttribute('data-orb-state')).toBe('thinking');
    expect(thinking?.getAttribute('data-orb-running')).toBe('true');
    expect(welcome?.getAttribute('data-orb-state')).toBe('active');
    expect(welcome?.getAttribute('data-orb-running')).toBe('true');
  });

  it('names itself only when given a label', () => {
    act(() => {
      reactRoot.render(createElement(FounderOrb, { size: 56, label: 'Renor is thinking' }));
    });
    const orb = container.querySelector('.fl-orb');
    expect(orb?.getAttribute('role')).toBe('status');
    expect(orb?.getAttribute('aria-label')).toBe('Renor is thinking');
    expect(orb?.hasAttribute('aria-hidden')).toBe(false);
  });
});
