// @polsia:user-owned — Renor's living orb, drawn on a 2D canvas.
//
// A line-for-line TypeScript port of the Renor app's engine (src/components/ui/orbEngine.js),
// so the website's orb looks and moves exactly like the app's. Do not restyle it here: change
// the app first, then port.
//
// Layers, back to front (all centred on a sphere that floats a little):
//
//   texture   THE FOUNDER'S ORB (texture.ts): the blue sun-globe picture, turning slowly, its
//             lightning veins breathing brighter and a faint second vein layer turning the
//             other way. When it is loaded it replaces body, rim and plasma below; they remain
//             only as the fallback if the picture cannot load.
//   body      the volumetric sphere, lit from the upper left, deep below
//   rim       a clean luminous edge with a fresnel sheen
//   plasma    two vein textures turning against each other inside the sphere
//   core      the heart, breathing
//   arcs      procedural lightning (lightning.ts) that crackles across and just beyond the
//             surface, re-jittering every few frames
//   sparkles  motes orbiting on tilted ellipses, twinkling, hidden while behind the sphere
//   comets    during real work, bright streaks swirling around it
//
// The corona around it is CSS (a compositor-only opacity/scale breath, see .fl-orb-corona).
//
// Every static layer is painted ONCE into a sprite (per size, palette and tier) and only
// composited per frame. Simulation parameters glide towards the state's energy profile instead
// of jumping, and every rotation and breath is integrated (phase += dt / period) so changing
// tempo never snaps.
//
// Browser-only at runtime; importing it is safe anywhere (nothing touches the DOM until
// createOrbEngine is called).

import { createSeededRandom, generateLightningPath, type OrbRandom } from './lightning';
import { type OrbPalette, type OrbShade, orbColor } from './palette';
import type { FounderOrbState, OrbEnergyProfile, OrbTier } from './state';
import { extractOrbVeins, ORB_TEXTURE_GEOMETRY, orbTextureRecipe, tintOrbPixels } from './texture';

const TAU = Math.PI * 2;

export interface OrbTierLayout {
  /** How far the canvas reaches past the orb's box, per side, as a share of the box. */
  readonly overscan: number;
  readonly radius: number;
  readonly veins: number;
  readonly blobs: number;
  readonly glints: number;
  readonly sparkles: number;
  readonly comets: number;
  readonly maxArcs: number;
  readonly arcRateScale: number;
  /** Minimum ms between frames (0 = every display frame; the website uses 30 fps throughout). */
  readonly frameInterval: number;
}

/**
 * The website's one frame budget: every orb draws at 30 fps, on the same shared frames
 * (runtime.ts). The app runs its larger tiers at the display rate; on the website two orbs sit
 * on every page and each canvas frame costs a compositor commit of the whole page, so the
 * status and hero tiers share the mark's 30 fps. The drawing itself is the app's, unchanged.
 */
export const ORB_FRAME_INTERVAL = 1000 / 30;

/** Per-tier layout and budgets. */
export const ORB_TIER_LAYOUT: Readonly<Record<OrbTier, OrbTierLayout>> = Object.freeze({
  mark: Object.freeze({
    overscan: 0.16,
    radius: 0.43,
    veins: 2,
    blobs: 9,
    glints: 0,
    sparkles: 0,
    comets: 0,
    maxArcs: 1,
    arcRateScale: 0.28,
    frameInterval: ORB_FRAME_INTERVAL,
  }),
  status: Object.freeze({
    overscan: 0.2,
    radius: 0.4,
    veins: 6,
    blobs: 16,
    glints: 5,
    sparkles: 9,
    comets: 1,
    maxArcs: 2,
    arcRateScale: 0.7,
    frameInterval: ORB_FRAME_INTERVAL,
  }),
  hero: Object.freeze({
    overscan: 0.21,
    radius: 0.39,
    veins: 9,
    blobs: 22,
    glints: 14,
    sparkles: 26,
    comets: 2,
    maxArcs: 4,
    arcRateScale: 1,
    frameInterval: ORB_FRAME_INTERVAL,
  }),
});

export function orbTierLayout(tier: string): OrbTierLayout {
  return ORB_TIER_LAYOUT[tier as OrbTier] ?? ORB_TIER_LAYOUT.status;
}

const MAX_BACKING_SIDE = 1100;
const STILL_TIME = 2.35;

type Canvas = HTMLCanvasElement;
type Ctx = CanvasRenderingContext2D;
type Points = ArrayLike<number>;

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
const at = (points: Points, index: number) => points[index] ?? 0;

/**
 * A scratch canvas for sprites. In the orb worker (orb.worker.ts) there is no document, so it is
 * an OffscreenCanvas: the same 2D API and the same pixels, typed as the DOM canvas the engine
 * is written against.
 */
