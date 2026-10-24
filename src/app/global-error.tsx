// @polsia:user-owned — root error boundary; REPLACES the layout, so it renders its own
// <html>/<body> with inline styles (theme/providers unavailable). Restyle or delete.

'use client';

import { INK, SURFACE } from '@/lib/design-tokens';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: SURFACE.bg0,
          color: INK.text1,
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ color: INK.text2 }}>A critical error occurred. Please try again.</p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            border: `1px solid ${SURFACE.lineStrong}`,
            background: SURFACE.bg2,
            color: INK.text1,
            minHeight: '44px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
