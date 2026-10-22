// @polsia:user-owned — a link-preview image for each Plugin Store product: its line, name,
// price and status, drawn from the catalogue so a shared link shows the real product.
import { ImageResponse } from 'next/og';
import { brandVisual } from '@/lib/brand';
import { availabilityLabel, findPlugin, listedPlugins } from '@/lib/business/plugins';

export const alt = 'A Renor Plugin Store product';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return listedPlugins().map((plugin) => ({ slug: plugin.slug }));
}

export default async function PluginImage({ params }: { params: Promise<{ slug: string }> }) {
  const plugin = findPlugin((await params).slug);
  const { background, foreground } = brandVisual.og;
  const name = plugin
    ? plugin.line && plugin.title.startsWith(`${plugin.line}: `)
      ? plugin.title.slice(plugin.line.length + 2)
      : plugin.title
    : 'Renor Plugin Store';
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background,
        color: foreground,
        padding: '72px 80px',
      }}
    >
      <div style={{ display: 'flex', fontSize: 30, letterSpacing: '0.12em', opacity: 0.7 }}>
        RENOR PLUGIN STORE
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {plugin?.line ? (
          <div style={{ display: 'flex', fontSize: 36, color: brandVisual.themeColor }}>
            {plugin.line}
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            marginTop: 12,
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
          }}
        >
          {name}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 34 }}>
        {plugin ? (
          <>
            <div style={{ display: 'flex', fontWeight: 700 }}>{plugin.price.label} one-off</div>
            <div
              style={{
                display: 'flex',
                padding: '8px 22px',
                borderRadius: 999,
                border: `2px solid ${foreground}`,
                fontSize: 26,
                opacity: 0.85,
              }}
            >
              {availabilityLabel(plugin)}
            </div>
          </>
        ) : null}
        <div style={{ display: 'flex', marginLeft: 'auto', fontSize: 28, opacity: 0.7 }}>
          by FounderLab
        </div>
      </div>
    </div>,
    size,
  );
}
