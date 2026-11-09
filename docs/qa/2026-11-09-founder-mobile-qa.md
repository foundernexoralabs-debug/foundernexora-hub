# Founder mobile QA: 9 November 2026

This responds to Atlas's handoff of the founder's iPhone review of the PR #19 preview (three comments on founderlab-ai0.1; the last one sets the public name to **Ahmad**). Everything here is on branch `site/renor-operator-v3`. Nothing is merged or deployed to production, and nothing was changed in Plug&Pay, Stripe, payments or tax.

## How it was tested

- **Browser.** Chromium (Playwright 1.x, the bundled `chromium-1243`) ran against a production build (`next build` then `next start`), built with `NEXT_PUBLIC_APP_URL=https://renor.app` so the OG and canonical URLs are the real ones.
- **Viewports.** 390×844 at device scale 2 with touch (iPhone-like), and 1440×900. Each in dark and light.
- **Pages.** All 19 pages reachable from the nav: `/`, `/renor`, `/renor/capabilities`, `/renor/plans`, `/vision`, `/plugins`, both `/plugins/<kit>` pages, `/company`, `/cocreate`, `/launch-kit`, `/launch-kit/storyboard`, `/zero-to-proof`, `/projects`, `/contact`, `/privacy`, `/terms`, `/renor/billing` and `/accessibility`. That makes 76 page × variant runs.
- **Checks on every run:**
  - axe-core WCAG 2.1 A/AA;
  - console errors;
  - horizontal overflow;
  - CLS;
  - text spilling out of its box;
  - wrong founder spellings;
  - OG and Twitter metadata, and the canonical URL;
  - outdated hosts;
  - in-page anchors;
  - fixed UI covering a link or button at the end of the page;
  - every link answering below 400. External links were checked with curl through the session proxy.
- **Mobile menu, at 390 dark and light:**
  - touch targets of at least 44×44;
  - scroll lock and full-viewport overlay;
  - Escape closes it;
  - a drawer link navigates and closes it.
- **Hero orb:**
  - with `prefers-reduced-motion: reduce`, two captures 1.2 s apart must be identical;
  - its box must stay the same size;
  - CLS.
- **Unit tests.** `npm test` gives 545/545, including these new tests:
  - `founder-name.test.ts`;
  - `store-links.test.ts`;
  - `claims.test.ts`;
  - the Co-Create cases in `operator.test.ts`.
- **Other gates.** `npx biome lint .`, `npm run typecheck` and `npm run build` pass.
- **Scripts and screenshots.** The QA script is `qa.cjs` in the session scratchpad (`v4tools/`). Screenshots are in the session scratchpad under `site-shots-9nov/before/` and `site-shots-9nov/after/`: top and full page for each page and variant, plus `nav-menu-390-*.png`. They are not committed, to keep the repo small.

## Verified passed vs not tested

| Area | Status |
|---|---|
| Chromium at 390 (DSF 2, touch) and 1440, dark and light, 19 pages | **Verified passed**: 0 axe violations, 0 console errors, 0 overflow, CLS 0.000 on every run |
| Mobile menu (targets, lock, overlay, Escape, link closes) | **Verified passed** after fix `c8cac5b` |
| Hero orb: still under reduced motion, no layout shift | **Verified passed** (no code change was needed) |
| Every link < 400 | **Verified passed** for 64 of 66: all 48 internal links and 16 external ones. The 2 others are below. |
| OG/Twitter/canonical on every page | **Verified passed** (absolute `https://renor.app/...` when built with the production origin) |
| **Real iOS Safari (iPhone)** | **Not tested.** No device or Safari/WebKit run was available. Chromium's mobile emulation does not reproduce Safari's toolbar, safe areas, font rendering or scroll behaviour. |
| Android / Samsung Internet | **Not tested** |
| Screen readers (VoiceOver, TalkBack) | **Not tested.** axe covers ARIA structure only. |
| Slow network / offline | **Not tested** with throttling. The Co-Create walkthrough and QR load eagerly, so they are on the page once it has loaded. |
| The Vercel preview itself | **Not tested.** The preview is behind Vercel SSO; the same commit was tested locally. |

