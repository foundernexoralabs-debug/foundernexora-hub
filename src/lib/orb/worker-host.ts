// @polsia:user-owned — the orb worker's logic: every living orb on the page, drawn off the main
// thread.
//
// WHY. A canvas drawn on the main thread makes the browser run a full main-thread frame and
// commit the page's layer tree for every orb frame. On the home page that cost ~150 ms of main
// thread per second at 30 fps, though the orb's own drawing is ~15 ms of it. A canvas handed to
// a worker (transferControlToOffscreen) sends its frames straight to the compositor, so the
// page does no work for them. The engine and its pixels are exactly the same (engine.ts).
//
// The main thread (worker-client.ts, founder-orb.tsx) still decides everything: size, detail,
// colours, state, and whether an orb runs (on screen, tab visible, motion welcome). This host
// only draws: a still frame when told to stop, the shared 30 fps loop while running.
//
// Pure apart from the injected loader, so it is unit-tested without a worker.

import { createOrbEngine, type OrbEngine, type OrbEngineConfig } from './engine';
import { subscribeOrbFrame } from './runtime';

/** Everything the engine needs except the picture, which the worker loads itself. */
export type OrbDrawConfig = Omit<OrbEngineConfig, 'texture'>;

export type OrbWorkerRequest =
  | { type: 'hello' }
  | { type: 'texture'; url: string }
  | { type: 'attach'; id: number; canvas: OffscreenCanvas; seed: number }
  | { type: 'draw'; id: number; config: OrbDrawConfig; running: boolean }
  | { type: 'detach'; id: number };

export type OrbWorkerReply =
  | { type: 'ready'; ok: boolean }
  | { type: 'texture'; status: 'ready' | 'failed' };

interface HostedOrb {
  engine: OrbEngine;
  config: OrbDrawConfig | null;
  running: boolean;
  stop: (() => void) | null;
}

export interface OrbWorkerHostDeps {
  /** Decode the orb picture (createImageBitmap of a fetch in the worker). */
  loadBitmap: (url: string) => Promise<CanvasImageSource>;
  /** Whether this context can draw 2D on an OffscreenCanvas. */
  canDraw: () => boolean;
}

export function createOrbWorkerHost(
  post: (reply: OrbWorkerReply) => void,
  { loadBitmap, canDraw }: OrbWorkerHostDeps,
): (request: OrbWorkerRequest) => void {
  const orbs = new Map<number, HostedOrb>();
  let texture: CanvasImageSource | null = null;
  let textureStatus: 'idle' | 'loading' | 'ready' | 'failed' = 'idle';

  /** Same policy as the main-thread orb: a still frame when stopped, the shared loop when running. */
  function apply(orb: HostedOrb) {
    if (!orb.config) return;
    if (!orb.engine.configure({ ...orb.config, texture })) return;
    if (!orb.running) {
      orb.stop?.();
      orb.stop = null;
      orb.engine.still();
      return;
    }
    if (!orb.stop) {
      orb.engine.frame();
      orb.stop = subscribeOrbFrame((now) => {
        orb.engine.frame(now);
      });
    }
  }

  function settleTexture(status: 'ready' | 'failed', image: CanvasImageSource | null) {
    texture = image;
    textureStatus = status;
    post({ type: 'texture', status });
    for (const orb of orbs.values()) apply(orb);
  }

  return function handle(request) {
    switch (request.type) {
      case 'hello': {
        let ok = false;
        try {
          ok = canDraw();
        } catch {
          ok = false;
        }
        post({ type: 'ready', ok });
        return;
      }
      case 'texture': {
        if (textureStatus === 'ready' || textureStatus === 'failed') {
          post({ type: 'texture', status: textureStatus });
          return;
        }
        if (textureStatus === 'loading') return;
        textureStatus = 'loading';
        loadBitmap(request.url).then(
          (image) => settleTexture('ready', image),
          () => settleTexture('failed', null),
        );
        return;
      }
      case 'attach': {
        if (orbs.has(request.id)) return;
        try {
          const engine = createOrbEngine(request.canvas as unknown as HTMLCanvasElement, {
            seed: request.seed,
          });
          orbs.set(request.id, { engine, config: null, running: false, stop: null });
        } catch {
          // An orb that cannot draw keeps its picture stand-in.
        }
        return;
      }
      case 'draw': {
        const orb = orbs.get(request.id);
        if (!orb) return;
        orb.config = request.config;
        orb.running = request.running;
        apply(orb);
        return;
      }
      case 'detach': {
        const orb = orbs.get(request.id);
        if (!orb) return;
        orb.stop?.();
        orb.engine.destroy();
        orbs.delete(request.id);
        return;
      }
    }
  };
}
