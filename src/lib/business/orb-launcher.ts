// @polsia:user-owned — the Ask Renor orb launcher's state, as plain data.
//
// Two small machines drive the launcher in src/components/custom/orb-launcher.tsx:
//   1. what the orb shows (`orbVisual`): idle, hover, typing, answering or error;
//   2. the panel's lifecycle (`panelReducer`): closed → opening → open → closing → closed.
// They are pure so the unit tests can prove every transition without a browser.

/** The five visual states of the launcher orb, in the brief's words. */
export type OrbVisual = 'idle' | 'hover' | 'typing' | 'answering' | 'error';

export interface OrbSignals {
  /** Pointer over the orb, or the orb has keyboard focus. */
  hovered: boolean;
  /** The visitor has text in the composer and the composer has focus. */
  typing: boolean;
  /** A reply is on its way. */
  answering: boolean;
  /** A request just failed: true for the short error flash only. */
  error: boolean;
}

export const IDLE_SIGNALS: OrbSignals = {
  hovered: false,
  typing: false,
  answering: false,
  error: false,
};

/**
 * The state the orb shows. The most urgent signal wins: an error flash beats an answer in
 * progress, which beats typing, which beats hover, which beats resting.
 */
export function orbVisual(signals: OrbSignals): OrbVisual {
  if (signals.error) return 'error';
  if (signals.answering) return 'answering';
  if (signals.typing) return 'typing';
  if (signals.hovered) return 'hover';
  return 'idle';
}

/** Motion timings in milliseconds. */
export const LAUNCHER_TIMING = {
  /** One idle breath. */
  breath: 3200,
  /** One ripple ring while a reply streams in. */
  ripple: 900,
  /** The red tint after a failure. */
  errorFlash: 300,
  /** Panel grows out of the orb. */
  open: 320,
  /** Panel folds back into the orb. */
  close: 240,
} as const;

/** Under reduced motion every transition is an opacity fade of at most 150ms. */
export const REDUCED_MOTION_TIMING = {
  breath: 0,
  ripple: 0,
  errorFlash: 150,
  open: 150,
  close: 150,
} as const;

export function launcherTiming(reducedMotion: boolean) {
  return reducedMotion ? REDUCED_MOTION_TIMING : LAUNCHER_TIMING;
}

/** Launcher sizes in px: 56 on desktop, 52 on phones. */
export const LAUNCHER_SIZE = { desktop: 56, mobile: 52 } as const;
/** At or below this width the panel is a bottom sheet. */
export const SHEET_BREAKPOINT = 480;

export type PanelPhase = 'closed' | 'opening' | 'open' | 'closing';

export type PanelEvent =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'toggle' }
  /** The open or close transition finished (or its timer fired). */
  | { type: 'settled' };

/** The panel's lifecycle. Opening while closing (and the reverse) turns around mid-way. */
export function panelReducer(phase: PanelPhase, event: PanelEvent): PanelPhase {
  switch (event.type) {
    case 'open':
      return phase === 'open' || phase === 'opening' ? phase : 'opening';
    case 'close':
      return phase === 'closed' || phase === 'closing' ? phase : 'closing';
    case 'toggle':
      return phase === 'open' || phase === 'opening' ? 'closing' : 'opening';
    case 'settled':
      if (phase === 'opening') return 'open';
      if (phase === 'closing') return 'closed';
      return phase;
  }
}

/** The panel is in the page (and its JS is needed) in every phase but `closed`. */
export const panelMounted = (phase: PanelPhase) => phase !== 'closed';
/** The panel counts as open for aria-expanded and focus while opening or open. */
export const panelExpanded = (phase: PanelPhase) => phase === 'opening' || phase === 'open';

/** Hash deep links that open the Guide on a given tab. */
export const GUIDE_HASH_TABS: Readonly<Record<string, 'ask' | 'report'>> = {
  '#ask-renor': 'ask',
  '#report-a-problem': 'report',
};

export function guideTabFromHash(hash: string): 'ask' | 'report' | null {
  return GUIDE_HASH_TABS[hash] ?? null;
}