### Links that could not be verified

- `https://www.fiverr.com/abi_bim` returns 403 to scripts (Fiverr's bot protection). Not a site defect, but please open it once in a browser.
- `https://github.com/foundernexoralabs-debug/foundernexora-hub/issues/new` (Contact) answers 302 to GitHub sign-in. The sign-in page returns 403 to this session's proxy only. The repo is public and has issues enabled.

## Matrix, page by page

Severity key:
- **Critical:** wrong identity, or a dead purchase path.
- **High:** a misleading claim, or a broken interaction.
- **Medium:** an accessibility or mobile usability problem.
- **Low:** polish.

| # | Founder screenshot / page | Issue | Sev. | File / route | Fix | Test evidence | Status |
|---|---|---|---|---|---|---|---|
| 1 | All pages: founder name | Public name read "Ahmed". Atlas's final note: exactly **Ahmad**, first name only | Critical | `src/lib/business/founder.ts` → /company, /zero-to-proof, /cocreate, Organization JSON-LD, /llms.txt | `914ce3a` | `founder-name.test.ts`: no other spelling or surname in any text file under `src/` or `public/`; the JSON-LD and llms.txt say Ahmad | Fixed |
| 2 | All raster images: founder name | Checked whether any image has the name baked in | — | `public/**` | none needed | Visual check of every image with text (OG cards, launch kit, tour, proof): none contains the founder's name | Passed |
| 3 | Renor Labs / store (screenshot showed a Plug&Pay 404) | The bare `renorlabs.plugandpay.com` and both checkouts return 404 (rechecked 9 Nov). The site never links those; it links `/home` (200) and the Kit sales page (200). | Critical | `src/lib/business/plugins.ts`, `ecosystem.ts`, `plugin-store.tsx` | `8be6a72` | `store-links.test.ts`: every Plug&Pay URL rendered or written in `src/` must be a live store page or an active product's checkout. Crawl: `/home` 200, sales page 200 | Fixed (site side) |
| 4 | Plugin product page (Kit) | The sales page's own buy button points at the inactive checkout | High | `PurchasePanel` | `8be6a72` | A note under "See full details" says the sales page's checkout is not open yet | Mitigated; Plug&Pay needs founder action |
| 5 | Co-Create landing | Not a story; event date said 19 November only | High | `/cocreate`, `src/lib/business/cocreate.ts` | `b2cd818` | Story: who you are → problem → mission → execution and approval → verification and receipt → QR, contact or demo. "What works today" is kept apart from the roadmap. Date "19–20 November 2026" everywhere, including the share card. Tests in `operator.test.ts` | Fixed |
| 6 | Co-Create: offline demo | No fallback if the venue network fails | High | `/cocreate#cc-run` | `b2cd818`, `c8cac5b` | A static five-step walkthrough built from real crops of the 24 Oct Code AI capture: modes, build log, Undo/Publish bar, Renor Computer, model + Verified receipt. Labelled a demo, not a customer. Images and QR load eagerly. No recording exists, so there is no video. | Fixed |
| 7 | Co-Create: contact | CTA must work | Medium | `/cocreate` | `b2cd818` | "Ask Ahmad for a demo" and the email link are `mailto:` with the event in the subject; the crawl found no dead link | Fixed |
| 8 | Co-Create: step numbers | New step numbers had 3:1 contrast in light mode (found by this QA pass) | Medium | `operator.css` | `c8cac5b` | axe: 0 violations after the fix | Fixed |
| 9 | Pricing | "£0 for ever"; "Is anything unlimited?" implied unlimited local AI; local models not tied to the user's machine; test mode not stated | High | `src/lib/business/pricing.ts` → /renor/plans, home snapshot | `6b361f6` | New FAQ "Does Renor keep working when my computer is off?" (No). Lifetime is £99 one payment and not live (Stripe test mode); packs are one-time; hosted AI has a free weekly allowance and fallback. `claims.test.ts` | Fixed |
| 10 | Billing and refunds | Lifetime paragraph did not say local models need the computer on | Medium | `/renor/billing` | `6b361f6` | Copy updated; `billing-one-time.test.tsx` still passes | Fixed |
| 11 | Home: Own your AI | "Local models, free and private" did not say the machine must be on | Medium | `src/lib/business/operator.ts` | `6b361f6` | "it works while that computer is on" (`claims.test.ts`) | Fixed |
| 12 | Vision ledger | "Keeps working in the background" (in progress) could read as live | Medium | `src/lib/business/vision.ts` | `6b361f6` | Detail now ends "Not live: today nothing runs while your device is off" | Fixed |
| 13 | Pricing (paused monthly plans) | Max promised "background autonomous work" | Medium | `src/lib/business/plans.ts` | `6b361f6` | "and background work once it ships" | Fixed |
| 14 | /llms.txt | No limits section; no event date | Low | `src/lib/business/llms.ts` | `6b361f6` | New "Limits" section; Co-Create date | Fixed |
| 15 | Leftover "FounderLab" where Renor is meant | Renor Guide said "the FounderLab website"; 404, Explore, Contact title and Zero to Proof intro named FounderLab | Low | the files named in the commit | `6b361f6` | The remaining mentions are deliberate (the company: "Renor by FounderLab", publisher, copyright, legal): 3 to 7 per page | Fixed |
| 16 | Mobile menu | Close button was a 16×16 target; drawer links shrank to 40px | Medium | `src/components/ui/sheet.tsx`, `site-nav.tsx` | `c8cac5b` | Every drawer target is now at least 44×44; scroll lock, overlay, Escape and link-closes all pass | Fixed |
| 17 | Hero orb | Must respect reduced motion and not shift layout | Medium | `founder-orb.tsx`, `.op-hero-orb` | none needed | Reduced motion: frames identical, 0 running animations. Fixed 104×104 box at 390. CLS 0 | Passed |
| 18 | Sticky UI overlap | The floating Renor Guide orb sits over body text while scrolling at 390 | Low | `orb-launcher` | not changed (no redesign) | Overlap check found no link or button covered at the end of any page; the footer has room below the orb | Open (accepted) |
| 19 | Footer | Long at 390 (four columns stacked in two) | Low | `site-nav.tsx` footer | not changed | Readable, 44px rows, no overflow | Open (accepted) |
| 20 | Line wrapping | The Co-Create event pill wrapped mid-phrase at 390 | Low | `/cocreate` | `b2cd818` | Wraps as name over date, centred | Fixed |
| 21 | OG metadata | Every page has title, description, absolute image, canonical and `summary_large_image` | — | `src/lib/business/seo.ts` | none needed | Crawl, built with the production origin | Passed |
| 22 | `/renor` and `/launch-kit` | Still use the 24 Oct "Larkspur Cycles" demo captures and the "private beta" raster | Low | `/renor`, `/launch-kit` | not in scope | Listed under "Not done" in the PR | Open |

## Founder-only blockers

1. **Store activation (Plug&Pay).**
   - Both checkouts are inactive: `…/checkout/tradelaunch-electrician-business-kit` and `…/checkout/tradelaunch-90-day-local-growth-pack` return 404.
   - The bare shop domain returns 404.
   - The Kit's sales page (200) has a buy button that leads to the 404 checkout, and a logo link to the 404 bare domain.
   - The Pack's sales page is still a draft.
   - Until a checkout is active and a test purchase completes, the site shows "Opening soon" and Notify me only.
2. **Delivery.** File delivery after purchase is not confirmed, and refund terms for digital downloads are not published.
3. **Payments.** Lifetime and credit packs are in Stripe test mode, and the DB migration is not applied.
4. **Legal identity.** The site says "sole trader in the United Kingdom, trading as Renor (by FounderLab)". Confirm before investors read it.
5. **Contact email.** It is still `founder.nexoralabs@gmail.com`; a domain address would read better.
6. **Real-device test.** Open the preview on the iPhone in Safari before the event, and test the venue's Wi-Fi with the offline walkthrough.
