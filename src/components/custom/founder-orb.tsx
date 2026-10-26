// @polsia:user-owned — Renor's living orb on the website: the same orb as the Renor app.
//
// Ported from the app's FounderOrb (src/components/ui/FounderOrb.jsx). The sphere IS the
// founder's approved picture (public/assets/renor/founderlab-energy-orb.png): the blue
// sun-globe threaded with lightning, drawn by the canvas engine (src/lib/orb/engine.ts) so it
// turns, breathes, crackles with lightning and throws orbiting sparkles, in the app's default
// orb colour, on the dark and the light theme.
//
// Cost is bounded the way the app bounds it: one shared animation frame for every orb on the
// page, nothing runs while the orb is off-screen or the tab is hidden, detail follows the size
// the orb is drawn at (a ~30px mark draws at 30fps with no orbiting motes), and reduced motion
// draws one still frame with no loop at all. Before the canvas paints (server render, first
// frame) the same picture stands in as a CSS background, so the orb never pops in.
//
// Used by the header and footer mark (brand-mark.tsx), the Ask Renor launcher, the Renor Guide,
// the /renor hero, the 404 page and the founder avatar.
'use client';

import {
  type CSSProperties,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createOrbEngine, type OrbEngine, orbTierLayout } from '@/lib/orb/engine';
import { createOrbPalette, ORB_DEFAULT_HUE } from '@/lib/orb/palette';
import {
  getOrbEnvironment,
  getServerOrbEnvironment,
  type OrbEnvironment,
  subscribeOrbEnvironment,
  subscribeOrbFrame,
} from '@/lib/orb/runtime';
import {
  type FounderOrbState,
  founderOrbEnergy,
  founderOrbTier,
  isFounderOrbActive,
  normalizeFounderOrbSignal,
  normalizeFounderOrbState,
  shouldRunFounderOrbLoop,
} from '@/lib/orb/state';
import { readOrbStillFrame } from '@/lib/orb/still-frame';
import {
  getOrbTexture,
  loadOrbTexture,
  ORB_TEXTURE_URL,
  type OrbTextureSnapshot,
  subscribeOrbTexture,
} from '@/lib/orb/texture';
import { cn } from '@/lib/utils';
import './founder-orb.css';

/** Detail hints, as in the app. The drawn detail itself follows the rendered size. */
export type FounderOrbDetail = 'hero' | 'status' | 'compact';

export interface FounderOrbProps {
  /** Box size in CSS px (or any CSS length). Omit it to size the orb with `className`. */
  size?: number | string;
  state?: FounderOrbState;
  detail?: FounderOrbDetail;
  /** Gives the orb `role="status"` and this name. Decorative (aria-hidden) when omitted. */
  label?: string;
  /** 0–1: how strongly the core breathes. */
  intensity?: number;
  /** `false` draws one still frame and runs no loop (small repeats, avatars). */
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
}

function useFounderOrbActivity(enabled: boolean) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [intersecting, setIntersecting] = useState(true);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
  );

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver !== 'function') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry?.isIntersecting !== false),
      { rootMargin: '96px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibility = () => setPageVisible(document.visibilityState !== 'hidden');
    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return {
    rootRef,
    intersecting,
    pageVisible,
    active: isFounderOrbActive({ enabled, intersecting, pageVisible }),
  };
}

/** The orb's rendered width in CSS px: sizes may be CSS expressions or set by a stylesheet. */
function useRenderedSize(
  rootRef: RefObject<HTMLSpanElement | null>,
  size: number | string | undefined,
) {
  const [rendered, setRendered] = useState(() => (typeof size === 'number' ? size : 0));
  // The ResizeObserver follows every later size change, whatever caused it.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    const measure = (width: number) => {
      if (width > 0) {
        setRendered((current) => (Math.abs(current - width) < 0.5 ? current : width));
      }
    };
    // offsetWidth ignores transforms (the launcher breathes by scaling the orb).
    measure(node.offsetWidth || node.getBoundingClientRect().width);
    if (typeof ResizeObserver !== 'function') return undefined;
    const observer = new ResizeObserver(([entry]) => measure(entry?.contentRect?.width ?? 0));
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootRef]);
  return rendered;
}

/**
 * Drives the canvas: configures the engine when anything that changes the drawing changes,
 * and joins the shared frame loop only while it should run.
 */
