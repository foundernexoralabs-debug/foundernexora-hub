// @polsia:user-owned — Renor's living orb, as plain data: geometry, palette and motion.
//
// The site draws Renor's orb as vectors (src/components/custom/living-orb.tsx) so it is sharp at
// every pixel density, in the same identity as the Renor app's orb: a deep sphere lit from the
// upper left, lightning veins of plasma turning inside it, a clean luminous rim, a white-hot
// heart, a glint orbiting the rim and sparkles that come and go.
//
// Everything here is pure and deterministic (seeded), so the server render, the hydrated page,
// the favicon (src/app/icon.svg) and the apple-touch icon all show exactly the same orb, and the
// unit tests can prove it.

/** How much detail the orb carries. `mark`: 16–36px (header, footer, avatars). `launcher`: 48–64px. */
export type OrbDetail = 'mark' | 'launcher';
export type OrbTheme = 'dark' | 'light';

/** The orb is drawn in a 100 × 100 box; the sphere sits in the middle. */
export const ORB_VIEWBOX = 100;
const C = ORB_VIEWBOX / 2;

interface DetailRecipe {
  /** Sphere radius in viewBox units. */
  radius: number;
  /** Nodes spread over the whole sphere (about half face the viewer) per plasma layer. */
  nodes: [front: number, back: number];
  /** Each node joins its nearest neighbours: this many. */
  links: number;
  /** Stroke widths in viewBox units: the bright core and its soft glow (the back web is finer). */
  core: number;
  glow: number;
  /** Radius of the bright nodes where lightning meets. */
  node: number;
  seed: number;
}

/**
 * A 30px mark has no room for a fine web: fewer, bolder strokes so it reads as lit plasma, not
 * noise. The launcher has room for the full web.
 */
export const ORB_DETAIL: Readonly<Record<OrbDetail, DetailRecipe>> = {
  mark: { radius: 41, nodes: [22, 12], links: 2, core: 1.3, glow: 3.8, node: 5.2, seed: 3 },
  launcher: { radius: 40, nodes: [56, 64], links: 3, core: 0.75, glow: 3.2, node: 4.4, seed: 5 },
};

/** Motion periods in milliseconds. Slow on purpose: alive, never busy. */
export const ORB_MOTION = {
  /** The front plasma turns once in this time; the back layer turns the other way, slower. */
  plasma: 48_000,
  plasmaBack: 72_000,
  /** The glint sweeping the rim (launcher). */
  orbit: 7_200,
  /** The mote on its tilted orbit (launcher). */
  mote: 9_600,
  /** The corona's breath (a large orb outside the launcher; the launcher breathes at 3.2s). */
  corona: 6_000,
  /** The launcher's sparkles; each is lit for under a sixth of its cycle, so they feel occasional. */
  sparkles: [5_600, 7_400],
  /**
   * The mark moves on a 12fps grid: at 16–36px a step is a fraction of a pixel, and it lets the
   * header and the launcher animate together without the compositor redrawing the whole page
   * every frame. Every period and delay is a whole number of steps, so all steps land together.
   */
  mark: { fps: 12, orbit: 7_500, sparkle: 10_000, sparkleDelay: 2_500 },
} as const;

/** One seeded PRNG (mulberry32): the same seed always draws the same orb. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 10) / 10;

type Vec3 = [number, number, number];

const normalise = ([x, y, z]: Vec3): Vec3 => {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
};

/** Nodes spread evenly over the sphere (a jittered Fibonacci lattice). */
function sphereNodes(count: number, random: () => number): Vec3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes: Vec3[] = [];
  for (let index = 0; index < count; index += 1) {
    const y = 1 - ((index + 0.5) / count) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = golden * index + random() * 0.5;
    nodes.push(
      normalise([
        Math.cos(theta) * ring + (random() - 0.5) * 0.22,
        y + (random() - 0.5) * 0.22,
        Math.sin(theta) * ring + (random() - 0.5) * 0.22,
      ]),
    );
  }
  return nodes;
}

