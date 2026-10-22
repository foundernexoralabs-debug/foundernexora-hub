// @polsia:user-owned — crawl rules merged into /robots.txt (robots.ts is
// framework-owned). Applied only when the deploy is indexable (SEO_INDEXABLE).
//
// SEARCH INDEXING IS OFF, ON PURPOSE. /robots.txt answers `Disallow: /` for every
// deploy because SEO_INDEXABLE is not set to 'true' anywhere. The founder has not
// approved making the site public to search engines: setting SEO_INDEXABLE=true
// (or changing robots.ts) needs the founder's explicit yes first.
// tests/unit/indexing.test.ts fails the build if robots stops disallowing by default.
export const robotsConfig = {
  /** Paths to keep out of search even when indexable, e.g. ['/admin']. */
  disallow: [] as string[],
  /** Optional crawl-delay (seconds) for the default user-agent. */
  crawlDelay: undefined as number | undefined,
};
