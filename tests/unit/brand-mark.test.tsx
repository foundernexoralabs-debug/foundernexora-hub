// @polsia:user-owned — the brand mark is Renor's living orb: header and footer mark, favicon and
// apple-touch icon, and the Ask Renor launcher, all from one vector geometry.
//
// Deliberate change: the mark used to be an "F" with the orb as its dot. These tests pin the
// new identity (no "F" anywhere), keep the favicon a byte-for-byte still frame of the live mark,
// and hold the motion to compositor-only properties that stop under reduced motion.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FAVICON_SVG_OPTIONS,
  hslToHex,
  ORB_DETAIL,
  ORB_MOTION,
  ORB_SPARKLES,
  orbPalette,
  orbVar,
  orbVeins,
  renorOrbStillSvg,
} from '../../src/lib/business/living-orb';

vi.mock('../../src/components/custom/living-orb.css', () => ({}));
vi.mock('../../src/components/custom/receptionist/receptionist.css', () => ({}));

const { BrandMark } = await import('../../src/components/custom/brand-mark');
const { LivingOrb } = await import('../../src/components/custom/living-orb');
const { GuideOrb } = await import('../../src/components/custom/receptionist/guide-orb');

const root = path.resolve(__dirname, '../..');
const read = (file: string) => readFileSync(path.join(root, file), 'utf-8');
const orbCss = read('src/components/custom/living-orb.css');
const tokensCss = read('src/app/custom-style.css');

/** The old "F" glyph's path: it must not come back. */
const F_GLYPH = 'M10 8.5h12v3.2h-8.6v3.4h7.2v3.2h-7.2v5.2H10z';

describe('orb geometry', () => {
  it('is deterministic: the server render, hydration and the favicon draw the same orb', () => {
    for (const detail of ['mark', 'launcher'] as const) {
      expect(orbVeins(detail)).toEqual(orbVeins(detail));
      expect(orbVeins(detail, 'back')).toEqual(orbVeins(detail, 'back'));
      expect(orbVeins(detail)).not.toEqual(orbVeins(detail, 'back'));
    }
  });

  it('draws a real lightning web inside the sphere, denser for the launcher than the mark', () => {
    for (const detail of ['mark', 'launcher'] as const) {
      const { paths, nodes } = orbVeins(detail);
      const R = ORB_DETAIL[detail].radius;
      expect(paths.length).toBeGreaterThan(4);
      expect(nodes.length).toBeGreaterThan(3);
      for (const d of paths) {
        expect(d).toMatch(/^M[\d. ]+(L[\d. ]+)+$/);
        const numbers = d.match(/[\d.]+/g)?.map(Number) ?? [];
        for (let i = 0; i < numbers.length; i += 2) {
          const x = numbers[i] ?? 0;
          const y = numbers[i + 1] ?? 0;
          expect(Math.hypot(x - 50, y - 50)).toBeLessThanOrEqual(R + 0.2);
        }
      }
    }
    expect(orbVeins('launcher').paths.length).toBeGreaterThan(orbVeins('mark').paths.length);
  });

  it('keeps every sparkle inside the orb box so the mark never shifts layout', () => {
    for (const sparkle of ORB_SPARKLES) {
      expect(sparkle.x - sparkle.size / 2).toBeGreaterThanOrEqual(0);
      expect(sparkle.x + sparkle.size / 2).toBeLessThanOrEqual(100);
      expect(sparkle.y - sparkle.size / 2).toBeGreaterThanOrEqual(0);
      expect(sparkle.y + sparkle.size / 2).toBeLessThanOrEqual(100);
    }
  });

  it('converts HSL to hex correctly', () => {
    expect(hslToHex([0, 100, 50])).toBe('#ff0000');
    expect(hslToHex([120, 100, 25])).toBe('#008000');
    expect(hslToHex([0, 0, 100])).toBe('#ffffff');
  });
});

describe('header and footer mark', () => {
  it('is the living orb, decorative, with no "F" glyph and no text', () => {
    const html = renderToStaticMarkup(createElement(BrandMark));
    expect(html).toMatch(/^<span aria-hidden="true"[^>]*class="lorb lorb--mark size-\[30px\]"/);
    expect(html).not.toContain(F_GLYPH);
    expect(html).not.toMatch(/<text|<title/);
    expect(html.replace(/<[^>]+>/g, '')).toBe('');
    // Every inner SVG is hidden from assistive tech and out of the tab order.
    const svgs = html.match(/<svg[^>]*>/g) ?? [];
    expect(svgs.length).toBeGreaterThanOrEqual(4);
    for (const svg of svgs) expect(svg).toContain('aria-hidden="true"');
  });

  it('accepts a size override (the setup page uses a 16px mark)', () => {
    const html = renderToStaticMarkup(createElement(BrandMark, { className: 'size-4' }));
    expect(html).toContain('class="lorb lorb--mark size-4"');
  });

  it('gives each instance its own gradient ids, so header and footer marks never collide', () => {
    const html = renderToStaticMarkup(
      createElement('div', null, createElement(BrandMark), createElement(BrandMark)),
    );
    const ids = html.match(/ id="([^"]+)"/g) ?? [];
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is used beside the visible site name in the header and the footer', () => {
    const nav = read('src/components/custom/site-nav.tsx');
    expect(nav.match(/<BrandMark \/>\s*<span>\{siteName\}<\/span>/g)).toHaveLength(2);
  });
});

