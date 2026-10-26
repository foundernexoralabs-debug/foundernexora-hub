// @polsia:user-owned — Renor's orb, as a texture.
//
// The approved orb is a picture, not a recipe: the globe of the sun, filtered blue, threaded
// with lightning veins that meet in glowing nodes, with flares licking off the rim
// (public/assets/renor/founderlab-energy-orb.png, the founder's own file, copied from the Renor
// app). The canvas engine draws THIS picture as the sphere and keeps everything that makes it
// alive on top: the slow turn, breathing veins, lightning and sparkles.
//
// Ported unchanged from the Renor app (src/components/ui/orbTexture.js). Pure apart from
// loading: the colour maths and the pixel pass take plain arrays, so they are unit-tested.

import type { OrbPalette } from './palette';

/** The approved picture, served from /public. */
export const ORB_TEXTURE_URL = '/assets/renor/founderlab-energy-orb.png';

/**
 * Where the sphere sits in the image (measured from its opaque pixels: the centroid of the
 * solid body and the median edge over 72 directions). The flares reach about 1.25 radii out,
 * inside every tier's canvas overscan.
 */
export const ORB_TEXTURE_GEOMETRY = Object.freeze({
  width: 440,
  height: 440,
  cx: 223.7,
  cy: 216.1,
  radius: 164.5,
});

/** The picture's own hue (its mean colour, rgb(14, 101, 188)). Other hues rotate from here. */
export const ORB_TEXTURE_HUE = 211;

export type Matrix3 = number[];

export interface OrbTextureRecipe {
  readonly key: string;
  readonly rotate: number;
  readonly saturate: number;
  readonly brightness: number;
}

// ── Colour ──────────────────────────────────────────────────────────────

const clamp255 = (value: number) => (value < 0 ? 0 : value > 255 ? 255 : value);
const IDENTITY: Matrix3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const m = (matrix: Matrix3, index: number) => matrix[index] ?? 0;

/** The CSS Filter Effects hue-rotate matrix (row-major 3×3), so the canvas matches CSS. */
export function hueRotateMatrix(degrees: number): Matrix3 {
  const a = (degrees * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [
    0.213 + c * 0.787 - s * 0.213,
    0.715 - c * 0.715 - s * 0.715,
    0.072 - c * 0.072 + s * 0.928,
    0.213 - c * 0.213 + s * 0.143,
    0.715 + c * 0.285 + s * 0.14,
    0.072 - c * 0.072 - s * 0.283,
    0.213 - c * 0.213 - s * 0.787,
    0.715 - c * 0.715 + s * 0.715,
    0.072 + c * 0.928 + s * 0.072,
  ];
}

/** The CSS saturate() matrix. */
export function saturateMatrix(amount: number): Matrix3 {
  const s = amount;
  return [
    0.213 + 0.787 * s,
    0.715 - 0.715 * s,
    0.072 - 0.072 * s,
    0.213 - 0.213 * s,
    0.715 + 0.285 * s,
    0.072 - 0.072 * s,
    0.213 - 0.213 * s,
    0.715 - 0.715 * s,
    0.072 + 0.928 * s,
  ];
}

function multiply(a: Matrix3, b: Matrix3): Matrix3 {
  const out = new Array<number>(9);
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      out[row * 3 + col] =
        m(a, row * 3) * m(b, col) +
        m(a, row * 3 + 1) * m(b, 3 + col) +
        m(a, row * 3 + 2) * m(b, 6 + col);
    }
  }
  return out;
}

/**
 * How the picture is recoloured for a palette: rotated to the palette's hue (the orb colour,
 * amber, or alert red) and, for the "off" ember tone, drained to a dim grey-blue.
 */
export function orbTextureRecipe(palette: Pick<OrbPalette, 'corona' | 'ember'>): OrbTextureRecipe {
  const hue = Number.isFinite(palette?.corona?.h) ? palette.corona.h : ORB_TEXTURE_HUE;
  let rotate = ((((hue - ORB_TEXTURE_HUE) % 360) + 540) % 360) - 180;
  if (Math.abs(rotate) < 0.5) rotate = 0;
  if (palette?.ember) {
    return Object.freeze({ key: `ember:${rotate}`, rotate, saturate: 0.16, brightness: 0.62 });
  }
  return Object.freeze({ key: `tone:${rotate}`, rotate, saturate: 1, brightness: 1 });
}

