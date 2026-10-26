// @polsia:user-owned — Renor's living orb engine (src/lib/orb), ported from the Renor app with
// the app's own tests (test/living-orb.test.mjs, test/founder-orb-texture.test.mjs,
// test/founder-orb.test.mjs). The website's orb must stay the app's orb: the approved picture,
// the same lightning, the same energy per state, the same cost bounds.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createOrbArc,
  createOrbEngine,
  orbTierLayout,
  shapeOrbArc,
} from '../../src/lib/orb/engine';
import {
  createSeededRandom,
  displaceSegment,
  generateLightningPath,
  seedFromString,
} from '../../src/lib/orb/lightning';
import { createOrbPalette, ORB_DEFAULT_HUE, orbColor } from '../../src/lib/orb/palette';
import {
  activeOrbFrameCount,
  getOrbEnvironment,
  getServerOrbEnvironment,
  subscribeOrbFrame,
} from '../../src/lib/orb/runtime';
import {
  FOUNDER_ORB_STATES,
  type FounderOrbState,
  founderOrbEnergy,
  founderOrbTier,
  isFounderOrbActive,
  normalizeFounderOrbSignal,
  normalizeFounderOrbState,
  shouldRunFounderOrbLoop,
} from '../../src/lib/orb/state';
import { readOrbStillFrame } from '../../src/lib/orb/still-frame';
import {
  extractOrbVeins,
  getOrbTexture,
  hueRotateMatrix,
  loadOrbTexture,
  ORB_TEXTURE_GEOMETRY,
  ORB_TEXTURE_HUE,
  ORB_TEXTURE_URL,
  orbTextureMatrix,
  orbTextureRecipe,
  resetOrbTextureForTests,
  subscribeOrbTexture,
  tintOrbPixels,
} from '../../src/lib/orb/texture';

const root = path.resolve(__dirname, '../..');
const read = (file: string) => readFileSync(path.join(root, file));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("the founder's picture", () => {
  it('ships as the approved 440×440 RGBA PNG, served where the orb loads it', () => {
    const png = read(`public${ORB_TEXTURE_URL}`);
    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(ORB_TEXTURE_GEOMETRY.width);
    expect(png.readUInt32BE(20)).toBe(ORB_TEXTURE_GEOMETRY.height);
    expect(png[25], 'RGBA: the globe sits on transparency').toBe(6);
  });

  it("keeps its own colour at the website's orb colour (the app default)", () => {
    expect(ORB_DEFAULT_HUE).toBe(212);
    const blue = orbTextureRecipe(createOrbPalette({ hue: ORB_DEFAULT_HUE, tone: 'active' }));
    expect(Math.abs(blue.rotate)).toBeLessThanOrEqual(1);
    const red = orbTextureRecipe(createOrbPalette({ tone: 'alert' }));
    expect(red.rotate).toBe(352 - ORB_TEXTURE_HUE);
    const off = orbTextureRecipe(createOrbPalette({ tone: 'ember' }));
    expect(off.saturate < 0.3 && off.brightness < 0.7).toBe(true);
  });

  it('recolours without touching alpha; the identity leaves pixels alone', () => {
    const sample = () => new Uint8ClampedArray([14, 101, 188, 255, 120, 220, 255, 200, 0, 0, 0, 0]);
    const same = tintOrbPixels(sample(), { rotate: 0, saturate: 1, brightness: 1 });
    expect(Array.from(same)).toEqual(Array.from(sample()));
    const red = tintOrbPixels(sample(), orbTextureRecipe(createOrbPalette({ tone: 'alert' })));
    expect(red[0] ?? 0).toBeGreaterThan(red[2] ?? 0);
    expect(red[3]).toBe(255);
    expect(red[7]).toBe(200);
    expect(Array.from(red.slice(8))).toEqual([0, 0, 0, 0]);
    hueRotateMatrix(360).forEach((value, index) => {
      expect(Math.abs(value - ([1, 0, 0, 0, 1, 0, 0, 0, 1][index] ?? 0))).toBeLessThan(1e-9);
    });
    const grey = orbTextureMatrix({ rotate: 0, saturate: 0, brightness: 1 });
    expect(Math.abs((grey[0] ?? 0) - (grey[3] ?? 1))).toBeLessThan(1e-9);
  });

  it('extracts the lightning veins and drops the dark body', () => {
    const pixels = extractOrbVeins(
      new Uint8ClampedArray([5, 30, 90, 255, 200, 245, 255, 255, 60, 150, 230, 255]),
    );
    expect(pixels[3]).toBe(0);
    expect(pixels[7]).toBe(255);
    expect((pixels[11] ?? 0) > 0 && (pixels[11] ?? 0) < 255).toBe(true);
  });

  it('loads once for every orb on the page, and reports a failure', async () => {
    resetOrbTextureForTests();
    const created: unknown[] = [];
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        decoding = '';
        constructor() {
          created.push(this);
        }
        set src(value: string) {
          queueMicrotask(() => (value.includes('missing') ? this.onerror?.() : this.onload?.()));
        }
        decode() {
          return Promise.resolve();
        }
      },
    );
    const seen: string[] = [];
    const stop = subscribeOrbTexture(() => seen.push(getOrbTexture().status));
    loadOrbTexture();
    loadOrbTexture();
    expect(created).toHaveLength(1);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(seen).toEqual(['loading', 'ready']);
    stop();
    resetOrbTextureForTests();
    loadOrbTexture('/missing.png');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(getOrbTexture().status).toBe('failed');
    resetOrbTextureForTests();
  });
});