describe('favicon and apple-touch icon', () => {
  it('icon.svg is the still pose of the live mark, byte for byte', () => {
    expect(read('src/app/icon.svg')).toBe(`${renorOrbStillSvg(FAVICON_SVG_OPTIONS)}\n`);
  });

  it('icon.svg is a self-contained vector: no "F", scripts, CSS variables or filters', () => {
    const svg = read('src/app/icon.svg');
    expect(svg).not.toContain(F_GLYPH);
    expect(svg).not.toMatch(/<script|var\(|<filter|<image|href="http/);
    expect(svg).toMatch(/viewBox="0 0 100 100"/);
    expect(svg).toContain('aria-label="FounderLab"');
  });

  it('the apple-touch icon draws the same still orb on an opaque background', () => {
    const icon = read('src/app/apple-icon.tsx');
    expect(icon).toMatch(/renorOrbStillSvg\(\{[^}]*background: SURFACE\.bg0/);
    expect(icon).toMatch(/size = \{ width: 180, height: 180 \}/);
    const opaque = renorOrbStillSvg({ size: 180, background: '#05070F', scale: 0.92 });
    expect(opaque).toContain('<rect width="100" height="100" fill="#05070F"/>');
  });
});

describe('palette', () => {
  const block = (selector: string) => {
    const start = tokensCss.indexOf(`${selector} {`);
    expect(start, selector).toBeGreaterThan(-1);
    return tokensCss.slice(start, tokensCss.indexOf('}', start));
  };

  it('keeps the token colours in step with the palette the favicon uses, in both themes', () => {
    for (const [theme, selector] of [
      ['light', '\n.lorb'],
      ['dark', 'html.dark .lorb'],
    ] as const) {
      const css = block(selector);
      for (const [name, hex] of Object.entries(orbPalette(theme))) {
        expect(css, `${theme} ${name}`).toContain(
          `${orbVar(name as keyof ReturnType<typeof orbPalette>)}: ${hex};`,
        );
      }
    }
  });
});

describe('motion', () => {
  const keyframes = [...orbCss.matchAll(/@keyframes ([\w-]+) \{([\s\S]*?)\n\}/g)];

  it('animates only transform and opacity, so the compositor runs it', () => {
    expect(keyframes.length).toBeGreaterThanOrEqual(6);
    for (const [, name, body] of keyframes) {
      const properties = [...(body ?? '').matchAll(/^\s+([a-z-]+):/gm)].map((m) => m[1]);
      for (const property of properties) {
        expect(['transform', 'opacity'], `${name}: ${property}`).toContain(property);
      }
      // Custom properties inside keyframes would keep the animation off the compositor.
      expect(body, name).not.toContain('var(');
    }
  });

  it('loops only when motion is welcome; the base rules are the still pose', () => {
    const [stillPose, live = ''] = orbCss.split('@media (prefers-reduced-motion: no-preference)');
    expect(stillPose).not.toMatch(/animation:/);
    expect(stillPose).not.toMatch(/infinite/);
    expect(live).toMatch(/infinite/);
    // The still pose shows a lit sparkle and the glint at rest.
    expect(stillPose).toMatch(/\[data-sparkle="0"\] \{\s*opacity: 1;/);
  });

  it('pauses while off-screen or while the tab is hidden, whatever selector set the animation', () => {
    expect(orbCss).toMatch(
      /\.lorb\[data-orb-offscreen\],\s*html\[data-tab-hidden\] \.lorb \{\s*--lorb-play: paused;/,
    );
    // Every animation shorthand is followed by the play state it inherits.
    const shorthands = orbCss.match(/\n\s+animation: [^;]+;/g) ?? [];
    const followed = orbCss.match(
      /\n\s+animation: [^;]+;\n\s+animation-play-state: var\(--lorb-play\);/g,
    );
    expect(shorthands.length).toBeGreaterThan(0);
    expect(followed).toHaveLength(shorthands.length);
    expect(orbCss).not.toContain('!important');
  });

  it('keeps the CSS periods in step with ORB_MOTION', () => {
    const s = (ms: number) => `${ms / 1000}s`;
    expect(orbCss).toContain(`lorb-turn ${s(ORB_MOTION.plasma)} linear infinite`);
    expect(orbCss).toContain(`lorb-turn-back ${s(ORB_MOTION.plasmaBack)} linear infinite`);
    expect(orbCss).toContain(`lorb-sweep ${s(ORB_MOTION.orbit)} linear infinite`);
    expect(orbCss).toContain(`lorb-orbit ${s(ORB_MOTION.mote)} linear infinite`);
    expect(orbCss).toContain(`lorb-mote ${s(ORB_MOTION.mote)} linear infinite`);
    expect(orbCss).toContain(`lorb-breathe ${s(ORB_MOTION.corona)}`);
    const [first, second] = ORB_MOTION.sparkles;
    expect(orbCss).toContain(`lorb-twinkle ${s(first)}`);
    expect(orbCss).toContain(`animation-duration: ${s(second)}`);
  });

  it('steps the mark on one 12fps grid, so its changes always land on the same frames', () => {
    const { fps, orbit, sparkle, sparkleDelay } = ORB_MOTION.mark;
    const step = 1000 / fps;
    const steps = (ms: number) => ms / step;
    for (const ms of [ORB_MOTION.plasma, orbit, sparkle, sparkleDelay]) {
      expect(Number.isInteger(steps(ms)), `${ms}ms`).toBe(true);
    }
    expect(orbCss).toContain(
      `lorb-turn ${ORB_MOTION.plasma / 1000}s steps(${steps(ORB_MOTION.plasma)}) infinite`,
    );
    expect(orbCss).toContain(`lorb-sweep ${orbit / 1000}s steps(${steps(orbit)}) infinite`);
    // The sparkle's keyframe segments (2.5% of its cycle) are three steps each.
    expect(steps(sparkle * 0.025)).toBe(3);
    expect(orbCss).toContain(
      `lorb-twinkle-mark ${sparkle / 1000}s steps(3) ${sparkleDelay / 1000}s infinite`,
    );
    expect(orbCss).toMatch(
      /@keyframes lorb-twinkle-mark \{\s*0% \{[\s\S]*?2\.5% \{[\s\S]*?5%,\s*100% \{/,
    );
  });

  it('gives the mark three moving parts and the launcher seven, nothing more', () => {
    const live = orbCss.split('@media (prefers-reduced-motion: no-preference)')[1] ?? '';
    const count = (detail: string) =>
      [
        ...live.matchAll(
          new RegExp(
            `\\.lorb--${detail}:not\\(\\[data-orb-still\\]\\) [^{]+\\{\\s*(?:opacity: 0;\\s*)?animation: `,
            'g',
          ),
        ),
      ].length;
    expect(count('mark')).toBe(3);
    expect(count('launcher')).toBe(7);
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
    container = document.createElement('div');
    document.body.append(container);
    reactRoot = createRoot(container);
  });

  afterEach(() => {
    act(() => reactRoot.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it('watches a live orb for visibility, and leaves a still one alone', () => {
    act(() => {
      reactRoot.render(
        createElement('div', null, [
          createElement(LivingOrb, { key: 'live', detail: 'launcher' }),
          createElement(LivingOrb, { key: 'still', animate: false }),
        ]),
      );
    });
    const [live, still] = container.querySelectorAll('.lorb');
    expect(live?.classList.contains('lorb--launcher')).toBe(true);
    expect(live?.hasAttribute('data-orb-still')).toBe(false);
    expect(still?.hasAttribute('data-orb-still')).toBe(true);
    expect(observed).toEqual([live]);
  });

  it('keeps Guide avatars still unless the Guide is thinking', () => {
    act(() => {
      reactRoot.render(
        createElement('div', null, [
          createElement(GuideOrb, { key: 'a' }),
          createElement(GuideOrb, { key: 'b', thinking: true }),
          createElement(GuideOrb, { key: 'c', detail: 'launcher', className: 'size-16' }),
        ]),
      );
    });
    const [avatar, thinking, welcome] = container.querySelectorAll('.lorb');
    expect(avatar?.hasAttribute('data-orb-still')).toBe(true);
    expect(thinking?.getAttribute('data-orb-state')).toBe('thinking');
    expect(thinking?.hasAttribute('data-orb-still')).toBe(false);
    expect(welcome?.classList.contains('lorb--launcher')).toBe(true);
    expect(welcome?.hasAttribute('data-orb-still')).toBe(false);
  });
});

describe('Ask Renor launcher', () => {
  it('draws the vector orb, keeps its accessible name, and no longer ships the raster', () => {
    const source = read('src/components/custom/orb-launcher.tsx');
    expect(source).toContain('<LivingOrb detail="launcher"');
    expect(source).toContain('aria-label="Ask Renor: questions and problem reports"');
    expect(source).not.toContain('RenorOrb');
    expect(read('src/components/custom/orb-launcher.css')).not.toContain('.renor-orb');
  });
});

describe('detail', () => {
  it('keeps the mark simple: one sparkle and no orbiting mote', () => {
    const html = renderToStaticMarkup(createElement(BrandMark));
    expect(html.match(/class="lorb-sparkle"/g)).toHaveLength(1);
    expect(html).not.toContain('lorb-mote');
  });

  it('gives the launcher the full orb: two sparkles and the mote', () => {
    const html = renderToStaticMarkup(createElement(LivingOrb, { detail: 'launcher' }));
    expect(html.match(/class="lorb-sparkle"/g)).toHaveLength(2);
    expect(html).toContain('lorb-mote');
  });

  it('holds the 16px mark in the home hero chip still', () => {
    expect(read('src/app/(setup)/page.tsx')).toContain(
      '<BrandMark className="size-4" animate={false} />',
    );
    const html = renderToStaticMarkup(createElement(BrandMark, { animate: false }));
    expect(html).toContain('data-orb-still=""');
  });
});
