// @polsia:user-owned — Renor's living orb: states, energy profiles, detail tiers and the
// activity policy. Pure data and functions, ported unchanged from the Renor app
// (src/components/ui/founderOrbState.js).

import type { OrbTone } from './palette';

export const FOUNDER_ORB_STATES = Object.freeze([
  'idle',
  'active',
  'degraded',
  'disconnected',
  'listening',
  'thinking',
  'planning',
  'executing',
  'waiting-approval',
  'generating',
  'success',
  'error',
] as const);

export type FounderOrbState = (typeof FOUNDER_ORB_STATES)[number];
export type OrbTier = 'mark' | 'status' | 'hero';

const STATE_SET = new Set<string>(FOUNDER_ORB_STATES);
const LEGACY_STATE_ALIASES: Record<string, FounderOrbState> = { processing: 'executing' };

export function normalizeFounderOrbState(value: unknown): FounderOrbState {
  const raw = typeof value === 'string' ? (LEGACY_STATE_ALIASES[value] ?? value) : '';
  return STATE_SET.has(raw) ? (raw as FounderOrbState) : 'idle';
}

/** A bounded 0–1 signal, or null when there is no real numeric signal. */
export function normalizeFounderOrbSignal(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : null;
}

/**
 * All three conditions must be true: the caller allows motion, the orb is near the viewport,
 * and the page is visible.
 */
export function isFounderOrbActive({
  enabled = true,
  intersecting = true,
  pageVisible = true,
}: {
  enabled?: boolean;
  intersecting?: boolean;
  pageVisible?: boolean;
} = {}): boolean {
  return enabled !== false && intersecting === true && pageVisible === true;
}

/**
 * How much life each state shows, read by the canvas engine every frame.
 *
 *   tone      colour family: the orb colour, amber, alert red, or a cold ember (off)
 *   glow      overall brightness of core, corona and rim (0–1.1)
 *   breath    seconds per breath of the core glow
 *   swirl     how fast the plasma inside turns (and whether comets orbit)
 *   arcRate   lightning arcs per second at hero size (0 = never)
 *   arcPower  brightness/length of those arcs
 *   sparkle   share of the orbiting sparkles that are lit
 *   flicker   0–1, an unsteady light (degraded)
 *   float     how far the sphere drifts and bobs (0 = perfectly still)
 */
export interface OrbEnergyProfile {
  readonly tone: OrbTone;
  readonly glow: number;
  readonly breath: number;
  readonly swirl: number;
  readonly arcRate: number;
  readonly arcPower: number;
  readonly sparkle: number;
  readonly flicker: number;
  readonly float: number;
}

const ENERGY_PROFILES: Readonly<Record<FounderOrbState, OrbEnergyProfile>> = Object.freeze({
  idle: {
    tone: 'accent',
    glow: 0.78,
    breath: 7.4,
    swirl: 0.32,
    arcRate: 0.1,
    arcPower: 0.55,
    sparkle: 0.55,
    flicker: 0,
    float: 0.8,
  },
  active: {
    tone: 'active',
    glow: 1,
    breath: 5.2,
    swirl: 0.55,
    arcRate: 0.62,
    arcPower: 0.85,
    sparkle: 1,
    flicker: 0,
    float: 1,
  },
  listening: {
    tone: 'active',
    glow: 0.92,
    breath: 4.6,
    swirl: 0.5,
    arcRate: 0.35,
    arcPower: 0.7,
    sparkle: 0.9,
    flicker: 0,
    float: 0.9,
  },
  thinking: {
    tone: 'active',
    glow: 1.04,
    breath: 2.6,
    swirl: 1.6,
    arcRate: 2.4,
    arcPower: 0.92,
    sparkle: 1,
    flicker: 0,
    float: 1,
  },
  planning: {
    tone: 'active',
    glow: 1,
    breath: 3.2,
    swirl: 1.15,
    arcRate: 1.5,
    arcPower: 0.85,
    sparkle: 1,
    flicker: 0,
    float: 1,
  },
  generating: {
    tone: 'active',
    glow: 1.06,
    breath: 2.4,
    swirl: 1.45,
    arcRate: 2.1,
    arcPower: 0.95,
    sparkle: 1,
    flicker: 0,
    float: 1,
  },
  executing: {
    tone: 'active',
    glow: 1.1,
    breath: 2,
    swirl: 2,
    arcRate: 3.2,
    arcPower: 1,
    sparkle: 1,
    flicker: 0,
    float: 1,
  },
  'waiting-approval': {
    tone: 'accent',
    glow: 0.74,
    breath: 8.4,
    swirl: 0.22,
    arcRate: 0.06,
    arcPower: 0.5,
    sparkle: 0.45,
    flicker: 0,
    float: 0.7,
  },
  success: {
    tone: 'accent',
    glow: 0.9,
    breath: 6,
    swirl: 0.4,
    arcRate: 0.25,
    arcPower: 0.7,
    sparkle: 0.8,
    flicker: 0,
    float: 0.9,
  },
  degraded: {
    tone: 'amber',
    glow: 0.72,
    breath: 8,
    swirl: 0.3,
    arcRate: 0.45,
    arcPower: 0.6,
    sparkle: 0.4,
    flicker: 0.6,
    float: 0.6,
  },
  disconnected: {
    tone: 'ember',
    glow: 0.3,
    breath: 12,
    swirl: 0.04,
    arcRate: 0,
    arcPower: 0,
    sparkle: 0.12,
    flicker: 0,
    float: 0.15,
  },
  error: {
    tone: 'alert',
    glow: 0.86,
    breath: 2.4,
    swirl: 0.5,
    arcRate: 0.7,
    arcPower: 0.8,
    sparkle: 0.5,
    flicker: 0,
    float: 0.5,
  },
});

for (const profile of Object.values(ENERGY_PROFILES)) Object.freeze(profile);

/** The energy profile for a state. A raised alert turns any orb red, keeping its tempo. */
export function founderOrbEnergy(
  state: unknown,
  { alert = '' }: { alert?: string } = {},
): OrbEnergyProfile {
  const profile = ENERGY_PROFILES[normalizeFounderOrbState(state)];
  if (alert === 'error' && profile.tone !== 'alert') {
    return Object.freeze({ ...profile, tone: 'alert', glow: Math.max(profile.glow, 0.8) });
  }
  return profile;
}

/**
 * Detail follows the size the orb is actually drawn at, not a prop: a ~30px mark keeps a clean,
 * readable sphere with a breath and the odd tiny spark; from ~44px it gains arcs and orbiting
 * sparkles; from 140px everything is on.
 */
export function founderOrbTier(sizePx: number): OrbTier {
  const size = Number(sizePx) || 0;
  if (size <= 40) return 'mark';
  if (size < 140) return 'status';
  return 'hero';
}

/** Whether an orb runs its animation loop at all. Reduced motion means a still frame. */
export function shouldRunFounderOrbLoop({
  enabled = true,
  intersecting = true,
  pageVisible = true,
  reducedMotion = false,
}: {
  enabled?: boolean;
  intersecting?: boolean;
  pageVisible?: boolean;
  reducedMotion?: boolean;
} = {}): boolean {
  return reducedMotion !== true && isFounderOrbActive({ enabled, intersecting, pageVisible });
}