function useLivingOrbCanvas({
  canvasRef,
  renderedSize,
  state,
  energy,
  running,
  environment,
  texture,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  renderedSize: number;
  state: FounderOrbState;
  energy: number;
  running: boolean;
  environment: OrbEnvironment;
  texture: OrbTextureSnapshot;
}) {
  const engineRef = useRef<OrbEngine | null>(null);
  const [ready, setReady] = useState(false);
  const [stillFrame, setStillFrame] = useState('');
  const tier = founderOrbTier(renderedSize);
  const profile = useMemo(() => founderOrbEnergy(state), [state]);
  const palette = useMemo(
    () => createOrbPalette({ hue: ORB_DEFAULT_HUE, tone: profile.tone, theme: environment.theme }),
    [profile.tone, environment.theme],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof canvas.getContext !== 'function') return undefined;
    let engine: OrbEngine | null = null;
    try {
      engine = createOrbEngine(canvas, { seed: 7 });
    } catch {
      engine = null;
    }
    engineRef.current = engine;
    return () => {
      engine?.destroy();
      engineRef.current = null;
    };
  }, [canvasRef]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !renderedSize) return;
    // Wait for the picture: painting the fallback sphere first would flash a different orb.
    // Until then the CSS stand-in (the same picture) shows.
    if (texture.status === 'idle' || texture.status === 'loading') return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const configured = engine.configure({
      size: renderedSize,
      tier,
      palette,
      profile,
      state,
      signal: null,
      energy,
      dpr,
      texture: texture.image,
    });
    if (!configured) return;
    // Always leave a current picture on the canvas, even when no loop runs.
    if (!running) {
      engine.still();
      // A small still orb hands its frame to a picture: painted with the page, no canvas layer.
      setStillFrame(
        tier === 'mark'
          ? readOrbStillFrame(
              canvasRef.current,
              `${palette.key}|${state}|${energy}|${dpr}|${renderedSize}|${texture.status}`,
            )
          : '',
      );
    } else {
      setStillFrame('');
      if (!ready) engine.frame();
    }
    if (!ready) setReady(true);
  }, [canvasRef, renderedSize, tier, palette, profile, state, energy, running, ready, texture]);

  useEffect(() => {
    if (!running || !ready) return undefined;
    return subscribeOrbFrame((now) => {
      engineRef.current?.frame(now);
    });
  }, [running, ready]);

  return { tier, ready, profile, palette, stillFrame: running ? '' : stillFrame };
}

// Only these two states carry a mark on the orb; every other state is the orb's own light.
function FounderOrbStateMark({ state }: { state: FounderOrbState }) {
  if (state !== 'waiting-approval' && state !== 'success') return null;
  return (
    <span className="fl-orb-state-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d={state === 'success' ? 'm6.8 12.2 3.2 3.15 7.2-7.1' : 'M8.2 7.25v9.5M15.8 7.25v9.5'}
        />
      </svg>
    </span>
  );
}

export function FounderOrb({
  size,
  state = 'idle',
  detail = 'status',
  label,
  intensity = 1,
  animate = true,
  className,
  style,
}: FounderOrbProps) {
  const resolvedState = normalizeFounderOrbState(state);
  const energy = normalizeFounderOrbSignal(intensity) ?? 1;
  const { rootRef, intersecting, pageVisible, active } = useFounderOrbActivity(animate);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const environment = useSyncExternalStore(
    subscribeOrbEnvironment,
    getOrbEnvironment,
    getServerOrbEnvironment,
  );
  const renderedSize = useRenderedSize(rootRef, size);
  const texture = useSyncExternalStore(subscribeOrbTexture, getOrbTexture, getOrbTexture);
  useEffect(() => {
    loadOrbTexture(ORB_TEXTURE_URL);
  }, []);
  const running = shouldRunFounderOrbLoop({
    enabled: animate,
    intersecting,
    pageVisible,
    reducedMotion: environment.reducedMotion,
  });
  const { tier, ready, profile, palette, stillFrame } = useLivingOrbCanvas({
    canvasRef,
    renderedSize,
    state: resolvedState,
    energy,
    running,
    environment,
    texture,
  });
  const overscan = orbTierLayout(tier).overscan * 100;
  const coronaStrength = Math.min(
    1,
    profile.glow * (palette.light ? 1.15 : 1) * (palette.ember ? 0.5 : 1),
  );
  const aria = label
    ? ({ role: 'status', 'aria-label': label, 'aria-live': 'polite' } as const)
    : ({ 'aria-hidden': true } as const);

  return (
    <span
      {...aria}
      ref={rootRef}
      className={cn('fl-orb', `fl-orb--${resolvedState}`, `fl-orb--${detail}`, className)}
      style={
        {
          ...(size === undefined ? null : { width: size, height: size }),
          ...style,
          '--orb-overscan': `${-overscan}%`,
          '--orb-corona': `${palette.corona.h} ${palette.corona.s}% ${palette.corona.l}%`,
          '--orb-glow': coronaStrength.toFixed(3),
          '--orb-breath': `${profile.breath}s`,
          '--orb-texture': `url("${ORB_TEXTURE_URL}")`,
        } as CSSProperties
      }
      data-orb-state={resolvedState}
      data-orb-active={active ? 'true' : 'false'}
      data-orb-running={running ? 'true' : 'false'}
      data-orb-tier={tier}
      data-orb-canvas={ready ? 'ready' : 'pending'}
      data-orb-still={stillFrame ? 'true' : undefined}
    >
      <span className="fl-orb-corona" aria-hidden="true" />
      <span className="fl-orb-body" aria-hidden="true" />
      <canvas ref={canvasRef} className="fl-orb-canvas" />
      {stillFrame ? (
        <span
          className="fl-orb-still"
          aria-hidden="true"
          style={{ backgroundImage: `url("${stillFrame}")` }}
        />
      ) : null}
      <FounderOrbStateMark state={resolvedState} />
    </span>
  );
}
