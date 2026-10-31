// @polsia:user-owned — Renor's living orb colours: pure, derived from one hue.
//
// Ported unchanged from the Renor app (src/components/ui/orbPalette.js). The app lets the
// founder pick the orb colour; the website has no such setting and always uses the app's
// default, ORB_DEFAULT_HUE (the app's DEFAULT_ACCENT_HUE, electric blue).
//
// Each tone keeps the FounderLab plasma recipe: a deep body, veins a little cooler than the
// body, white-hot core and rim, and a corona in the pure hue. Daylight (the light theme) is a
// different recipe, not a dimmer one: the body is a bright mid-tone gem instead of near-black,
// and anything drawn outside the sphere (corona, arcs, sparkles) keeps a saturated colour
// because white light vanishes on a white page.

/** The Renor app's default orb colour (DEFAULT_ACCENT_HUE in its src/app/accentTheme.js). */
export const ORB_DEFAULT_HUE = 212;

export type OrbTone = 'accent' | 'active' | 'amber' | 'alert' | 'ember';
export type OrbTheme = 'dark' | 'light';

export interface OrbShade {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

export interface OrbPalette {
  readonly key: string;
  readonly light: boolean;
  readonly ember: boolean;
  readonly bodyHi: OrbShade;
  readonly bodyMid: OrbShade;
  readonly bodyLo: OrbShade;
  readonly vein: OrbShade;
  readonly cloudA: OrbShade;
  readonly cloudB: OrbShade;
  readonly veinHot: OrbShade;
  readonly core: OrbShade;
  readonly rim: OrbShade;
  readonly rimHot: OrbShade;
  readonly corona: OrbShade;
  readonly spark: OrbShade;
  readonly sparkHot: OrbShade;
  readonly arcGlow: OrbShade;
  readonly arcCore: OrbShade;
  readonly shadow: OrbShade;
}

const TONE_HUES: Partial<Record<OrbTone, number>> = { amber: 38, alert: 352 };

const clampHue = (value: number) => ((Math.round(Number(value) || 0) % 360) + 360) % 360;

function shade(h: number, s: number, l: number): OrbShade {
  return Object.freeze({ h: clampHue(h), s, l });
}

/** `hsla()` for a palette colour at an alpha. */
export function orbColor(colour: OrbShade, alpha = 1): string {
  const a = Math.min(1, Math.max(0, alpha));
  return `hsla(${colour.h}, ${colour.s}%, ${colour.l}%, ${Number(a.toFixed(3))})`;
}

export function createOrbPalette({
  hue = ORB_DEFAULT_HUE,
  tone = 'accent',
  theme = 'dark',
}: {
  hue?: number;
  tone?: OrbTone;
  theme?: OrbTheme;
} = {}): OrbPalette {
  const light = theme === 'light';
  const h = TONE_HUES[tone] ?? clampHue(hue);
  if (tone === 'ember') {
    return Object.freeze({
      key: `ember:${h}:${theme}`,
      light,
      ember: true,
      bodyHi: light ? shade(h, 16, 88) : shade(h, 18, 22),
      bodyMid: light ? shade(h, 13, 76) : shade(h, 22, 11),
      bodyLo: light ? shade(h, 14, 62) : shade(h + 6, 26, 5),
      vein: light ? shade(h, 18, 94) : shade(h, 20, 46),
      cloudA: light ? shade(h - 10, 18, 92) : shade(h - 10, 20, 40),
      cloudB: light ? shade(h + 10, 14, 90) : shade(h + 10, 16, 36),
      veinHot: light ? shade(h, 20, 98) : shade(h, 22, 62),
      core: light ? shade(h, 18, 98) : shade(h, 20, 64),
      rim: light ? shade(h, 22, 97) : shade(h, 24, 52),
      rimHot: light ? shade(h, 20, 99) : shade(h, 22, 70),
      corona: light ? shade(h, 24, 58) : shade(h, 30, 46),
      spark: light ? shade(h, 24, 58) : shade(h, 22, 70),
      sparkHot: light ? shade(h, 20, 70) : shade(h, 18, 86),
      arcGlow: light ? shade(h, 30, 55) : shade(h, 30, 55),
      arcCore: light ? shade(h, 20, 80) : shade(h, 20, 88),
      shadow: shade(h, 30, 30),
    });
  }
  // Active leans a little cyan at the rim and in the veins: the "on" light.
  const cool = tone === 'active' ? 18 : 12;
  // Reds and ambers read hotter with a touch of yellow in the highlights.
  const warm = tone === 'alert' || tone === 'amber' ? -1 : 1;
  const lift = (offset: number) => h - warm * offset;
  return Object.freeze({
    key: `${tone}:${h}:${theme}`,
    light,
    ember: false,
    bodyHi: light ? shade(h, 100, 66) : shade(h, 96, 32),
    bodyMid: light ? shade(h + 2, 96, 48) : shade(h + 3, 98, 16),
    bodyLo: light ? shade(h + 6, 100, 31) : shade(h + 8, 100, 6),
    vein: light ? shade(lift(cool * 0.6), 100, 80) : shade(lift(cool * 0.6), 100, 66),
    // The two neighbouring hues the plasma clouds drift through: cyan and indigo either side
    // of electric blue; orange and rose either side of red.
    cloudA: warm > 0 ? shade(h - 26, 100, light ? 72 : 58) : shade(h + 14, 100, light ? 70 : 58),
    cloudB: warm > 0 ? shade(h + 32, 92, light ? 70 : 56) : shade(h - 14, 100, light ? 70 : 56),
    veinHot: light ? shade(lift(cool), 100, 94) : shade(lift(cool), 100, 86),
    core: shade(lift(cool), 100, 95),
    rim: light ? shade(lift(cool), 100, 70) : shade(lift(cool), 100, 64),
    rimHot: shade(lift(cool + 4), 100, 92),
    corona: light ? shade(h, 100, 54) : shade(h, 100, 58),
    spark: light ? shade(h - 4, 100, 52) : shade(lift(cool), 100, 72),
    sparkHot: light ? shade(lift(cool), 100, 70) : shade(lift(cool + 6), 100, 95),
    arcGlow: light ? shade(h - 4, 100, 50) : shade(lift(cool * 0.5), 100, 62),
    arcCore: light ? shade(lift(cool), 100, 82) : shade(lift(cool + 6), 100, 96),
    shadow: shade(h + 4, 90, light ? 42 : 30),
  });
}