describe('lightning', () => {
  it('is deterministic for a seed and stays in [0, 1)', () => {
    const a = createSeededRandom(42);
    const b = createSeededRandom(42);
    const c = createSeededRandom(43);
    const first = Array.from({ length: 200 }, () => a());
    expect(Array.from({ length: 200 }, () => b())).toEqual(first);
    expect(Array.from({ length: 200 }, () => c())).not.toEqual(first);
    for (const value of first) expect(value >= 0 && value < 1).toBe(true);
    expect(seedFromString('renor')).toBe(seedFromString('renor'));
    expect(seedFromString('renor')).not.toBe(seedFromString('Renor'));
    expect(generateLightningPath({ seed: 1234 })).toEqual(generateLightningPath({ seed: 1234 }));
  });

  it('keeps its anchors and doubles its detail per level', () => {
    for (const depth of [1, 3, 5, 6]) {
      const points = displaceSegment({ depth, roughness: 0.3, random: createSeededRandom(depth) });
      expect(points.length / 2).toBe(2 ** depth + 1);
      expect(points.slice(0, 2)).toEqual([0, 0]);
      expect(points.slice(-2)).toEqual([1, 0]);
    }
  });

  it('arcs crackle (re-shape) with a new seed and stay near the sphere', () => {
    const arc = shapeOrbArc(createOrbArc({ tier: 'hero', random: createSeededRandom(9) }));
    const before = Array.from(arc.points ?? []);
    arc.seed += 1;
    shapeOrbArc(arc);
    expect(Array.from(arc.points ?? [])).not.toEqual(before);
    for (let seed = 1; seed <= 50; seed += 1) {
      const shaped = shapeOrbArc(createOrbArc({ tier: 'hero', random: createSeededRandom(seed) }));
      const points = shaped.points ?? new Float32Array();
      for (let i = 0; i < points.length; i += 2) {
        expect(Math.hypot(points[i] ?? 0, points[i + 1] ?? 0)).toBeLessThan(1.9);
      }
    }
    for (let seed = 1; seed <= 30; seed += 1) {
      expect(createOrbArc({ tier: 'mark', random: createSeededRandom(seed) }).kind).toBe('crawl');
    }
  });
});

