# Public identity and discoverability — proposal (2026-09-29)

**Status:** design brief; not a shipped feature. **Owner approval required before public deployment.**

## One clear identity
- **FounderNexora** — current public company/portfolio hub name in this repository. Do not represent this as a registered legal entity without verification.
- **Renor** — public-facing AI workspace/product, evolving from FounderLab.
- **FounderLab** — engineering/origin name; preserve existing identifiers and integrations until migration is planned and tested.
- **Future commerce brand** — separate customer-facing identity; no trademark, domain, supplier, or product claim until verified.

Keep a consistent relationship across domain, GitHub profile, README, product pages, social handles and legal notices. Avoid claiming a founding date, registration, customers, revenue, press, partnerships, autonomous abilities, or certification without evidence.

## Public website: 90-second information architecture
1. Hero: FounderNexora builds practical AI-native tools; Renor is its upcoming flagship workspace. One primary call-to-action: Explore Renor.
2. Renor page: clear job-to-be-done; what visitors can currently try (verified only); demonstrated workflow, project status and honest upcoming features; one action for demo/waitlist when operational.
3. Products: distinguish available, preview, building and planned. Optional future commerce project belongs in Portfolio only after the brand and offering are ready.
4. How it works: understand → plan → authorised connector action → verification → in-chat evidence; use product screenshots or short factual videos only after verification.
5. Company: concise, fact-checkable story and link to the public GitHub project. Do not publish private health, family, finances, account details or Company OS operating secrets.
6. Updates: dated changelog with links to visible evidence and a clear distinction between shipped / in progress / proposed.
7. Trust: real contact route, privacy policy, terms appropriate to available services; no fake testimonials, partner badges or customer metrics.

## Brand direction for design review
Distinctive, polished, futuristic but legible; original visuals rather than stock AI imagery. Make interaction purposeful: restrained motion, clear focus states, keyboard support, reduced-motion fallback, sharp typography and mobile-first layout. Identity must not borrow Shopify store branding: company and commerce are separate brands.

## Discoverability gates
- Preserve the Polsia ownership map. Read AGENTS.md and .polsia/{installed,ownership,overrides}.json before any code change.
- Current user-owned brand source: src/lib/brand.ts. User-owned home route: src/app/(setup)/page.tsx. Nav: src/lib/nav.ts. Avoid framework-owned SEO files.
- Use per-page unique title, descriptions, correct canonicals, accessible semantic content, an original verified OG image and favicon. Add factual, correctly scoped structured data only after verification.
- Production deployment needs a real approved canonical domain, working HTTPS, no accidental robots noindex, correct sitemap, and Google Search Console ownership verification. The existing framework defaults to noindex unless SEO_INDEXABLE=true; staging must remain noindex.
- Search engines and third-party AI systems are not controllable: publication does not guarantee indexing, favorable descriptions or a particular ranking.
- Check Vercel site and live pages manually before any public 'Live' badges; current home copy should be audited for unverified 'free forever', 'works 100% locally', downloadable macOS app and feature assertions.

## Release acceptance
- One canonical brand map and a live mobile-responsive public site verified in browser.
- Renor is easy to find from home and explains real versus upcoming features.
- Correct sitemap/robots/canonical/metadata on the approved domain; Search Console submitted.
- All public claims evidence-backed; test accessibility, mobile layout, links and performance.
- Owner reviews preview and approves deployment. No confidential company details leaked.