function makeCanvas(width: number, height: number): Canvas {
  const w = Math.max(1, Math.ceil(width));
  const h = Math.max(1, Math.ceil(height));
  if (typeof document === 'undefined' && typeof OffscreenCanvas === 'function') {
    return new OffscreenCanvas(w, h) as unknown as Canvas;
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

function context2d(canvas: Canvas, options?: CanvasRenderingContext2DSettings): Ctx {
  const context = canvas.getContext('2d', options);
  if (!context) throw new Error('2D canvas unavailable');
  return context;
}

function radial(
  context: Ctx,
  x: number,
  y: number,
  r0: number,
  r1: number,
  stops: ReadonlyArray<readonly [number, string]>,
  fx = x,
  fy = y,
): CanvasGradient {
  const gradient = context.createRadialGradient(fx, fy, r0, x, y, r1);
  for (const [offset, colour] of stops) gradient.addColorStop(clamp01(offset), colour);
  return gradient;
}

// ── Sprites ──────────────────────────────────────────────────────────────

/** The sphere and its luminous edge in one sprite (the fallback when the picture fails). */
function paintBody(R: number, palette: OrbPalette, { small = false } = {}): Canvas {
  const d = Math.ceil(R * 2.3);
  const canvas = makeCanvas(d, d);
  const context = context2d(canvas);
  const c = d / 2;
  context.beginPath();
  context.arc(c, c, R, 0, TAU);
  context.fillStyle = radial(
    context,
    c,
    c,
    R * 0.04,
    R * 1.02,
    [
      [0, orbColor(palette.bodyHi)],
      [0.52, orbColor(palette.bodyMid)],
      [1, orbColor(palette.bodyLo)],
    ],
    c - R * 0.34,
    c - R * 0.4,
  );
  context.fill();
  // Light pooled low in the sphere: plasma glows from inside.
  context.globalCompositeOperation = 'lighter';
  context.fillStyle = radial(context, c + R * 0.18, c + R * 0.32, 0, R * 0.9, [
    [0, orbColor(palette.vein, palette.light ? 0.16 : 0.2)],
    [1, orbColor(palette.vein, 0)],
  ]);
  context.fill();
  // A 20–32px mark has no room for veins to carry the light, so its body glows a little more.
  if (small && !palette.ember) {
    context.fillStyle = radial(context, c, c, 0, R, [
      [0, orbColor(palette.veinHot, 0.34)],
      [0.6, orbColor(palette.vein, 0.16)],
      [1, orbColor(palette.vein, 0.05)],
    ]);
    context.fill();
  }
  context.drawImage(paintRim(R, palette), 0, 0);
  return canvas;
}

/** Map a lightning path's (u, v) frame onto a chord from A to B, bowed sideways by `bow`. */
function mapChord(
  points: Points,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  bow = 0,
): Float32Array {
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const out = new Float32Array(points.length);
  for (let index = 0; index < points.length; index += 2) {
    const u = at(points, index);
    const v = at(points, index + 1) + bow * Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
    out[index] = ax + dx * u + nx * v * length;
    out[index + 1] = ay + dy * u + ny * v * length;
  }
  return out;
}

function strokePolyline(context: Ctx, points: Points) {
  context.beginPath();
  context.moveTo(at(points, 0), at(points, 1));
  for (let index = 2; index < points.length; index += 2) {
    context.lineTo(at(points, index), at(points, index + 1));
  }
  context.stroke();
}

/** Soft, slowly turning clouds of light in three neighbouring hues. */
function paintClouds(R: number, palette: OrbPalette, layout: OrbTierLayout, seed: number): Canvas {
  const d = Math.ceil(R * 2 + 4);
  const canvas = makeCanvas(d, d);
  const context = context2d(canvas);
  const c = d / 2;
  const random = createSeededRandom(seed);
  context.globalCompositeOperation = 'lighter';
  const hues: OrbShade[] = [palette.vein, palette.cloudA, palette.cloudB];
  for (let index = 0; index < layout.blobs; index += 1) {
    const distance = Math.sqrt(random()) * R * 0.78;
    const angle = random() * TAU;
    const radius = R * (0.22 + random() * 0.42);
    const x = c + Math.cos(angle) * distance;
    const y = c + Math.sin(angle) * distance;
    const colour = hues[index % 3] ?? palette.vein;
    const alpha = (0.05 + random() * 0.11) * (palette.light ? 0.85 : 1) * (palette.ember ? 0.6 : 1);
    context.fillStyle = radial(context, x, y, 0, radius, [
      [0, orbColor(colour, alpha)],
      [0.55, orbColor(colour, alpha * 0.4)],
      [1, orbColor(colour, 0)],
    ]);
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  maskToSphere(context, c, R, d);
  return canvas;
}

/** Lightning veins frozen inside the plasma, with star-bright junctions. */
function paintVeins(R: number, palette: OrbPalette, count: number, seed: number): Canvas {
  const d = Math.ceil(R * 2 + 4);
  const canvas = makeCanvas(d, d);
  const context = context2d(canvas);
  const c = d / 2;
  const random = createSeededRandom(seed);
  context.globalCompositeOperation = 'lighter';
  context.lineJoin = 'round';
  context.lineCap = 'round';
  const width = Math.max(0.55, R * 0.0062);
  const nodes: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const start = random() * TAU;
    const span = 0.9 + random() * 1.7;
    const ra = R * (0.84 + random() * 0.12);
    const rb = R * (0.84 + random() * 0.12);
    const path = generateLightningPath({
      seed: Math.floor(random() * 2 ** 32),
      depth: R > 60 ? 6 : 4,
      roughness: 0.22,
      branchChance: 1.1,
      maxBranches: 3,
    });
    const bow = (random() - 0.5) * 0.3;
    const ax = c + Math.cos(start) * ra;
    const ay = c + Math.sin(start) * ra;
    const bx = c + Math.cos(start + span) * rb;
    const by = c + Math.sin(start + span) * rb;
    const strength = random() < 0.38 ? 0.9 + random() * 0.1 : 0.28 + random() * 0.3;
    for (const line of [path.trunk, ...path.branches]) {
      const trunk = line === path.trunk;
      const mapped = mapChord(line, ax, ay, bx, by, trunk ? bow : bow * 0.5);
      const thin = trunk ? 1 : 0.6;
      context.strokeStyle = orbColor(palette.vein, 0.075 * strength);
      context.lineWidth = width * 9 * thin;
      strokePolyline(context, mapped);
      context.strokeStyle = orbColor(palette.vein, 0.26 * strength);
      context.lineWidth = width * 2.6 * thin;
      strokePolyline(context, mapped);
      context.strokeStyle = orbColor(palette.veinHot, 0.6 * strength);
      context.lineWidth = width * 0.9 * thin;
      strokePolyline(context, mapped);
      if (trunk && strength > 0.8) {
        const pick = 2 + Math.floor(random() * (mapped.length / 2 - 4));
        nodes.push(at(mapped, pick * 2), at(mapped, pick * 2 + 1));
      }
    }
  }
  for (let index = 0; index < nodes.length; index += 2) {
    const radius = R * (0.03 + random() * 0.035);
    const x = at(nodes, index);
    const y = at(nodes, index + 1);
    context.fillStyle = radial(context, x, y, 0, radius, [
      [0, orbColor(palette.core, 0.9)],
      [0.3, orbColor(palette.veinHot, 0.4)],
      [1, orbColor(palette.vein, 0)],
    ]);
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  maskToSphere(context, c, R, d);
  return canvas;
}

/** Fade a texture out just inside the rim, so it can turn freely inside the sphere. */
function maskToSphere(context: Ctx, c: number, R: number, d: number) {
  context.globalCompositeOperation = 'destination-in';
  context.fillStyle = radial(context, c, c, 0, R * 0.995, [
    [0, 'rgba(0,0,0,1)'],
    [0.84, 'rgba(0,0,0,1)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  context.fillRect(0, 0, d, d);
}

function paintCore(R: number, palette: OrbPalette): Canvas {
  const radius = R * 0.96;
  const d = Math.ceil(radius * 2);
  const canvas = makeCanvas(d, d);
  const context = context2d(canvas);
  const c = d / 2;
  context.fillStyle = radial(context, c, c, 0, radius, [
    [0, orbColor(palette.core, 1)],
    [0.06, orbColor(palette.core, 0.9)],
    [0.18, orbColor(palette.veinHot, 0.5)],
    [0.38, orbColor(palette.vein, 0.2)],
    [0.62, orbColor(palette.cloudA, 0.07)],
    [1, orbColor(palette.corona, 0)],
  ]);
  context.fillRect(0, 0, d, d);
  return canvas;
}

function paintRim(R: number, palette: OrbPalette): Canvas {
  const d = Math.ceil(R * 2.3);
  const canvas = makeCanvas(d, d);
  const context = context2d(canvas);
  const c = d / 2;
  const inner = R * 0.7;
  const outer = R * 1.09;
  const at01 = (r: number) => (r - inner) / (outer - inner);
  const strength = palette.ember ? 0.7 : 1;
  context.globalCompositeOperation = 'lighter';
  const ring = (alpha: number): Array<[number, string]> => [
    [0, orbColor(palette.rim, 0)],
    [at01(R * 0.82), orbColor(palette.rim, 0.04 * alpha)],
    [at01(R * 0.92), orbColor(palette.rim, 0.13 * alpha)],
    [at01(R * 0.965), orbColor(palette.rim, 0.3 * alpha)],
    [at01(R * 0.99), orbColor(palette.rim, 0.58 * alpha)],
    [at01(R * 1.006), orbColor(palette.rim, 0.3 * alpha)],
    [at01(R * 1.035), orbColor(palette.rim, 0.07 * alpha)],
    [1, orbColor(palette.rim, 0)],
  ];
  context.fillStyle = radial(context, c, c, inner, outer, ring(strength));
  context.fillRect(0, 0, d, d);
  // Fresnel: the edge burns brightest where the light falls (upper left) and where it bounces
  // (lower right), and thins in between: a sphere's limb, not a drawn outline.
  const fresnel = makeCanvas(d, d);
  const fresnelContext = context2d(fresnel);
  fresnelContext.globalCompositeOperation = 'lighter';
  for (const [angle, reach, alpha] of [
    [-2.3, 1.15, 1],
    [0.85, 0.85, 0.6],
  ] as const) {
    const x = c + Math.cos(angle) * R;
    const y = c + Math.sin(angle) * R;
    fresnelContext.fillStyle = radial(fresnelContext, x, y, 0, R * reach, [
      [0, orbColor(palette.rimHot, alpha * strength)],
      [0.5, orbColor(palette.rim, 0.45 * alpha * strength)],
      [1, orbColor(palette.rim, 0)],
    ]);
    fresnelContext.fillRect(0, 0, d, d);
  }
  fresnelContext.globalCompositeOperation = 'destination-in';
  fresnelContext.fillStyle = radial(fresnelContext, c, c, inner, outer, [
    [0, 'rgba(0,0,0,0)'],
    [at01(R * 0.9), 'rgba(0,0,0,.12)'],
    [at01(R * 0.975), 'rgba(0,0,0,.7)'],
    [at01(R * 0.993), 'rgba(0,0,0,1)'],
    [at01(R * 1.012), 'rgba(0,0,0,.45)'],
    [at01(R * 1.05), 'rgba(0,0,0,0)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  fresnelContext.fillRect(0, 0, d, d);
  context.drawImage(fresnel, 0, 0);
  // A soft sheen where the light falls (upper left) and a bounce below.
  const sheen = makeCanvas(d, d);
  const sheenContext = context2d(sheen);
  sheenContext.globalCompositeOperation = 'lighter';
  sheenContext.fillStyle = radial(sheenContext, c - R * 0.42, c - R * 0.5, 0, R * 0.78, [
    [0, orbColor(palette.rimHot, 0.34 * strength)],
    [0.45, orbColor(palette.rim, 0.12 * strength)],
    [1, orbColor(palette.rim, 0)],
  ]);
  sheenContext.fillRect(0, 0, d, d);
  sheenContext.fillStyle = radial(sheenContext, c + R * 0.5, c + R * 0.58, 0, R * 0.7, [
    [0, orbColor(palette.vein, 0.2 * strength)],
    [1, orbColor(palette.vein, 0)],
  ]);
  sheenContext.fillRect(0, 0, d, d);
  sheenContext.globalCompositeOperation = 'destination-in';
  sheenContext.fillStyle = radial(sheenContext, c, c, 0, R, [
    [0, 'rgba(0,0,0,.35)'],
    [0.7, 'rgba(0,0,0,1)'],
    [0.97, 'rgba(0,0,0,1)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  sheenContext.fillRect(0, 0, d, d);
  context.drawImage(sheen, 0, 0);
  return canvas;
}

function paintSpark(R: number, palette: OrbPalette, scale: number): Canvas {
  const d = Math.max(10, Math.ceil(Math.max(R * 0.15, 14 * scale)));
  const canvas = makeCanvas(d, d);
  const context = context2d(canvas);
  const c = d / 2;
  const halo = palette.light ? 0.6 : 1;
  context.fillStyle = radial(context, c, c, 0, c, [
    [0, orbColor(palette.sparkHot, 1)],
    [0.12, orbColor(palette.sparkHot, 0.9)],
    [0.3, orbColor(palette.spark, 0.42 * halo)],
    [0.62, orbColor(palette.spark, 0.08 * halo)],
    [1, orbColor(palette.spark, 0)],
  ]);
  context.fillRect(0, 0, d, d);
  // A faint four-point glint, so a sparkle catches the eye like a star.
  const glint = Math.max(1, d * 0.045);
  for (const horizontal of [true, false]) {
    const gradient = horizontal
      ? context.createLinearGradient(0, 0, d, 0)
      : context.createLinearGradient(0, 0, 0, d);
    gradient.addColorStop(0, orbColor(palette.sparkHot, 0));
    gradient.addColorStop(
      0.5,
      orbColor(palette.light ? palette.spark : palette.sparkHot, palette.light ? 0.95 : 0.75),
    );
    gradient.addColorStop(1, orbColor(palette.sparkHot, 0));
    context.fillStyle = gradient;
    if (horizontal) context.fillRect(0, c - glint / 2, d, glint);
    else context.fillRect(c - glint / 2, 0, glint, d);
  }
  return canvas;
}

// ── The founder's orb ────────────────────────────────────────────────────

interface TintedTexture {
  image: CanvasImageSource;
  body: Canvas;
  veins: Canvas;
  scale: number;
}

/*
 * Recoloured pictures at their native size, per palette recipe, shared by every orb on the
 * page: the pixel pass runs once per colour, not per orb or per resize.
 */
const tintedTextures = new Map<string, TintedTexture>();

function imageSize(image: CanvasImageSource): { width: number; height: number } {
  const source = image as Partial<HTMLImageElement> & { width?: number; height?: number };
  return {
    width: Number(source.naturalWidth || source.width) || ORB_TEXTURE_GEOMETRY.width,
    height: Number(source.naturalHeight || source.height) || ORB_TEXTURE_GEOMETRY.height,
  };
}

function tintedTexture(image: CanvasImageSource, palette: OrbPalette): TintedTexture {
  const recipe = orbTextureRecipe(palette);
  const cached = tintedTextures.get(recipe.key);
  if (cached && cached.image === image) return cached;
  const { width, height } = imageSize(image);
  const body = makeCanvas(width, height);
  const bodyContext = context2d(body, { willReadFrequently: true });
  bodyContext.drawImage(image, 0, 0, width, height);
  const pixels = bodyContext.getImageData(0, 0, width, height);
  tintOrbPixels(pixels.data, recipe);
  bodyContext.putImageData(pixels, 0, 0);
  const veinPixels = new ImageData(new Uint8ClampedArray(pixels.data), width, height);
  extractOrbVeins(veinPixels.data);
  const veins = makeCanvas(width, height);
  const veinContext = context2d(veins);
  veinContext.putImageData(veinPixels, 0, 0);
  // Veins only inside the globe: this layer turns on its own, and flares swinging round the
  // rim would double the silhouette.
  const scale = width / ORB_TEXTURE_GEOMETRY.width;
  const cx = ORB_TEXTURE_GEOMETRY.cx * scale;
  const cy = ORB_TEXTURE_GEOMETRY.cy * scale;
  const r = ORB_TEXTURE_GEOMETRY.radius * scale;
  veinContext.globalCompositeOperation = 'destination-in';
  veinContext.fillStyle = radial(veinContext, cx, cy, 0, r, [
    [0, 'rgba(0,0,0,1)'],
    [0.9, 'rgba(0,0,0,1)'],
    [1, 'rgba(0,0,0,0)'],
  ]);
  veinContext.fillRect(0, 0, width, height);
  const entry = { image, body, veins, scale };
  if (tintedTextures.size >= 8) {
    const oldest = tintedTextures.keys().next().value;
    if (oldest !== undefined) tintedTextures.delete(oldest);
  }
  tintedTextures.set(recipe.key, entry);
  return entry;
}

/** Downscale in halving steps so a 30px mark keeps its veins instead of aliasing to noise. */
function scaledCopy(source: Canvas, width: number, height: number): Canvas {
  let current = source;
  let w = source.width;
  let h = source.height;
  while (w / 2 >= width * 1.01 && h / 2 >= height * 1.01) {
    w = Math.ceil(w / 2);
    h = Math.ceil(h / 2);
    const step = makeCanvas(w, h);
    const context = context2d(step);
    context.imageSmoothingQuality = 'high';
    context.drawImage(current, 0, 0, w, h);
    current = step;
  }
  const out = makeCanvas(width, height);
  const context = context2d(out);
  context.imageSmoothingQuality = 'high';
  context.drawImage(current, 0, 0, width, height);
  return out;
}

interface PaintedTexture {
  body: Canvas;
  veins: Canvas;
  ox: number;
  oy: number;
}

/** The picture at the size the sphere is drawn: its globe's radius is exactly R. */
function paintTexture(image: CanvasImageSource, R: number, palette: OrbPalette): PaintedTexture {
  const tinted = tintedTexture(image, palette);
  const s = R / (ORB_TEXTURE_GEOMETRY.radius * tinted.scale);
  const width = Math.max(4, Math.ceil(tinted.body.width * s));
  const height = Math.max(4, Math.ceil(tinted.body.height * s));
  return {
    body: scaledCopy(tinted.body, width, height),
    veins: scaledCopy(tinted.veins, width, height),
    ox: ORB_TEXTURE_GEOMETRY.cx * tinted.scale * s,
    oy: ORB_TEXTURE_GEOMETRY.cy * tinted.scale * s,
  };
}

interface Glint {
  radius: number;
  angle: number;
  twinkle: number;
  phase: number;
  size: number;
}

/** Glints on the surface (the nodes where veins meet catching the light) that turn with it. */
function createSurfaceGlints(count: number, random: OrbRandom): Glint[] {
  return Array.from({ length: count }, () => ({
    radius: 0.18 + 0.7 * Math.sqrt(random()),
    angle: random() * TAU,
    twinkle: 0.9 + random() * 2.2,
    phase: random() * TAU,
    size: 0.45 + random() * 0.5,
  }));
}

// ── Lightning ────────────────────────────────────────────────────────────

export type OrbArcKind = 'crawl' | 'inner' | 'leap';

const ARC_KINDS: Readonly<Record<OrbTier, ReadonlyArray<readonly [OrbArcKind, number]>>> = {
  mark: [['crawl', 1]],
  status: [
    ['crawl', 0.6],
    ['inner', 0.3],
    ['leap', 0.1],
  ],
  hero: [
    ['crawl', 0.48],
    ['inner', 0.32],
    ['leap', 0.2],
  ],
};

function pickKind(tier: OrbTier, random: OrbRandom): OrbArcKind {
  const roll = random();
  let total = 0;
  for (const [kind, weight] of ARC_KINDS[tier] ?? ARC_KINDS.status) {
    total += weight;
    if (roll <= total) return kind;
  }
  return 'crawl';
}

export interface OrbArc {
  kind: OrbArcKind;
  strike: boolean;
  start: number;
  span: number;
  lift: number;
  radius: number;
  bow: number;
  life: number;
  age: number;
  jitterEvery: number;
  jitterAt: number;
  flicker: number;
  seed: number;
  points: Float32Array | null;
  branches: Float32Array[];
}

/** A new arc: its kind, where it sits on the sphere, and how long it lives. */
export function createOrbArc({
  tier = 'hero',
  random,
  power = 1,
}: {
  tier?: OrbTier;
  random: OrbRandom;
  power?: number;
}): OrbArc {
  const kind = pickKind(tier, random);
  const mark = tier === 'mark';
  const start = random() * TAU;
  const strike = kind === 'leap' && random() < 0.55;
  return {
    kind,
    strike,
    start,
    span:
      kind === 'inner'
        ? 0.9 + random() * 1.4
        : kind === 'leap'
          ? (random() - 0.5) * 0.7
          : (mark ? 0.35 + random() * 0.3 : 0.4 + random() * 0.85) * (random() < 0.5 ? -1 : 1),
    lift:
      kind === 'leap'
        ? 0.2 + random() * 0.34 * power
        : 0.03 + random() * (mark ? 0.05 : 0.19) * power,
    radius: kind === 'inner' ? 0.86 + random() * 0.08 : 0.95 + random() * 0.04,
    bow: (random() - 0.5) * 0.2,
    life: (strike ? 0.42 + random() * 0.2 : 0.16 + random() * 0.24) * (mark ? 1.4 : 1),
    age: 0,
    jitterEvery: 0.038 + random() * 0.03,
    jitterAt: -1,
    flicker: 1,
    seed: Math.floor(random() * 2 ** 32),
    points: null,
    branches: [],
  };
}

/** Arc geometry (in sphere-radius units, centred on the sphere) for its current seed. */
export function shapeOrbArc(arc: OrbArc, { depth = 5 } = {}): OrbArc {
  const path = generateLightningPath({
    seed: arc.seed,
    depth,
    roughness: arc.kind === 'inner' ? 0.24 : arc.kind === 'crawl' ? 0.42 : 0.34,
    branchChance: arc.kind === 'crawl' ? 0.8 : 1.3,
    maxBranches: arc.kind === 'leap' ? 3 : 2,
  });
  const map = (line: number[]): Float32Array => {
    if (arc.kind === 'crawl') {
      const out = new Float32Array(line.length);
      for (let index = 0; index < line.length; index += 2) {
        const u = at(line, index);
        const angle = arc.start + arc.span * u;
        const radius =
          arc.radius +
          arc.lift * Math.sin(Math.PI * Math.min(1, Math.max(0, u))) +
          at(line, index + 1) * Math.abs(arc.span) * 0.9;
        out[index] = Math.cos(angle) * radius;
        out[index + 1] = Math.sin(angle) * radius;
      }
      return out;
    }
    if (arc.kind === 'leap') {
      const ax = Math.cos(arc.start) * 0.96;
      const ay = Math.sin(arc.start) * 0.96;
      const end = arc.start + arc.span;
      return mapChord(
        line,
        ax,
        ay,
        Math.cos(end) * (1.08 + arc.lift),
        Math.sin(end) * (1.08 + arc.lift),
        arc.bow * 0.5,
      );
    }
    const end = arc.start + arc.span;
    return mapChord(
      line,
      Math.cos(arc.start) * arc.radius,
      Math.sin(arc.start) * arc.radius,
      Math.cos(end) * arc.radius,
      Math.sin(end) * arc.radius,
      arc.bow,
    );
  };
  arc.points = map(path.trunk);
  arc.branches = path.branches.map(map);
  return arc;
}

function arcEnvelope(arc: OrbArc): number {
  const t = arc.age / arc.life;
  if (t < 0.07) return t / 0.07;
  return Math.max(0, 1 - (t - 0.07) / 0.93) ** 1.5;
}

function strokeScaled(context: Ctx, points: Points, R: number) {
  context.beginPath();
  context.moveTo(at(points, 0) * R, at(points, 1) * R);
  for (let index = 2; index < points.length; index += 2) {
    context.lineTo(at(points, index) * R, at(points, index + 1) * R);
  }
  context.stroke();
}

// ── Sparkles ─────────────────────────────────────────────────────────────

interface Sparkle {
  orbit: number;
  theta: number;
  speed: number;
  tilt: number;
  flatten: number;
  size: number;
  twinkle: number;
  phase: number;
  wobble: number;
  rank: number;
}

function createSparkles(count: number, random: OrbRandom): Sparkle[] {
  const sparkles: Sparkle[] = [];
  for (let index = 0; index < count; index += 1) {
    sparkles.push({
      orbit: 1.1 + random() ** 1.4 * 0.55,
      theta: random() * TAU,
      speed: (0.1 + random() * 0.32) * (random() < 0.25 ? -1 : 1),
      tilt: (random() - 0.5) * 1.6,
      flatten: 0.28 + random() * 0.7,
      size: 0.55 + random() * 0.75,
      twinkle: 0.7 + random() * 2.1,
      phase: random() * TAU,
      wobble: random() * TAU,
      rank: random(),
    });
  }
  return sparkles;
}

// ── Engine ───────────────────────────────────────────────────────────────

export interface OrbEngineConfig {
  /** CSS px of the orb box. */
  size: number;
  tier: OrbTier;
  palette: OrbPalette | null;
  profile: OrbEnergyProfile | null;
  state: FounderOrbState;
  /** Live voice level 0–1, or null. */
  signal: number | null;
  energy: number;
  dpr: number;
  /** The founder's orb picture, or null for the painted fallback sphere. */
  texture: CanvasImageSource | null;
}

export interface OrbEngineStats {
  lastCost: number;
  averageCost: number;
  frames: number;
  side: number;
  quality: number;
}

export interface OrbEngine {
  configure(next: Partial<OrbEngineConfig>): boolean;
  frame(time?: number): boolean;
  still(): boolean;
  readonly stats: OrbEngineStats;
  destroy(): void;
}

interface Geometry {
  layout: OrbTierLayout;
  scale: number;
  side: number;
  C: number;
  R: number;
}

interface Sprites {
  texture: PaintedTexture | null;
  body: Canvas;
  nebula: [Canvas, Canvas];
  core: Canvas;
  spark: Canvas;
}

type SimTargets = Pick<
  OrbEnergyProfile,
  'glow' | 'swirl' | 'arcRate' | 'arcPower' | 'sparkle' | 'flicker' | 'float'
> & { comets: number };

export function createOrbEngine(
  canvas: HTMLCanvasElement,
  { seed = 7, now = () => performance.now() }: { seed?: number; now?: () => number } = {},
): OrbEngine {
  const context = canvas.getContext('2d', { alpha: true });
  const random = createSeededRandom(seed);
  const config: OrbEngineConfig = {
    size: 0,
    tier: 'status',
    palette: null,
    profile: null,
    state: 'idle',
    signal: null,
    energy: 1,
    dpr: 1,
    texture: null,
  };
  const sim = {
    glow: 0,
    swirl: 0,
    arcRate: 0,
    arcPower: 0,
    sparkle: 0,
    flicker: 0,
    float: 0,
    comets: 0,
    breath: 0,
    spinA: 0.6,
    spinB: 2.1,
    orbit: 0,
    cometClock: 0,
    flash: 0,
    flick: 1,
    flickTarget: 1,
    flickAt: 0,
    flare: 0,
    primed: false,
  };
  let sprites: Sprites | null = null;
  let geometry: Geometry | null = null;
  let arcs: OrbArc[] = [];
  let sparkles: Sparkle[] = [];
  let glints: Glint[] = [];
  let lastTime = 0;
  let lastDraw = Number.NEGATIVE_INFINITY;
  let quality = 1;
  let costEma = 0;
  let intervalEma = 0;
  let frames = 0;
  // The last step-down, to check it helped. A display capped at 30 fps (iOS Low Power Mode)
  // looks "slow" forever; a smaller canvas cannot fix that, so if frames did not get faster the
  // quality comes back and the governor stands down.
  let stepDown: { quality: number; interval: number; cost: number } | null = null;
  let governed = true;
  const stats: OrbEngineStats = { lastCost: 0, averageCost: 0, frames: 0, side: 0, quality: 1 };

  function arcDepth() {
    return config.tier === 'mark' ? 3 : config.tier === 'status' ? 4 : 5;
  }

  function rebuild() {
    if (!context || !config.palette || !config.size) return;
    const layout = orbTierLayout(config.tier);
    const cssSide = config.size * (1 + layout.overscan * 2);
    const scale = Math.min(config.dpr, 2, MAX_BACKING_SIDE / cssSide) * quality;
    const side = Math.max(8, Math.round(cssSide * scale));
    if (canvas.width !== side || canvas.height !== side) {
      canvas.width = side;
      canvas.height = side;
    }
    const R = config.size * layout.radius * scale;
    geometry = { layout, scale, side, C: side / 2, R };
    const spriteSeed = 0x5eed + Math.round(config.palette.light ? 1 : 0);
    let texture: PaintedTexture | null = null;
    if (config.texture) {
      // A picture that cannot be read back (a tainted canvas) leaves the painted sphere.
      try {
        texture = paintTexture(config.texture, R, config.palette);
      } catch {
        texture = null;
      }
    }
    sprites = {
      texture,
      body: paintBody(R, config.palette, { small: config.tier === 'mark' }),
      nebula: [
        paintClouds(R, config.palette, layout, spriteSeed),
        paintVeins(R, config.palette, layout.veins, spriteSeed + 99),
      ],
      core: paintCore(R, config.palette),
      spark: paintSpark(R, config.palette, scale),
    };
    sparkles = createSparkles(layout.sparkles, createSeededRandom(seed + 31));
    glints = createSurfaceGlints(layout.glints || 0, createSeededRandom(seed + 57));
    stats.side = side;
    // Re-map live arcs at the new depth.
    for (const arc of arcs) shapeOrbArc(arc, { depth: arcDepth() });
  }

  function target(profile: OrbEnergyProfile): SimTargets {
    return {
      glow: profile.glow,
      swirl: profile.swirl,
      arcRate: profile.arcRate,
      arcPower: profile.arcPower,
      sparkle: profile.sparkle,
      flicker: profile.flicker,
      float: profile.float,
      comets: profile.swirl >= 0.9 ? 1 : 0,
    };
  }

  function prime(profile: OrbEnergyProfile) {
    Object.assign(sim, target(profile));
    sim.primed = true;
  }

  function step(t: number, dt: number, profile: OrbEnergyProfile, layout: OrbTierLayout) {
    const goal = target(profile);
    const k = 1 - Math.exp(-dt / 0.45);
    for (const key of Object.keys(goal) as Array<keyof SimTargets>) {
      sim[key] += (goal[key] - sim[key]) * k;
    }
    const signal = config.signal ?? 0;
    sim.breath += dt / profile.breath;
    sim.spinA += dt * (0.045 + 0.2 * sim.swirl);
    sim.spinB -= dt * (0.03 + 0.15 * sim.swirl);
    sim.orbit += dt * (0.25 + 0.75 * Math.min(1.6, sim.swirl));
    sim.cometClock += dt * (1.1 + 0.9 * sim.swirl);
    sim.flash *= Math.exp(-dt / 0.16);
    sim.flare *= Math.exp(-dt / 0.6);
    // An unsteady light: hold a level for a beat, then jump.
    if (sim.flicker > 0.02) {
      if (t >= sim.flickAt) {
        const dip = random() < 0.22;
        sim.flickTarget = 1 - sim.flicker * (dip ? 0.5 + random() * 0.35 : random() * 0.18);
        sim.flickAt = t + 0.05 + random() * (dip ? 0.12 : 0.5);
      }
      sim.flick += (sim.flickTarget - sim.flick) * Math.min(1, dt * 26);
    } else {
      sim.flick += (1 - sim.flick) * Math.min(1, dt * 6);
    }
    // Lightning: a Poisson process at the state's rate.
    const rate = sim.arcRate * layout.arcRateScale * (1 + signal * 3);
    if (rate > 0.001 && arcs.length < layout.maxArcs && random() < 1 - Math.exp(-rate * dt)) {
      const arc = shapeOrbArc(createOrbArc({ tier: config.tier, random, power: sim.arcPower }), {
        depth: arcDepth(),
      });
      arc.jitterAt = t;
      arcs.push(arc);
      if (arc.strike) sim.flash = Math.min(1, sim.flash + 0.32 * sim.arcPower);
    }
    for (const arc of arcs) {
      arc.age += dt;
      if (t - arc.jitterAt >= arc.jitterEvery) {
        arc.seed = Math.floor(random() * 2 ** 32);
        arc.flicker = 0.7 + random() * 0.3;
        arc.jitterAt = t;
        shapeOrbArc(arc, { depth: arcDepth() });
      }
    }
    arcs = arcs.filter((arc) => arc.age < arc.life);
  }

  function draw(t: number, ctx: Ctx, geo: Geometry, spr: Sprites, palette: OrbPalette) {
    const { side, C, R, layout, scale } = geo;
    const signal = config.signal ?? 0;
    const energy = config.energy;
    const breath = 0.5 - 0.5 * Math.cos(sim.breath * TAU);
    const glow = sim.glow * sim.flick;
    const flash = Math.min(1, sim.flash + sim.flare);
    const drift = sim.float;
    const cx = C + R * drift * (0.034 * Math.sin(t * 0.53) + 0.012 * Math.sin(t * 1.37 + 0.4));
    const cy = C + R * drift * (0.05 * Math.sin(t * 0.71 + 1.3) + 0.01 * Math.sin(t * 1.9));

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, side, side);

    const texture = spr.texture;
    if (texture) {
      // The founder's orb: the sun-globe turns slowly (faster while work runs).
      const turn = sim.spinA * 0.3;
      ctx.setTransform(1, 0, 0, 1, cx, cy);
      ctx.rotate(turn);
      ctx.drawImage(texture.body, -texture.ox, -texture.oy);
      // Its lightning breathes: the veins alone, added back brighter on each breath, on a
      // flash, and with the voice.
      ctx.globalCompositeOperation = 'lighter';
      const pulse = palette.ember
        ? 0.12
        : (0.2 + 0.55 * breath) * (0.55 + 0.45 * Math.min(1, glow));
      ctx.globalAlpha = clamp01(pulse + flash * 0.6 + signal * 0.5);
      ctx.drawImage(texture.veins, -texture.ox, -texture.oy);
      // ...and a faint second layer turning the other way, so the energy inside churns.
      ctx.rotate(sim.spinB * 0.45 - turn);
      ctx.globalAlpha = clamp01(
        palette.ember ? 0.04 : (0.12 + 0.07 * Math.sin(t * 0.37)) * Math.min(1, glow + 0.35),
      );
      ctx.drawImage(texture.veins, -texture.ox, -texture.oy);
      ctx.setTransform(1, 0, 0, 1, cx, cy);
      // Nodes catching the light, turning with the globe.
      if (glints.length && !palette.ember) {
        const spark = spr.spark;
        for (const glint of glints) {
          const twinkle = 0.5 + 0.5 * Math.sin(t * glint.twinkle + glint.phase);
          const alpha = twinkle ** 4 * Math.min(1, 0.4 + glow);
          if (alpha < 0.03) continue;
          const angle = glint.angle + turn;
          const size = spark.width * glint.size * (0.6 + 0.5 * twinkle);
          ctx.globalAlpha = clamp01(alpha);
          ctx.drawImage(
            spark,
            Math.cos(angle) * glint.radius * R - size / 2,
            Math.sin(angle) * glint.radius * R - size / 2,
            size,
            size,
          );
        }
      }
    } else {
      // The body is blitted on whole device pixels (no resampling).
      const body = spr.body;
      ctx.drawImage(body, Math.round(cx - body.width / 2), Math.round(cy - body.height / 2));

      // The plasma and the core float with it, turning and breathing.
      ctx.setTransform(1, 0, 0, 1, cx, cy);

      ctx.globalCompositeOperation = 'lighter';
      const plasma = palette.ember ? (palette.light ? 0.14 : 0.32) : 0.5 + 0.5 * Math.min(1, glow);
      spr.nebula.forEach((layer, index) => {
        const angle = index === 0 ? sim.spinA : sim.spinB;
        const mix =
          index === 0 ? 0.72 + 0.28 * Math.sin(t * 0.41) : 0.62 + 0.38 * Math.cos(t * 0.33 + 1);
        ctx.globalAlpha = clamp01(plasma * mix * (1 + flash * 0.4));
        ctx.rotate(angle);
        ctx.drawImage(layer, -layer.width / 2, -layer.height / 2);
        ctx.rotate(-angle);
      });
    }

    ctx.globalCompositeOperation = 'lighter';
    const core = spr.core;
    const coreScale =
      (0.74 + 0.2 * breath * energy + signal * 0.36 + flash * 0.28) *
      (config.tier === 'mark' ? 1.3 : 1);
    // Over the picture the heart is a soft glow, not a white-hot core: the founder's globe is
    // dark at the centre with light in its veins.
    const heart = texture ? 0.32 : 1;
    ctx.globalAlpha = clamp01(
      (glow * (0.42 + 0.42 * breath) + flash * 0.55 + signal * 0.3) *
        (palette.ember ? 0.45 : 1) *
        heart,
    );
    ctx.drawImage(
      core,
      (-core.width / 2) * coreScale,
      (-core.height / 2) * coreScale,
      core.width * coreScale,
      core.height * coreScale,
    );

    // Lightning
    ctx.setTransform(1, 0, 0, 1, cx, cy);
    if (arcs.length) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      const base = Math.max(scale * (config.tier === 'mark' ? 0.55 : 0.9), R * 0.0105);
      for (const arc of arcs) {
        if (!arc.points) continue;
        const intensity =
          arcEnvelope(arc) *
          arc.flicker *
          (0.55 + 0.45 * sim.arcPower) *
          (arc.kind === 'inner' ? 0.6 : 1) *
          (arc.strike ? 1.25 : 1);
        if (intensity <= 0.01) continue;
        const width = base * (arc.strike ? 1.4 : 1) * (arc.kind === 'inner' ? 0.75 : 1);
        const lines: Array<[Float32Array, number]> = [
          [arc.points, 1],
          ...arc.branches.map((branch): [Float32Array, number] => [branch, 0.6]),
        ];
        for (const [points, weight] of lines) {
          if (config.tier !== 'mark') {
            ctx.strokeStyle = orbColor(palette.arcGlow);
            ctx.globalAlpha = clamp01(intensity * weight * (palette.light ? 0.08 : 0.05));
            ctx.lineWidth = width * 11 * weight;
            strokeScaled(ctx, points, R);
            ctx.globalAlpha = clamp01(intensity * weight * (palette.light ? 0.14 : 0.1));
            ctx.lineWidth = width * 5.5 * weight;
            strokeScaled(ctx, points, R);
          }
          ctx.globalAlpha = clamp01(intensity * weight * (palette.light ? 0.55 : 0.4));
          ctx.strokeStyle = orbColor(palette.arcGlow);
          ctx.lineWidth = width * 2.8 * weight;
          strokeScaled(ctx, points, R);
          ctx.globalAlpha = clamp01(intensity * weight);
          ctx.strokeStyle = orbColor(palette.arcCore);
          ctx.lineWidth = width * weight;
          strokeScaled(ctx, points, R);
        }
      }
    }

    // Sparkles, orbiting on tilted ellipses; dim while behind the sphere.
    const spark = spr.spark;
    if (sparkles.length) {
      const lit = sim.sparkle;
      for (const mote of sparkles) {
        if (mote.rank > lit) continue;
        const theta = mote.theta + mote.speed * sim.orbit;
        const orbit = mote.orbit * (1 + 0.03 * Math.sin(t * 0.7 + mote.wobble));
        const ex = Math.cos(theta) * orbit;
        const ey = Math.sin(theta) * orbit * mote.flatten;
        const x = ex * Math.cos(mote.tilt) - ey * Math.sin(mote.tilt);
        const y = ex * Math.sin(mote.tilt) + ey * Math.cos(mote.tilt);
        const behind = Math.sin(theta) < 0 && x * x + y * y < 1;
        const twinkle = 0.5 + 0.5 * Math.sin(t * mote.twinkle + mote.phase);
        const fade = Math.min(1, (lit - mote.rank) * 6);
        const alpha =
          (0.18 + 0.82 * twinkle * twinkle * twinkle) *
          fade *
          (behind ? 0.1 : 1) *
          Math.min(1, 0.35 + glow);
        if (alpha < 0.02) continue;
        const size = spark.width * mote.size * (0.7 + 0.45 * twinkle);
        ctx.globalAlpha = clamp01(alpha);
        ctx.drawImage(spark, x * R - size / 2, y * R - size / 2, size, size);
      }
    }

    // Comets: streams of light racing round the rim, only while real work swirls.
    if (layout.comets && sim.comets > 0.02) {
      const base = Math.max(scale * 0.8, R * 0.011);
      ctx.lineCap = 'round';
      for (let index = 0; index < layout.comets; index += 1) {
        const direction = index === 0 ? 1 : -1;
        const head = sim.cometClock * (index === 0 ? 1 : 0.83) * direction + index * Math.PI;
        const orbit = 1.055 + index * 0.045;
        const trail = 22;
        let px = 0;
        let py = 0;
        for (let sample = 0; sample <= trail; sample += 1) {
          const theta = head - sample * 0.045 * direction;
          const radius = R * (orbit + 0.022 * Math.sin(theta * 3 + t * 2.1 + index));
          const x = Math.cos(theta) * radius;
          const y = Math.sin(theta) * radius;
          if (sample > 0) {
            const falloff = 1 - sample / trail;
            ctx.globalAlpha = clamp01(
              sim.comets * falloff * falloff * (palette.light ? 0.5 : 0.38),
            );
            ctx.strokeStyle = orbColor(palette.arcGlow);
            ctx.lineWidth = base * 4 * falloff;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.globalAlpha = clamp01(sim.comets * falloff * 0.95);
            ctx.strokeStyle = orbColor(palette.arcCore);
            ctx.lineWidth = base * 1.2 * falloff;
            ctx.stroke();
          } else {
            const size = spark.width * 1.05;
            ctx.globalAlpha = clamp01(sim.comets);
            ctx.drawImage(spark, x - size / 2, y - size / 2, size, size);
          }
          px = x;
          py = y;
        }
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawNow(t: number): boolean {
    if (!context || !geometry || !sprites || !config.palette) return false;
    draw(t, context, geometry, sprites, config.palette);
    return true;
  }

  return {
    configure(next) {
      const resize =
        next.size !== config.size ||
        next.tier !== config.tier ||
        next.dpr !== config.dpr ||
        next.palette?.key !== config.palette?.key ||
        (next.texture ?? null) !== config.texture;
      if (next.state !== config.state && next.state === 'success') sim.flare = 0.9;
      Object.assign(config, next);
      if (!sim.primed && config.profile) prime(config.profile);
      if (resize) rebuild();
      return Boolean(geometry);
    },
    frame(time = now()) {
      if (!geometry || !config.profile) return false;
      if (time - lastDraw < geometry.layout.frameInterval - 1) return false;
      const started = now();
      const t = time / 1000;
      const dt = lastTime ? Math.min(0.1, Math.max(0, t - lastTime)) : 1 / 60;
      lastTime = t;
      lastDraw = time;
      step(t, dt, config.profile, geometry.layout);
      drawNow(t);
      const cost = now() - started;
      frames += 1;
      costEma = frames === 1 ? cost : costEma * 0.94 + cost * 0.06;
      // Gaps from a paused loop (off-screen, hidden tab) are not slowness.
      if (dt < 0.09) intervalEma = intervalEma ? intervalEma * 0.95 + dt * 0.05 : dt;
      stats.lastCost = cost;
      stats.averageCost = costEma;
      stats.frames = frames;
      stats.quality = quality;
      // A device that cannot keep up gets a lighter canvas instead of a stuttering orb: when
      // frames arrive slower than ~40 fps the backing store shrinks, at most three times.
      if (stepDown && frames > 120) {
        const helped = intervalEma < stepDown.interval * 0.9 || costEma < stepDown.cost * 0.75;
        if (!helped) {
          quality = stepDown.quality;
          governed = false;
          rebuild();
        }
        stepDown = null;
      } else if (
        governed &&
        !stepDown &&
        !geometry.layout.frameInterval &&
        frames > 120 &&
        (intervalEma > 0.027 || costEma > 8) &&
        quality > 0.55
      ) {
        stepDown = { quality, interval: intervalEma, cost: costEma };
        quality *= 0.8;
        frames = 0;
        intervalEma = 0;
        rebuild();
      }
      return true;
    },
    still() {
      if (!geometry || !config.profile) return false;
      prime(config.profile);
      sim.breath = 0.3;
      sim.spinA = 0.6;
      sim.spinB = 2.1;
      sim.orbit = STILL_TIME;
      sim.cometClock = STILL_TIME * 1.6;
      sim.flash = 0;
      sim.flick = 1;
      const stillRandom = createSeededRandom(seed + 404);
      arcs = [];
      if (config.profile.arcRate > 0 && config.tier !== 'mark') {
        const count = config.tier === 'hero' ? 2 : 1;
        for (let index = 0; index < count; index += 1) {
          const arc = shapeOrbArc(
            createOrbArc({
              tier: config.tier,
              random: stillRandom,
              power: config.profile.arcPower,
            }),
            { depth: arcDepth() },
          );
          arc.age = arc.life * 0.3;
          arcs.push(arc);
        }
      }
      drawNow(STILL_TIME);
      arcs = [];
      lastTime = 0;
      return true;
    },
    stats,
    destroy() {
      sprites = null;
      geometry = null;
      arcs = [];
    },
  };
}
