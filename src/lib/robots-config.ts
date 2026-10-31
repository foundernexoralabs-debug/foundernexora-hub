// @polsia:user-owned — crawl rules merged into /robots.txt (robots.ts is
// framework-owned). Applied only when the deploy is indexable (SEO_INDEXABLE).
//
// SEARCH INDEXING: production only, given with the founder's explicit yes on
// 31 Oct 2026 (renor.app go-live). Only the production deploy sets
// SEO_INDEXABLE=true in Vercel; previews and local builds leave it unset, so
// /robots.txt answers `Disallow: /` for them. Keep that default fail-closed.
// Any wider change (indexing previews, editing robots.ts) needs the founder's
// explicit yes first.
// tests/unit/indexing.test.ts fails the build if robots stops disallowing by default.
export const robotsConfig = {
  /** Paths to keep out of search even when indexable, e.g. ['/admin']. */
  disallow: ['/admin'] as string[],
  /** Optional crawl-delay (seconds) for the default user-agent. */
  crawlDelay: undefined as number | undefined,
};