/**
 * One bolt of lightning between two nodes, along the sphere's surface: the great-circle arc
 * from a to b, kinked sideways at every step (more in the middle than at the ends) the way a
 * discharge forks its way across. Returns the points in 3D.
 */
function bolt(a: Vec3, b: Vec3, random: () => number, steps: number): Vec3[] {
  const points: Vec3[] = [a];
  // A sideways direction: perpendicular to the arc and to the surface.
  const mid = normalise([a[0] + b[0], a[1] + b[1], a[2] + b[2]]);
  const along: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const side = normalise([
    along[1] * mid[2] - along[2] * mid[1],
    along[2] * mid[0] - along[0] * mid[2],
    along[0] * mid[1] - along[1] * mid[0],
  ]);
  const span = Math.hypot(...along);
  for (let step = 1; step < steps; step += 1) {
    const t = step / steps;
    // A broad kink, strongest mid-way, plus a fine crackle at every step.
    const kink = (random() - 0.5) * span * 0.3 * Math.sin(Math.PI * t);
    const crackle = (): number => (random() - 0.5) * span * 0.07;
    points.push(
      normalise([
        a[0] + along[0] * t + side[0] * kink + crackle(),
        a[1] + along[1] * t + side[1] * kink + crackle(),
        a[2] + along[2] * t + side[2] * kink + crackle(),
      ]),
    );
  }
  points.push(b);
  return points;
}

export interface OrbNode {
  x: number;
  y: number;
  /** 0–1: nodes facing the viewer are brighter and drawn larger. */
  weight: number;
}

export interface OrbVeins {
  /** SVG path data: the lightning web facing the viewer. */
  paths: string[];
  /** Where the lightning meets: the bright stars of the plasma. */
  nodes: OrbNode[];
}

/** How much finer the back web's strokes are than the front's: it is texture, not structure. */
export const BACK_WEB_SCALE = 0.55;

/**
 * The lightning web for one plasma layer: nodes over the sphere, each joined to its nearest
 * neighbours by a bolt, and only what faces the viewer drawn. Seen straight on, the web bunches
 * up towards the rim the way lines on a globe do, which is what makes a flat drawing read as a
 * sphere.
 */
const VEIN_CACHE = new Map<string, OrbVeins>();

export function orbVeins(detail: OrbDetail, layer: 'front' | 'back' = 'front'): OrbVeins {
  // Pure and deterministic, so each web is built once per page, not on every render.
  const key = `${detail}:${layer}`;
  const cached = VEIN_CACHE.get(key);
  if (cached) return cached;
  const veins = buildVeins(detail, layer);
  VEIN_CACHE.set(key, veins);
  return veins;
}

function buildVeins(detail: OrbDetail, layer: 'front' | 'back'): OrbVeins {
  const recipe = ORB_DETAIL[detail];
  const count = recipe.nodes[layer === 'front' ? 0 : 1];
  const random = seededRandom(recipe.seed * (layer === 'front' ? 1 : 37) + count);
  const points = sphereNodes(count, random);
  const R = recipe.radius;
  const toSvg = ([x, y]: Vec3) => `${round(C + x * R)} ${round(C + y * R)}`;

  const seen = new Set<string>();
  const paths: string[] = [];
  points.forEach((a, i) => {
    const nearest = points
      .map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) }))
      .filter(({ j }) => j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, recipe.links);
    for (const { j } of nearest) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const b = points[j];
      if (!b) continue;
      const arc = bolt(a, b, random, detail === 'mark' ? 6 : 9);
      // Draw only the runs that face the viewer; the far side is hidden by the sphere.
      let d = '';
      let drawing = false;
      for (const point of arc) {
        if (point[2] < 0.04) {
          drawing = false;
          continue;
        }
        d += `${drawing ? 'L' : 'M'}${toSvg(point)}`;
        drawing = true;
      }
      if (d.includes('L')) paths.push(d.replace(/M[^ML]+(?=M|$)/g, ''));
    }
  });

  const nodes = points
    .filter((point) => point[2] > 0.2)
    .map((point) => ({
      x: round(C + point[0] * R),
      y: round(C + point[1] * R),
      weight: round(0.45 + 0.55 * point[2]),
    }));
  return { paths, nodes };
}

