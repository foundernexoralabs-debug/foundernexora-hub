// @polsia:user-owned — the main thread's side of the orb worker (worker-host.ts explains why the
// orbs draw off the main thread).
//
// One worker serves every orb on the page. It is started on first use, and it must answer a
// handshake (it can draw 2D on an OffscreenCanvas) before any canvas is handed over: a canvas
// can be transferred only once, so a browser without worker canvas support, a worker that fails
// to load, or a slow start (4 s) all leave the orbs on the main-thread engine, the same orb.

import { ORB_TEXTURE_URL, type OrbTextureSnapshot } from './texture';
import type { OrbDrawConfig, OrbWorkerReply, OrbWorkerRequest } from './worker-host';

export interface OrbWorkerClient {
  /** Hand a canvas to the worker; returns its id, or null when it cannot be transferred. */
  attach(canvas: HTMLCanvasElement, seed: number): number | null;
  draw(id: number, config: OrbDrawConfig, running: boolean): void;
  /** Release a canvas (deferred a tick, so a React StrictMode remount keeps the same one). */
  release(canvas: HTMLCanvasElement): void;
}

const HANDSHAKE_MS = 4000;

let clientPromise: Promise<OrbWorkerClient | null> | null = null;

// ── The picture, as loaded by the worker ──────────────────────────────────

let texture: OrbTextureSnapshot = Object.freeze({ status: 'idle', image: null });
const textureListeners = new Set<() => void>();

function publishTexture(status: OrbTextureSnapshot['status']) {
  texture = Object.freeze({ status, image: null });
  for (const listener of textureListeners) listener();
}

/** useSyncExternalStore snapshot: the worker's copy of the orb picture (`image` stays null). */
export function getWorkerOrbTexture(): OrbTextureSnapshot {
  return texture;
}

export function subscribeWorkerOrbTexture(listener: () => void): () => void {
  textureListeners.add(listener);
  return () => {
    textureListeners.delete(listener);
  };
}

function supported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof Worker === 'function' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.transferControlToOffscreen === 'function'
  );
}

function createClient(worker: Worker): OrbWorkerClient {
  const send = (request: OrbWorkerRequest, transfer: Transferable[] = []) =>
    worker.postMessage(request, transfer);
  const attached = new WeakMap<HTMLCanvasElement, { id: number; release: number }>();
  let nextId = 1;

  publishTexture('loading');
  send({ type: 'texture', url: new URL(ORB_TEXTURE_URL, window.location.href).href });

  return {
    attach(canvas, seed) {
      const known = attached.get(canvas);
      if (known) {
        window.clearTimeout(known.release);
        known.release = 0;
        return known.id;
      }
      let offscreen: OffscreenCanvas;
      try {
        offscreen = canvas.transferControlToOffscreen();
      } catch {
        return null;
      }
      const id = nextId++;
      attached.set(canvas, { id, release: 0 });
      send({ type: 'attach', id, canvas: offscreen, seed }, [offscreen]);
      return id;
    },
    draw(id, config, running) {
      send({ type: 'draw', id, config, running });
    },
    release(canvas) {
      const known = attached.get(canvas);
      if (!known) return;
      window.clearTimeout(known.release);
      known.release = window.setTimeout(() => {
        known.release = 0;
        // The canvas stays transferred; if this element mounts again it is re-attached by id.
        send({ type: 'detach', id: known.id });
        attached.delete(canvas);
      }, 0);
    },
  };
}

/** The shared orb worker, or null when orbs should draw on the main thread. */
export function getOrbWorkerClient(): Promise<OrbWorkerClient | null> {
  if (clientPromise) return clientPromise;
  clientPromise = new Promise((resolve) => {
    if (!supported()) {
      resolve(null);
      return;
    }
    let worker: Worker;
    try {
      worker = new Worker(new URL('./orb.worker.ts', import.meta.url), { type: 'module' });
    } catch {
      resolve(null);
      return;
    }
    const fail = () => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve(null);
    };
    const timer = window.setTimeout(fail, HANDSHAKE_MS);
    worker.onerror = fail;
    worker.onmessage = (event: MessageEvent<OrbWorkerReply>) => {
      const reply = event.data;
      if (reply.type === 'ready') {
        if (!reply.ok) {
          fail();
          return;
        }
        window.clearTimeout(timer);
        worker.onerror = null;
        resolve(createClient(worker));
      } else if (reply.type === 'texture') {
        publishTexture(reply.status);
      }
    };
    worker.postMessage({ type: 'hello' } satisfies OrbWorkerRequest);
  });
  return clientPromise;
}
