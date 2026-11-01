# Get renor.app into Google and Bing

**Goal:** a search for **Renor**, **Renor AI** or **Renor by FounderLab** finds renor.app first,
above products with similar names.

**What the website already does (no action needed):**
- It allows search engines in, and it publishes a sitemap at https://renor.app/sitemap.xml.
  Indexing was switched on for production on 31 October 2026.
- Every Renor page tells search engines who Renor is, in structured data (schema.org JSON-LD):
  - **Renor** (also "Renor AI" and "Renor by FounderLab") is a web application, an AI workspace,
    at the app's address;
  - **FounderLab** makes and publishes it;
  - FounderLab's official profiles are YouTube, TikTok, the links page, the Renor Labs shop and
    GitHub.

  The structured data is built in `src/lib/business/search-identity.ts`.
- Titles, descriptions and headings on `/`, `/renor` and `/renor/capabilities` name Renor AI and
  say what it does.

**What only you can do:** prove to Google and Bing that you own renor.app, then ask them to read
the site. This takes about 15 minutes and needs no code change.

---

## 1. Google Search Console (about 10 minutes)

### Recommended: verify with a DNS record

This method needs no deploy, covers every address under renor.app (including app.renor.app), and
renor.app's DNS is already on Vercel.

1. Open https://search.google.com/search-console. Sign in with the Google account that should own
   the site; the company account is best.
2. Open the property menu (top left) and choose **Add property**.
3. In the left box, **Domain**, type `renor.app` and press **Continue**.
4. Google shows a TXT record that starts with `google-site-verification=`. Press **Copy**.
   Keep this tab open.
5. In a new tab, open https://vercel.com and go to your team's **Domains** tab. Choose
   **renor.app**.
6. Under **DNS Records**, add a record:
   - **Name:** `@` (this means renor.app itself; if the form will not take `@`, leave Name empty)
   - **Type:** `TXT`
   - **Value:** paste the whole `google-site-verification=…` value
   - **TTL:** leave the default
   - **Comment** (optional): `Google Search Console`

   Save it.

   From a terminal, the same thing is:
   `vercel dns add renor.app '@' TXT "google-site-verification=…"`
7. Back in Search Console, press **Verify**. Vercel DNS is usually ready within a minute or two.
   If Google says it cannot find the record, wait 10 minutes and press **Verify** again.

   Leave the TXT record in place after verifying: removing it removes your access.

### Alternative: verify with a meta tag

Use this only if you cannot add the DNS record. It needs this website change to be merged first.

1. In Search Console, choose **Add property**, then the right box, **URL prefix**. Type
   `https://renor.app/` and press **Continue**.
2. Open **HTML tag** and copy the tag shown. You can paste the whole `<meta …>` tag or just the
   value inside `content="…"`: the site accepts either.
3. In Vercel, open the **foundernexora-hub** project, then **Settings → Environment Variables**.
   Add `GOOGLE_SITE_VERIFICATION` with the copied value, for **Production** only. Save it.
4. Open **Deployments**, find the current production deployment, and choose **Redeploy**.
   Environment changes only reach a new deployment.
5. When the deployment is ready, go back to Search Console and press **Verify**.

### After verifying: send Google the pages

1. **Submit the sitemap.**
   - In the left menu, open **Indexing → Sitemaps**.
   - Under **Add a new sitemap**, enter `https://renor.app/sitemap.xml` and press **Submit**.
   - The status should read **Success** within a few minutes.
2. **Request indexing for the four key pages.** Paste each address into the **Inspect any URL**
   bar at the top, press Enter, wait for the check, then press **Request indexing**:
   - `https://renor.app/`
   - `https://renor.app/renor`
   - `https://renor.app/renor/plans`
   - `https://renor.app/renor/capabilities`

   Each request takes about a minute. Google allows a limited number of requests a day, and four
   fits easily.

### What you may see in Search Console, and why it is fine

- **"Software apps" saying a rating or review is missing** (for example "Either aggregateRating
  or review should be specified"). Google only shows star-rating results for apps that have
  ratings or reviews. Renor has none yet, and the site
  will not invent them. This does not affect indexing or ranking for the name Renor.
- **"Discovered – currently not indexed"** for a few days is normal for a new site. Google crawls
  in its own time. The sitemap and the indexing requests above speed it up.

---

## 2. Bing Webmaster Tools (about 5 minutes)

Bing's index also feeds DuckDuckGo, Yahoo and Microsoft Copilot.

### Recommended: import from Google Search Console

1. Finish section 1 first: Google must already show renor.app as verified.
2. Open https://www.bing.com/webmasters and sign in. You can sign in with the same Google account.
3. Choose **Import** under **Import your sites from Google Search Console**. Allow access, tick
   renor.app and press **Import**.

Bing verifies the site and copies the sitemap in one step.

### Alternative: add the site by hand

1. Choose **Add your site manually** and enter `https://renor.app/`.
2. Pick a verification method:
   - **DNS:** Bing gives a CNAME record (a name and the value `verify.bing.com`). Add it in Vercel
     the same way as the Google TXT record, with **Type:** `CNAME` and the name Bing shows.
   - **HTML meta tag:** set `BING_SITE_VERIFICATION` in Vercel (Production) to the tag or its
     `content` value, redeploy, then verify.
3. Open **Sitemaps** and submit `https://renor.app/sitemap.xml`.

### Then send Bing the pages

Open **URL Submission** and submit the same four addresses as for Google.

---

## 3. Optional, high value: point your profiles back at renor.app

Search engines trust a name more when the official profiles and the site point at each other.
The site already lists these profiles. Make each one link back to `https://renor.app`:

- **YouTube** (Zero to Proof): in YouTube Studio, open **Customisation → Basic info → Links** and
  add `Renor` → `https://renor.app`.
- **TikTok:** in the profile **Website** field, add `https://renor.app`. TikTok only offers this
  field on some accounts.
- **Links page** (zero-to-proof-links.vercel.app): make sure the first link is
  `https://renor.app`.
- **GitHub:** on the profile, choose **Edit profile**, then set **Website** to
  `https://renor.app`.
- **Renor Labs shop:** add `https://renor.app` to the shop footer or "About" text.

Use the name the same way everywhere: **Renor** or **Renor AI**, "by FounderLab".

## What to expect

- **First pages in Google's index:** usually within days of the indexing requests.
- **Ranking first for "Renor":** usually follows within a few weeks, once the site is indexed and
  the profiles point at it. No one can promise a position, and nothing here pays for one.
- **Checking progress:** open **Performance** in Search Console and filter **Queries** for
  `renor`.
