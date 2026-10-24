// @polsia:user-owned — the Ask Renor orb launcher: its five visual states, the panel's
// open/close lifecycle, reduced-motion timings and the deep links that open it.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  guideTabFromHash,
  IDLE_SIGNALS,
  LAUNCHER_SIZE,
  LAUNCHER_TIMING,
  launcherTiming,
  orbVisual,
  type PanelEvent,
  type PanelPhase,
  panelExpanded,
  panelMounted,
  panelReducer,
  REDUCED_MOTION_TIMING,
  SHEET_BREAKPOINT,
} from '../../src/lib/business/orb-launcher';

const run = (events: PanelEvent['type'][], from: PanelPhase = 'closed') =>
  events.reduce<PanelPhase>((phase, type) => panelReducer(phase, { type }), from);

describe('orb visual state', () => {
  it('rests in idle', () => {
    expect(orbVisual(IDLE_SIGNALS)).toBe('idle');
  });

  it('shows each single signal as its own state', () => {
    expect(orbVisual({ ...IDLE_SIGNALS, hovered: true })).toBe('hover');
    expect(orbVisual({ ...IDLE_SIGNALS, typing: true })).toBe('typing');
    expect(orbVisual({ ...IDLE_SIGNALS, answering: true })).toBe('answering');
    expect(orbVisual({ ...IDLE_SIGNALS, error: true })).toBe('error');
  });

  it('lets the most urgent signal win: error > answering > typing > hover', () => {
    const all = { hovered: true, typing: true, answering: true, error: true };
    expect(orbVisual(all)).toBe('error');
    expect(orbVisual({ ...all, error: false })).toBe('answering');
    expect(orbVisual({ ...all, error: false, answering: false })).toBe('typing');
  });
});

describe('panel lifecycle', () => {
  it('opens through opening, closes through closing', () => {
    expect(run(['open'])).toBe('opening');
    expect(run(['open', 'settled'])).toBe('open');
    expect(run(['open', 'settled', 'close'])).toBe('closing');
    expect(run(['open', 'settled', 'close', 'settled'])).toBe('closed');
  });

  it('toggles from either end, and turns around mid-transition', () => {
    expect(run(['toggle'])).toBe('opening');
    expect(run(['toggle', 'settled', 'toggle'])).toBe('closing');
    expect(run(['open', 'close'])).toBe('closing');
    expect(run(['open', 'settled', 'close', 'open'])).toBe('opening');
  });

  it('ignores repeated requests and stray settles', () => {
    expect(run(['open', 'open'])).toBe('opening');
    expect(run(['close'])).toBe('closed');
    expect(run(['settled'])).toBe('closed');
    expect(run(['open', 'settled', 'settled'])).toBe('open');
  });

  it('keeps the panel in the page until the close finishes', () => {
    expect(panelMounted('closed')).toBe(false);
    for (const phase of ['opening', 'open', 'closing'] as const) {
      expect(panelMounted(phase)).toBe(true);
    }
    expect(panelExpanded('opening')).toBe(true);
    expect(panelExpanded('open')).toBe(true);
    expect(panelExpanded('closing')).toBe(false);
  });
});

describe('timings and reduced motion', () => {
  it('matches the brief: 3.2s breath, 900ms ripple, 300ms error, 320ms open, 240ms close', () => {
    expect(LAUNCHER_TIMING).toEqual({
      breath: 3200,
      ripple: 900,
      errorFlash: 300,
      open: 320,
      close: 240,
    });
    expect(LAUNCHER_SIZE).toEqual({ desktop: 56, mobile: 52 });
    expect(SHEET_BREAKPOINT).toBe(480);
  });

  it('switches to opacity fades of 150ms or less, with no loops, under reduced motion', () => {
    expect(launcherTiming(false)).toBe(LAUNCHER_TIMING);
    expect(launcherTiming(true)).toBe(REDUCED_MOTION_TIMING);
    expect(REDUCED_MOTION_TIMING.breath).toBe(0);
    expect(REDUCED_MOTION_TIMING.ripple).toBe(0);
    for (const ms of [
      REDUCED_MOTION_TIMING.open,
      REDUCED_MOTION_TIMING.close,
      REDUCED_MOTION_TIMING.errorFlash,
    ]) {
      expect(ms).toBeLessThanOrEqual(150);
    }
  });

  it('keeps the CSS in step with the timings and stops loops under reduced motion', () => {
    const css = readFileSync(
      path.resolve(__dirname, '../../src/components/custom/orb-launcher.css'),
      'utf-8',
    );
    expect(css).toMatch(/ol-breathe 3\.2s/);
    expect(css).toMatch(/ol-ripple 900ms/);
    expect(css).toMatch(/ol-grow 320ms/);
    expect(css).toMatch(/ol-fold 240ms/);
    // Every looping animation sits inside the no-preference block.
    const reduce = css.split('@media (prefers-reduced-motion: reduce)').slice(1).join('');
    expect(reduce).not.toMatch(/infinite/);
    expect(reduce).toMatch(/animation-duration: 150ms/);
  });
});

describe('deep links', () => {
  it('opens Ask or Report from the hash, and nothing else', () => {
    expect(guideTabFromHash('#ask-renor')).toBe('ask');
    expect(guideTabFromHash('#report-a-problem')).toBe('report');
    expect(guideTabFromHash('#beta')).toBeNull();
    expect(guideTabFromHash('')).toBeNull();
  });
});