describe('states, tiers and the activity policy', () => {
  it("keeps the app's state vocabulary and normalises unknown input", () => {
    expect(FOUNDER_ORB_STATES).toContain('active');
    for (const state of FOUNDER_ORB_STATES) expect(normalizeFounderOrbState(state)).toBe(state);
    expect(normalizeFounderOrbState('processing')).toBe('executing');
    expect(normalizeFounderOrbState('spinning')).toBe('idle');
    expect(normalizeFounderOrbSignal(2)).toBe(1);
    expect(normalizeFounderOrbSignal('0.5')).toBeNull();
  });

  it('never lets a quiet state look busier than work', () => {
    const e = (state: FounderOrbState) => founderOrbEnergy(state);
    expect(e('idle').arcRate).toBeLessThan(e('active').arcRate);
    for (const work of ['thinking', 'generating', 'executing'] as const) {
      expect(e(work).arcRate).toBeGreaterThan(e('active').arcRate);
    }
    expect(e('active').sparkle).toBe(1);
    expect(e('disconnected').arcRate).toBe(0);
  });

  it('follows the drawn size: the ~30px mark is the light compact tier at 30fps', () => {
    expect(founderOrbTier(16)).toBe('mark');
    expect(founderOrbTier(30)).toBe('mark');
    expect(founderOrbTier(52)).toBe('status');
    expect(founderOrbTier(56)).toBe('status');
    expect(founderOrbTier(220)).toBe('hero');
    const mark = orbTierLayout('mark');
    expect(mark.sparkles).toBe(0);
    expect(mark.maxArcs).toBe(1);
    expect(mark.frameInterval).toBeGreaterThan(30);
    expect(orbTierLayout('status').sparkles).toBeGreaterThan(0);
  });

  it('runs no loop under reduced motion, off-screen, in a hidden tab or when told not to', () => {
    expect(shouldRunFounderOrbLoop()).toBe(true);
    expect(shouldRunFounderOrbLoop({ reducedMotion: true })).toBe(false);
    expect(shouldRunFounderOrbLoop({ enabled: false })).toBe(false);
    expect(shouldRunFounderOrbLoop({ intersecting: false })).toBe(false);
    expect(shouldRunFounderOrbLoop({ pageVisible: false })).toBe(false);
    expect(isFounderOrbActive({ intersecting: false })).toBe(false);
  });

  it("draws in the app's blue on both themes", () => {
    const dark = createOrbPalette({ tone: 'active', theme: 'dark' });
    const light = createOrbPalette({ tone: 'active', theme: 'light' });
    expect(dark.corona.h).toBe(212);
    expect(light.bodyMid.l).toBeGreaterThan(dark.bodyMid.l + 20);
    expect(orbColor({ h: 212, s: 100, l: 50 }, 3)).toBe('hsla(212, 100%, 50%, 1)');
  });
});

