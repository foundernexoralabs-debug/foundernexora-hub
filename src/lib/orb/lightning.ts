// @polsia:user-owned — lightning for Renor's living orb: pure geometry, no canvas, no DOM.
//
// Ported unchanged from the Renor app (src/components/ui/orbLightning.js), so the website's orb
// crackles exactly like the app's.
//
// Bolts are made by fractal midpoint displacement: start with a straight segment, then
// repeatedly split every segment at its midpoint and push the midpoint sideways by a random
// amount proportional to the segment's length. Each pass halves the segment length and so the
// jitter, which gives real lightning its "rough at every scale" look. A few interior points
// sprout shorter branches, generated the same way.
//
// Everything is driven by a seeded random source, so a seed always yields the same bolt: the
// reduced-motion still frame is identical on every load, and the generator is testable.
//
// Paths are produced in a normalised frame (`u` runs 0 → 1 along the bolt, `v` is the sideways
// offset in units of the bolt's length) and the engine maps them onto the sphere.

/** A source of floats in [0, 1). */
export type OrbRandom = () => number;

/** mulberry32: a tiny, fast, well-distributed 32-bit PRNG. Returns floats in [0, 1). */
export function createSeededRandom(seed = 1): OrbRandom {
  let state = Number(seed) >>> 0 || 0x9e3779b9;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable 32-bit seed from any string (FNV-1a). */
export function seedFromString(value = ''): number {
  let hash = 0x811c9dc5;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Read a flat point array without `undefined` (the arrays are always fully populated). */
const at = (points: ArrayLike<number>, index: number) => points[index] ?? 0;

/**
 * One midpoint-displacement polyline in the normalised (u, v) frame.
 * Returns a flat array [u0, v0, u1, v1, …] with 2^depth + 1 points whose first and last points
 * are exactly (0, 0) and (1, 0).
 */
export function displaceSegment({
  depth = 5,
  roughness = 0.3,
  random,
}: {
  depth?: number;
  roughness?: number;
  random: OrbRandom;
}): number[] {
  const levels = clamp(Math.round(depth), 1, 8);
  let points = [0, 0, 1, 0];
  let spread = roughness;
  for (let level = 0; level < levels; level += 1) {
    const next = [at(points, 0), at(points, 1)];
    for (let index = 0; index < points.length - 2; index += 2) {
      const u0 = at(points, index);
      const v0 = at(points, index + 1);
      const u1 = at(points, index + 2);
      const v1 = at(points, index + 3);
      const length = Math.hypot(u1 - u0, v1 - v0);
      // Sideways relative to the local segment, so deep levels stay rough along the bolt
      // instead of only up and down.
      const nx = -(v1 - v0) / (length || 1);
      const ny = (u1 - u0) / (length || 1);
      const offset = (random() - 0.5) * 2 * spread * length;
      next.push((u0 + u1) / 2 + nx * offset * 0.35, (v0 + v1) / 2 + ny * offset, u1, v1);
    }
    points = next;
    spread *= 0.92;
  }
  return points;
}

export interface LightningPath {
  trunk: number[];
  branches: number[][];
  seed: number;
}

/**
 * A full bolt: a trunk plus up to `maxBranches` forks.
 *
 * Each branch starts on an interior trunk point and leaves at 18–55° from the trunk's
 * direction, for 22–48% of the trunk's length. Branch coordinates share the trunk's (u, v)
 * frame, so the engine maps both the same way.
 */
export function generateLightningPath({
  seed = 1,
  depth = 5,
  roughness = 0.3,
  branchChance = 0.35,
  maxBranches = 3,
}: {
  seed?: number;
  depth?: number;
  roughness?: number;
  branchChance?: number;
  maxBranches?: number;
} = {}): LightningPath {
  const random = createSeededRandom(seed);
  const trunk = displaceSegment({ depth, roughness, random });
  const branches: number[][] = [];
  const count = trunk.length / 2;
  // Interior points only, away from the anchors: a fork at the very start or end reads as a
  // second bolt, not a branch.
  for (let point = 2; point < count - 2 && branches.length < maxBranches; point += 1) {
    if (random() > branchChance / Math.max(4, count / 4)) continue;
    const u = at(trunk, point * 2);
    const v = at(trunk, point * 2 + 1);
    const nextU = at(trunk, point * 2 + 2);
    const nextV = at(trunk, point * 2 + 3);
    const heading = Math.atan2(nextV - v, nextU - u);
    const side = random() < 0.5 ? -1 : 1;
    const angle = heading + side * (0.32 + random() * 0.64);
    const length = 0.22 + random() * 0.26;
    const shape = displaceSegment({
      depth: Math.max(2, depth - 2),
      roughness: roughness * 1.15,
      random,
    });
    const cos = Math.cos(angle) * length;
    const sin = Math.sin(angle) * length;
    const branch = new Array<number>(shape.length);
    for (let index = 0; index < shape.length; index += 2) {
      const su = at(shape, index);
      const sv = at(shape, index + 1);
      branch[index] = u + su * cos - sv * sin;
      branch[index + 1] = v + su * sin + sv * cos;
    }
    branches.push(branch);
  }
  return { trunk, branches, seed: Number(seed) >>> 0 };
}
