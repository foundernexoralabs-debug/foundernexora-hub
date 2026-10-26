// @polsia:user-owned — the apple-touch icon: Renor's orb in its still pose on the site's night
// background (iOS needs an opaque square; it rounds the corners itself). Drawn from the same
// geometry as the favicon (src/app/icon.svg) and the live header mark, and prerendered at build.
import { ImageResponse } from 'next/og';
import { renorOrbStillSvg } from '@/lib/business/living-orb';
import { SURFACE } from '@/lib/design-tokens';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const svg = renorOrbStillSvg({ size: size.width, background: SURFACE.bg0, scale: 0.92 });
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return new ImageResponse(
    // biome-ignore lint/performance/noImgElement: ImageResponse renders plain elements, not next/image.
    <img src={src} width={size.width} height={size.height} alt="" />,
    size,
  );
}
