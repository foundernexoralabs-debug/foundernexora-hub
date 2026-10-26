// @polsia:user-owned — the shared runtime for every living orb on the page. Ported from the
// Renor app (src/components/ui/orbRuntime.js).
//
//   - ONE loop drives all visible orbs (the header mark, the Ask Renor launcher and any Guide orb
//     share a frame instead of each scheduling their own), at 30 fps so every canvas draws on
//     the same frames. It stops entirely when no orb is subscribed.
//   - ONE observer watches <html> for what changes how orbs are drawn: the colour scheme (the
//     website's `dark` class, set by next-themes) and the OS prefers-reduced-motion query.
//     (The app also reads its own reduce-motion switch and an error alert; the website has
//     neither.)
//
// Everything touching `window`/`document` happens lazily inside functions, so the module
// imports cleanly on the server and in unit tests.

import type { OrbTheme } from './palette';

type FrameListener = (now: number) => void;

/** Orbs draw at most this often, all on the same frames (engine.ts, ORB_FRAME_INTERVAL). */
const FRAME_MS = 1000 / 30;

const frameListeners = new Set<FrameListener>();
let frameHandle = 0;
let timerHandle: ReturnType<typeof setTimeout> | 0 = 0;
let lastTick = Number.NEGATIVE_INFINITY;

function requestTick() {
  if (frameHandle || timerHandle || typeof requestAnimationFrame !== 'function') return;
  frameHandle = requestAnimationFrame(tick);
}

function tick(now: number) {
  frameHandle = 0;
  if (!frameListeners.size) return;
  // Between orb frames the loop sleeps on a timer instead of waking every display frame, and
  // wakes on the display frame after it, so every orb's draw lands on one shared frame.
  if (now - lastTick < FRAME_MS - 1) {
    frameHandle = requestAnimationFrame(tick);
    return;
  }
  lastTick = now;
  for (const listener of frameListeners) {
    try {
      listener(now);
    } catch {
      // One orb failing never stops the others.
    }
  }
  if (!frameListeners.size) return;
  timerHandle = setTimeout(() => {
    timerHandle = 0;
    requestTick();
  }, FRAME_MS - 12);
}

/** Run `listener(now)` on every shared orb frame (30 fps) until the returned function is called. */
export function subscribeOrbFrame(listener: FrameListener): () => void {
  frameListeners.add(listener);
  requestTick();
  return () => {
    frameListeners.delete(listener);
    if (frameListeners.size) return;
    if (frameHandle && typeof cancelAnimationFrame === 'function')
      cancelAnimationFrame(frameHandle);
    if (timerHandle) clearTimeout(timerHandle);
    frameHandle = 0;
    timerHandle = 0;
  };
}

/** Number of orbs currently animating (tests and diagnostics). */
export function activeOrbFrameCount(): number {
  return frameListeners.size;
}

// ── The document environment ─────────────────────────────────────────────

export interface OrbEnvironment {
  readonly theme: OrbTheme;
  readonly reducedMotion: boolean;
}

const SERVER_ENVIRONMENT: OrbEnvironment = Object.freeze({ theme: 'dark', reducedMotion: false });
const environmentListeners = new Set<() => void>();
let environment: OrbEnvironment = SERVER_ENVIRONMENT;
let observer: MutationObserver | null = null;
let motionQuery: MediaQueryList | null = null;

function readEnvironment(): OrbEnvironment {
  if (typeof document === 'undefined' || !document.documentElement) return SERVER_ENVIRONMENT;
  const root = document.documentElement;
  const query =
    motionQuery ??
    (typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null);
  return {
    theme: root.classList?.contains('dark') ? 'dark' : 'light',
    reducedMotion: Boolean(query?.matches),
  };
}

/** Adopt the current environment; true when it changed. Snapshots are reused while equal. */
function syncEnvironment(): boolean {
  const next = readEnvironment();
  if (next.theme === environment.theme && next.reducedMotion === environment.reducedMotion) {
    return false;
  }
  environment = Object.freeze(next);
  return true;
}

function refreshEnvironment() {
  if (!syncEnvironment()) return;
  for (const listener of environmentListeners) listener();
}

function startWatching() {
  if (observer || typeof document === 'undefined') return;
  if (typeof matchMedia === 'function') {
    motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener?.('change', refreshEnvironment);
  }
  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver(refreshEnvironment);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
  syncEnvironment();
}

function stopWatching() {
  observer?.disconnect();
  observer = null;
  motionQuery?.removeEventListener?.('change', refreshEnvironment);
  motionQuery = null;
}

/** useSyncExternalStore subscribe: theme and reduced-motion changes. */
export function subscribeOrbEnvironment(listener: () => void): () => void {
  startWatching();
  environmentListeners.add(listener);
  return () => {
    environmentListeners.delete(listener);
    if (!environmentListeners.size) stopWatching();
  };
}

export function getOrbEnvironment(): OrbEnvironment {
  if (!observer) syncEnvironment();
  return environment;
}

export function getServerOrbEnvironment(): OrbEnvironment {
  return SERVER_ENVIRONMENT;
}
