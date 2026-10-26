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
// the orb is drawn at (a ~30px mark has no orbiting motes), and reduced motion draws one still
// frame with no loop at all. On the website every orb draws at 30 fps, and where the browser
// allows it the engine runs in a worker on an OffscreenCanvas (src/lib/orb/worker-host.ts), so
// orb frames go straight to the compositor and cost the page's main thread nothing. Before the canvas paints (server render, first
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
import {
  getOrbWorkerClient,
  getWorkerOrbTexture,
  type OrbWorkerClient,
  subscribeWorkerOrbTexture,
} from '@/lib/orb/worker-client';
import type { OrbDrawConfig } from '@/lib/orb/worker-host';
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

type OrbBackend = 'pending' | 'worker' | 'main';

/** What draws one orb's canvas: the shared orb worker, or the engine on the main thread. */
interface OrbDriver {
  /** Configure, then draw a still frame (not running) or join the shared 30 fps loop. */
  draw(config: OrbDrawConfig, running: boolean, image: CanvasImageSource | null): boolean;
  /** The still frame as a picture ('' when it cannot be read, as from a worker canvas). */
  readStill(key: string): string;
  destroy(): void;
}

function createMainDriver(canvas: HTMLCanvasElement): OrbDriver | null {
  let engine: OrbEngine;
  try {
    engine = createOrbEngine(canvas, { seed: 7 });
  } catch {
    return null;
  }
  let stop: (() => void) | null = null;
  return {
    draw(config, running, image) {
      if (!engine.configure({ ...config, texture: image })) return false;
      if (!running) {
        stop?.();
        stop = null;
        engine.still();
      } else if (!stop) {
        engine.frame();
        stop = subscribeOrbFrame((now) => {
          engine.frame(now);
        });
      }
      return true;
    },
    readStill: (key) => readOrbStillFrame(canvas, key),
    destroy() {
      stop?.();
      engine.destroy();
    },
  };
}

function createWorkerDriver(client: OrbWorkerClient, canvas: HTMLCanvasElement): OrbDriver | null {
  const id = client.attach(canvas, 7);
  if (id === null) return null;
  return {
    draw(config, running) {
      client.draw(id, config, running);
      return true;
    },
    // The worker's canvas paints on the compositor already; a still one costs no frames.
    readStill: () => '',
    destroy: () => client.release(canvas),
  };
}

/** Which backend draws the orbs on this page (decided once, shared by every orb). */
function useOrbBackend() {
  const [backend, setBackend] = useState<OrbBackend>('pending');
  const clientRef = useRef<OrbWorkerClient | null>(null);
  useEffect(() => {
    let alive = true;
    getOrbWorkerClient().then((client) => {
      if (!alive) return;
      clientRef.current = client;
      setBackend(client ? 'worker' : 'main');
    });
    return () => {
      alive = false;
    };
  }, []);
  return { backend, clientRef };
}

/**
 * Drives the canvas: picks who draws it (the orb worker, else the main thread), configures it
 * when anything that changes the drawing changes, and runs it only while it should run.
 */
function useLivingOrbCanvas({
  canvasRef,
  backend,
  clientRef,
  renderedSize,
  state,
  energy,
  running,
  environment,
  texture,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  backend: OrbBackend;
  clientRef: RefObject<OrbWorkerClient | null>;
  renderedSize: number;
  state: FounderOrbState;
  energy: number;
  running: boolean;
  environment: OrbEnvironment;
  texture: OrbTextureSnapshot;
}) {
  const driverRef = useRef<OrbDriver | null>(null);
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
    if (!canvas || backend === 'pending') return undefined;
    const client = clientRef.current;
    let driver = backend === 'worker' && client ? createWorkerDriver(client, canvas) : null;
    if (!driver && typeof canvas.getContext === 'function') driver = createMainDriver(canvas);
    driverRef.current = driver;
    return () => {
      driver?.destroy();
      driverRef.current = null;
    };
  }, [canvasRef, clientRef, backend]);

  useEffect(() => {
    const driver = driverRef.current;
    if (backend === 'pending' || !driver || !renderedSize) return;
    // Wait for the picture: painting the fallback sphere first would flash a different orb.
    // Until then the CSS stand-in (the same picture) shows.
    if (texture.status === 'idle' || texture.status === 'loading') return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const config: OrbDrawConfig = {
      size: renderedSize,
      tier,
      palette,
      profile,
      state,
      signal: null,
      energy,
      dpr,
    };
    if (!driver.draw(config, running, texture.image)) return;
    // A small still orb on the main thread hands its frame to a picture: painted with the page,
    // no canvas layer.
    setStillFrame(
      !running && tier === 'mark'
        ? driver.readStill(
            `${palette.key}|${state}|${energy}|${dpr}|${renderedSize}|${texture.status}`,
          )
        : '',
    );
    if (!ready) setReady(true);
  }, [backend, renderedSize, tier, palette, profile, state, energy, running, ready, texture]);

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
  const { backend, clientRef } = useOrbBackend();
  // The picture is loaded by whoever draws: the worker, or this page for the main-thread engine.
  const mainTexture = useSyncExternalStore(subscribeOrbTexture, getOrbTexture, getOrbTexture);
  const workerTexture = useSyncExternalStore(
    subscribeWorkerOrbTexture,
    getWorkerOrbTexture,
    getWorkerOrbTexture,
  );
  const texture = backend === 'worker' ? workerTexture : mainTexture;
  useEffect(() => {
    if (backend === 'main') loadOrbTexture(ORB_TEXTURE_URL);
  }, [backend]);
  const running = shouldRunFounderOrbLoop({
    enabled: animate,
    intersecting,
    pageVisible,
    reducedMotion: environment.reducedMotion,
  });
  const { tier, ready, profile, palette, stillFrame } = useLivingOrbCanvas({
    canvasRef,
    backend,
    clientRef,
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
      data-orb-backend={backend}
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