describe('runtime', () => {
  it('shares one 30fps frame across every orb, and stops when none animate', () => {
    vi.useFakeTimers();
    const scheduled: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      scheduled.push(callback);
      return scheduled.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    try {
      const seen: number[] = [];
      const stopA = subscribeOrbFrame((now) => seen.push(now));
      const stopB = subscribeOrbFrame((now) => seen.push(now));
      expect(scheduled).toHaveLength(1);
      expect(activeOrbFrameCount()).toBe(2);
      scheduled.shift()?.(1000);
      expect(seen).toEqual([1000, 1000]);
      // Between orb frames the loop sleeps on a timer, then wakes on a display frame.
      expect(scheduled).toHaveLength(0);
      vi.advanceTimersByTime(30);
      expect(scheduled).toHaveLength(1);
      scheduled.shift()?.(1016.7);
      expect(seen).toHaveLength(2);
      scheduled.shift()?.(1033.4);
      expect(seen).toEqual([1000, 1000, 1033.4, 1033.4]);
      stopA();
      stopB();
      expect(activeOrbFrameCount()).toBe(0);
      vi.advanceTimersByTime(100);
      expect(scheduled).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("reads the website's theme class and the OS reduced-motion setting", () => {
    expect({ ...getServerOrbEnvironment() }).toEqual({ theme: 'dark', reducedMotion: false });
    document.documentElement.classList.remove('dark');
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(getOrbEnvironment()).toEqual({ theme: 'light', reducedMotion: true });
    document.documentElement.classList.add('dark');
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const snapshot = getOrbEnvironment();
    expect(snapshot).toEqual({ theme: 'dark', reducedMotion: false });
    expect(getOrbEnvironment()).toBe(snapshot);
    document.documentElement.classList.remove('dark');
  });
});

/** A 2D context that records calls: enough to run the engine without a real canvas. */
function fakeCanvas(log: string[]) {
  const gradient = { addColorStop() {} };
  const context = new Proxy({} as Record<string | symbol, unknown>, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'createRadialGradient' || key === 'createLinearGradient') return () => gradient;
      return () => {
        log.push(String(key));
      };
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
  });
  return { width: 0, height: 0, getContext: () => context } as unknown as HTMLCanvasElement;
}

describe('engine', () => {
  const configure = (
    engine: ReturnType<typeof createOrbEngine>,
    tier: 'mark' | 'status' | 'hero',
    size: number,
    state: FounderOrbState = 'active',
  ) =>
    engine.configure({
      size,
      tier,
      palette: createOrbPalette({ tone: founderOrbEnergy(state).tone }),
      profile: founderOrbEnergy(state),
      state,
      signal: null,
      energy: 1,
      dpr: 2,
      texture: null,
    });

  it('draws a still frame on demand and caps the mark at 30fps', () => {
    vi.spyOn(document, 'createElement').mockImplementation(() => fakeCanvas([]));
    const log: string[] = [];
    const canvas = fakeCanvas(log);
    const engine = createOrbEngine(canvas, { seed: 3, now: () => 0 });
    expect(configure(engine, 'hero', 300)).toBe(true);
    expect(canvas.width > 300 && canvas.width <= 1100).toBe(true);
    expect(engine.still()).toBe(true);
    expect(log).toContain('drawImage');
    expect(log).toContain('stroke');
    configure(engine, 'mark', 30);
    expect(engine.frame(1000)).toBe(true);
    expect(engine.frame(1016)).toBe(false);
    expect(engine.frame(1034)).toBe(true);
  });

  it('draws every tier at the shared 30fps and never shrinks the canvas for it', () => {
    vi.spyOn(document, 'createElement').mockImplementation(() => fakeCanvas([]));
    for (const tier of ['mark', 'status', 'hero'] as const) {
      expect(orbTierLayout(tier).frameInterval).toBeCloseTo(1000 / 30);
    }
    const canvas = fakeCanvas([]);
    const engine = createOrbEngine(canvas, { seed: 3, now: () => 0 });
    configure(engine, 'hero', 300);
    const full = canvas.width;
    let time = 1000;
    for (let i = 0; i < 800; i += 1) {
      time += 33.3;
      engine.frame(time);
    }
    expect(canvas.width).toBe(full);
  });

  it('encodes a still frame once and reuses it', () => {
    const toDataURL = vi.fn(() => 'data:image/png;base64,AAAA');
    const canvas = { width: 40, height: 40, toDataURL };
    const cache = new Map<string, string>();
    expect(readOrbStillFrame(canvas, 'k', cache)).toBe('data:image/png;base64,AAAA');
    expect(readOrbStillFrame(canvas, 'k', cache)).toBe('data:image/png;base64,AAAA');
    expect(toDataURL).toHaveBeenCalledTimes(1);
    expect(readOrbStillFrame(null, 'k', cache)).toBe('');
  });
});
