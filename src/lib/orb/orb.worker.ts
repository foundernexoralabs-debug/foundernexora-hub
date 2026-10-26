// @polsia:user-owned — the orb worker: draws every living orb on the page off the main thread.
// The logic lives in worker-host.ts (unit-tested); this file only wires it to the worker scope.

import { createOrbWorkerHost, type OrbWorkerReply, type OrbWorkerRequest } from './worker-host';

const scope = self as unknown as {
  postMessage: (reply: OrbWorkerReply) => void;
  onmessage: ((event: MessageEvent<OrbWorkerRequest>) => void) | null;
};

const handle = createOrbWorkerHost((reply) => scope.postMessage(reply), {
  loadBitmap: async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`orb picture: ${response.status}`);
    // Unpremultiplied, as an <img> decodes it: the default rounds the picture's soft edges
    // through premultiplied alpha and shifts them by a few levels from the main-thread orb.
    return createImageBitmap(await response.blob(), { premultiplyAlpha: 'none' });
  },
  canDraw: () =>
    typeof OffscreenCanvas === 'function' && Boolean(new OffscreenCanvas(1, 1).getContext('2d')),
});

scope.onmessage = (event) => handle(event.data);
