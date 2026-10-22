// @polsia:user-owned — extra <head> rendered by the framework layout.
// Add <meta>/<link> here (verification, preconnect) — React hoists them. For scripts use
// next/script with the passed `nonce` (CSP-safe). Edit freely.
import { fontStack } from '@/lib/fonts';

/**
 * Points the theme's font tokens at the self-hosted Inter from src/lib/fonts.ts.
 * `html:root` outranks the `:root` defaults in globals.css whatever the stylesheet order.
 */
const fontTokens = `html:root{--font-display:${fontStack};--font-body:${fontStack};}`;

export function HeadContent({ nonce }: { nonce?: string }) {
  return (
    <style href="founderlab-font-tokens" precedence="default" nonce={nonce}>
      {fontTokens}
    </style>
  );
}
