// @polsia:user-owned — your Next.js customizations, merged into next.config.ts by the
// framework. Edit freely (no slot markers). next.config.ts stays framework-owned: don't
// put security headers / CSP / a full `images` block here.
import type { NextConfig } from 'next';

type RemotePatterns = NonNullable<NonNullable<NextConfig['images']>['remotePatterns']>;

/** Remote hosts you load <Image> from. e.g. { protocol: 'https', hostname: 'images.unsplash.com' } */
export const userRemotePatterns: RemotePatterns = [];

type Redirects = Awaited<ReturnType<NonNullable<NextConfig['redirects']>>>;

/**
 * Permanent (308) redirects for moved pages, so old links and bookmarks keep working.
 * The store moved from /store to /plugins on 22 October 2026 when it became the Renor
 * Plugin Store. tests/unit/plugins.test.ts checks these entries.
 */
export const userRedirects: Redirects = [
  { source: '/store', destination: '/plugins', permanent: true },
  { source: '/store/:slug', destination: '/plugins/:slug', permanent: true },
];

/** Package-level Next options (transpilePackages, experimental.optimizePackageImports, …). */
export const userNextConfig: NextConfig = {
  async redirects() {
    return userRedirects;
  },
};