/** The one matrix a recipe applies: saturation after rotation, then brightness. */
export function orbTextureMatrix(recipe: Omit<OrbTextureRecipe, 'key'>): Matrix3 {
  const rotated = recipe.rotate ? hueRotateMatrix(recipe.rotate) : IDENTITY;
  const saturated =
    recipe.saturate === 1 ? rotated : multiply(saturateMatrix(recipe.saturate), rotated);
  return saturated.map((value) => value * recipe.brightness);
}

type Pixels = Uint8ClampedArray | number[];
const px = (data: Pixels, index: number) => data[index] ?? 0;

/** Recolour RGBA pixels in place. Alpha is untouched: the silhouette never changes. */
export function tintOrbPixels<T extends Pixels>(data: T, recipe: Omit<OrbTextureRecipe, 'key'>): T {
  const matrix = orbTextureMatrix(recipe);
  if (matrix.every((value, index) => Math.abs(value - m(IDENTITY, index)) < 1e-9)) return data;
  for (let i = 0; i < data.length; i += 4) {
    if (px(data, i + 3) === 0) continue;
    const r = px(data, i);
    const g = px(data, i + 1);
    const b = px(data, i + 2);
    data[i] = clamp255(m(matrix, 0) * r + m(matrix, 1) * g + m(matrix, 2) * b);
    data[i + 1] = clamp255(m(matrix, 3) * r + m(matrix, 4) * g + m(matrix, 5) * b);
    data[i + 2] = clamp255(m(matrix, 6) * r + m(matrix, 7) * g + m(matrix, 8) * b);
  }
  return data;
}

/**
 * The bright lightning only (veins and nodes) as an additive layer: pixels fade in between
 * `low` and `high` luminance, everything darker drops out. Pulsing this layer is what makes the
 * veins breathe.
 */
export function extractOrbVeins<T extends Pixels>(
  data: T,
  { low = 0.42, high = 0.82 }: { low?: number; high?: number } = {},
): T {
  for (let i = 0; i < data.length; i += 4) {
    const luminance =
      (0.2126 * px(data, i) + 0.7152 * px(data, i + 1) + 0.0722 * px(data, i + 2)) / 255;
    const t = (luminance - low) / (high - low);
    const keep = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
    data[i + 3] = Math.round(px(data, i + 3) * keep);
  }
  return data;
}

// ── Loading ─────────────────────────────────────────────────────────────

export type OrbTextureStatus = 'idle' | 'loading' | 'ready' | 'failed';
export interface OrbTextureSnapshot {
  readonly status: OrbTextureStatus;
  readonly image: HTMLImageElement | null;
}

let texture: OrbTextureSnapshot = Object.freeze({ status: 'idle', image: null });
const listeners = new Set<() => void>();

function publish(next: OrbTextureSnapshot) {
  texture = Object.freeze(next);
  for (const listener of listeners) listener();
}

/** A stable snapshot for useSyncExternalStore. */
export function getOrbTexture(): OrbTextureSnapshot {
  return texture;
}

export function subscribeOrbTexture(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Load the picture once for every orb on the page. A failed load is final for the session and
 * the engine falls back to its painted sphere, so the orb is never missing.
 */
export function loadOrbTexture(url: string = ORB_TEXTURE_URL): void {
  if (texture.status !== 'idle' || typeof Image !== 'function' || !url) return;
  publish({ status: 'loading', image: null });
  const image = new Image();
  image.decoding = 'async';
  const ready = () => publish({ status: 'ready', image });
  const failed = () => publish({ status: 'failed', image: null });
  image.onload = () => {
    if (typeof image.decode === 'function') image.decode().then(ready, ready);
    else ready();
  };
  image.onerror = failed;
  image.src = url;
}

/** Test seam. */
export function resetOrbTextureForTests(): void {
  texture = Object.freeze({ status: 'idle', image: null });
  listeners.clear();
}
