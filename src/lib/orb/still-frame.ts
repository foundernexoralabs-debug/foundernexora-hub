// @polsia:user-owned — still frames of small orbs, as image URLs, keyed by everything that
// changes their pixels. Ported unchanged from the Renor app (src/components/ui/orbStillFrame.js).
//
// A canvas is its own compositor layer. For a small orb that does not move (a Guide avatar,
// reduced motion) that layer buys nothing, so the orb shows a picture of the same frame and is
// painted with the page. Every still avatar draws the same frame, so it is encoded once.

const STILL_FRAMES = new Map<string, string>();
const STILL_FRAME_LIMIT = 24;

/** The canvas's own still frame as an image URL, or '' when it cannot be read. */
export function readOrbStillFrame(
  canvas: Pick<HTMLCanvasElement, 'width' | 'height' | 'toDataURL'> | null | undefined,
  key: string,
  cache: Map<string, string> = STILL_FRAMES,
): string {
  if (!canvas || !canvas.width || !canvas.height || typeof canvas.toDataURL !== 'function') {
    return '';
  }
  const fullKey = `${key}|${canvas.width}x${canvas.height}`;
  const cached = cache.get(fullKey);
  if (cached) return cached;
  let url = '';
  try {
    url = canvas.toDataURL('image/png');
  } catch {
    return '';
  }
  if (!url.startsWith('data:image/')) return '';
  if (cache.size >= STILL_FRAME_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(fullKey, url);
  return url;
}