/** Where the sparkles appear, in viewBox units, on the rim. The mark shows only the first. */
export interface OrbSparkle {
  x: number;
  y: number;
  size: number;
}
export const ORB_SPARKLES: readonly [OrbSparkle, OrbSparkle] = [
  { x: 82, y: 20, size: 15 },
  { x: 15, y: 76, size: 11 },
];

/** A four-point star in a 24 × 24 box, drawn with soft concave sides. */
export const SPARKLE_PATH =
  'M12 0C12.7 7.6 16.4 11.3 24 12C16.4 12.7 12.7 16.4 12 24C11.3 16.4 7.6 12.7 0 12C7.6 11.3 11.3 7.6 12 0Z';

// ── Palette ──────────────────────────────────────────────────────────────────────────────────

type Hsl = readonly [h: number, s: number, l: number];

/**
 * The app's plasma recipe on the site's hue. Dark: a deep sphere with cyan-white veins. Light
 * (daylight): a bright gem rather than a dark bead, and everything outside the sphere stays
 * saturated because white light disappears on a white page.
 */
export const ORB_PALETTE_HSL: Readonly<Record<OrbTheme, Readonly<Record<OrbColour, Hsl>>>> = {
  dark: {
    bodyHi: [213, 100, 34],
    bodyMid: [220, 100, 15],
    bodyLo: [228, 100, 5],
    vein: [199, 100, 56],
    veinHot: [192, 100, 84],
    rim: [199, 100, 58],
    rimHot: [192, 100, 88],
    violet: [252, 100, 70],
    corona: [216, 100, 58],
    spark: [200, 100, 80],
  },
  light: {
    bodyHi: [210, 100, 70],
    bodyMid: [216, 96, 50],
    bodyLo: [222, 100, 30],
    vein: [204, 100, 82],
    veinHot: [196, 100, 97],
    rim: [204, 100, 74],
    rimHot: [196, 100, 95],
    violet: [252, 100, 66],
    corona: [218, 100, 56],
    spark: [218, 100, 52],
  },
};

export type OrbColour =
  | 'bodyHi'
  | 'bodyMid'
  | 'bodyLo'
  | 'vein'
  | 'veinHot'
  | 'rim'
  | 'rimHot'
  | 'violet'
  | 'corona'
  | 'spark';

/** `#rrggbb` for an HSL triple. */
export function hslToHex([h, s, l]: Hsl): string {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const channel = (n: number) =>
    Math.round(255 * (lig - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

export function orbPalette(theme: OrbTheme): Record<OrbColour, string> {
  const source = ORB_PALETTE_HSL[theme];
  return Object.fromEntries(
    Object.entries(source).map(([name, hsl]) => [name, hslToHex(hsl)]),
  ) as Record<OrbColour, string>;
}

/** The CSS custom property that carries each colour in living-orb.css. */
export const orbVar = (name: OrbColour) =>
  `--lorb-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;

// ── The still orb, as an SVG document (favicon, apple-touch icon) ───────────────────────────

export interface StillSvgOptions {
  /** Pixel size written on the root element. */
  size?: number;
  /** Fill the square behind the orb (the apple-touch icon must be opaque). */
  background?: string;
  /** Scale of the orb inside its square (1 = the usual box). */
  scale?: number;
  /** `mark` for icons (bold strokes that survive 16px); `launcher` for large renders. */
  detail?: OrbDetail;
  /** The soft light around the sphere. A 16px favicon has no pixels to spare for it. */
  halo?: boolean;
}

/** src/app/icon.svg: no halo and a slightly larger sphere, so it reads at 16px. */
export const FAVICON_SVG_OPTIONS: StillSvgOptions = { size: 32, scale: 1.1, halo: false };

/**
 * Renor's orb in its still pose, as one standalone SVG: the favicon and the apple-touch icon.
 * Same geometry and dark palette as the live orb, with the glint resting at the upper left and
 * one sparkle lit. No CSS variables, filters or scripts, so every browser and icon renderer
 * draws it the same way.
 */
export function renorOrbStillSvg({
  size = 32,
  background,
  scale = 1,
  detail = 'mark',
  halo = true,
}: StillSvgOptions = {}) {
  const p = orbPalette('dark');
  const recipe = ORB_DETAIL[detail];
  const R = recipe.radius;
  const front = orbVeins(detail, 'front');
  const sparkle = ORB_SPARKLES[0];
  const s = sparkle.size;
  const veins = `<path d="${front.paths.join('')}"/>`;
  const nodes = front.nodes
    .map((n) => `<circle cx="${n.x}" cy="${n.y}" r="${round(recipe.node * n.weight)}"/>`)
    .join('');
  const offset = round((C * (1 - scale)) / scale);
  const transform =
    scale === 1 ? '' : ` transform="scale(${scale}) translate(${offset} ${offset})"`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="FounderLab">`,
    '<defs>',
    `<radialGradient id="b" cx="50" cy="50" r="${R}" fx="36" fy="32" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${p.bodyHi}"/><stop offset=".56" stop-color="${p.bodyMid}"/><stop offset="1" stop-color="${p.bodyLo}"/></radialGradient>`,
    `<radialGradient id="h" cx="50" cy="50" r="${R}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${p.vein}" stop-opacity=".38"/><stop offset=".4" stop-color="${p.vein}" stop-opacity=".12"/><stop offset="1" stop-color="${p.vein}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="r" cx="50" cy="50" r="${R}" gradientUnits="userSpaceOnUse"><stop offset=".8" stop-color="${p.rim}" stop-opacity="0"/><stop offset=".93" stop-color="${p.rim}" stop-opacity=".42"/><stop offset=".975" stop-color="${p.rimHot}" stop-opacity="1"/><stop offset="1" stop-color="${p.rim}" stop-opacity=".8"/></radialGradient>`,
    `<radialGradient id="n"><stop offset="0" stop-color="white"/><stop offset=".18" stop-color="white"/><stop offset=".4" stop-color="${p.veinHot}" stop-opacity=".85"/><stop offset="1" stop-color="${p.vein}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="s" cx="37" cy="31" r="${round(R * 0.42)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${p.veinHot}" stop-opacity=".18"/><stop offset="1" stop-color="${p.veinHot}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="o" cx="50" cy="50" r="${R + 8}" gradientUnits="userSpaceOnUse"><stop offset="${round(R / (R + 8) - 0.02)}" stop-color="${p.rim}" stop-opacity=".55"/><stop offset="1" stop-color="${p.rim}" stop-opacity="0"/></radialGradient>`,
    `<clipPath id="c"><circle cx="50" cy="50" r="${R - 0.6}"/></clipPath>`,
    '</defs>',
    background ? `<rect width="100" height="100" fill="${background}"/>` : '',
    `<g${transform}>`,
    halo ? `<circle cx="50" cy="50" r="${R + 8}" fill="url(#o)"/>` : '',
    `<circle cx="50" cy="50" r="${R}" fill="url(#b)"/>`,
    `<circle cx="50" cy="50" r="${R}" fill="url(#h)"/>`,
    `<g clip-path="url(#c)" fill="none" stroke-linecap="round" stroke-linejoin="round">`,
    `<g stroke="${p.vein}" stroke-opacity=".75" stroke-width="${recipe.glow}">${veins}</g>`,
    `<g stroke="${p.veinHot}" stroke-width="${recipe.core}">${veins}</g>`,
    `<g fill="url(#n)" stroke="none">${nodes}</g>`,
    '</g>',
    `<circle cx="50" cy="50" r="${R}" fill="url(#r)"/>`,
    `<circle cx="50" cy="50" r="${R}" fill="url(#s)"/>`,
    `<path d="${SPARKLE_PATH}" fill="white" transform="translate(${round(sparkle.x - s / 2)} ${round(sparkle.y - s / 2)}) scale(${round(s / 24)})"/>`,
    '</g>',
    '</svg>',
  ].join('');
}
