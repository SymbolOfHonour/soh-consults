# AdSense readiness audit — 18 October 2026

Initial baseline: main commit 09f4918. Integrated current production main at 8e521fd, preserving CMS #340, structured tables, divider alignment, expandable sections and editorial settings. Scope: public SEO, content depth and attribution, application-checklist duplication, advertising display, repository regression/security checks. This is not a guarantee of AdSense approval or a completed authenticated CMS/Search Console audit.

## Evidence

The owner's AdSense screen reports “Low value content”. It does not identify a particular URL or establish the cause. The live sitemap contains 98 URLs: 40 articles, 9 guides, 8 categories, 23 application checklists and 18 other pages. The read-only HTTP audit retrieved 57 pages with HTTP 200. The homepage and all 40 articles returned 403 from this environment. This does not establish that Googlebot or ordinary visitors receive those errors. The browser also displayed “Your request was blocked” on the homepage. No production security rules were changed to bypass this restriction.

The 57 retrieved pages have canonical URLs, descriptions and H1s and no detected noindex directives. Word counts in live-audit.csv include shared navigation and are not editorial quality scores. No minimum article length, age, traffic or article count is asserted as an approval requirement.

## Corrections

- The live sitemap advertises 23 derivative application-checklist URLs, including ten seed listings without an underlying full published notice. Checklists backed by published stories now canonicalize to the original /updates article. Seed checklists remain usable but are noindex,follow. Checklist URLs are omitted from the sitemap; their original articles remain included. No published content is deleted.
- Disabled/invalid editorial advertising slots previously rendered a 250px reserved-space box. They now render nothing. Valid enabled units retain existing behavior. The AdSense verification script and publisher ID are retained.
- Update articles now visibly identify S.O.H CONSULTS as publisher with an About link and include the existing organization as author in Article JSON-LD. No personal authorship or review date is invented.
- The first six JAMB guides were brief and overlapped in subject matter. Each now includes topic-specific practical checks/troubleshooting and official references. Existing URLs and core text remain. These changes improve usefulness but do not prove the cause of rejection.

Official references checked: https://jamb.gov.ng/caps and https://support.jamb.gov.ng/faqs. Google requirements checked: https://support.google.com/adsense/answer/9724 and https://support.google.com/adsense/answer/7299563.

## Public visitor corrections and verification

The structured CMS exposed three reproducible public regressions: reading time counted the encoded block marker as one word (1,000 words showed 1 minute instead of 5); search omitted table cells, FAQ entries and section titles; and application checklists discarded structured blocks. A shared readable-text extractor now supplies search and reading time. Checklists reuse the existing public article renderer so tables, FAQs and expandable sections retain their rendering. Expandable eligibility sections also feed the supplied checklist text. No requirements, fees or production CMS records are invented or changed.

Eleven real component/API regressions cover reading time, structured-text discovery, search reset and URL restoration, school preference persistence, WhatsApp draft context, OOU numeric validation, CGPA target planning, structured checklist rendering, navigation toggling, Ask S.O.H service answers and outage recovery. Database, rate-limiter and telemetry transports are isolated; these do not prove production provider availability, real mobile layout or field performance.

Current combined verification: 421 tests pass, TypeScript and optimized build pass, ESLint has zero errors and 18 existing warnings, and the production dependency audit reports zero vulnerabilities. Required GitHub `verify` must pass on the current head before merge. The release uses the existing main-branch Vercel integration; final merge/deployment evidence is recorded in PR #344.

## Initial audit verification

- All 404 tests pass after integration (370 before the CMS merge), including three new behavioral regressions for ad rendering, checklist canonical/noindex behavior and sitemap/error propagation.
- ESLint: zero errors; 18 existing warnings.
- Optimized Next.js build, including TypeScript, passes with isolated Preview fixtures, without production credentials.
- npm audit --omit=dev: zero reported production dependency vulnerabilities at audit time. This is not a penetration test.
- Local rendered HTTP checks verify guide references, seed noindex, published-checklist canonical targeting the original article, Preview crawl exclusion, and a deduplicated 75-URL fixture sitemap containing no application checklists. Fixture counts differ from the live publication list.
- Existing security and calculator tests pass; production databases and CMS records were not modified.

## Access limits and outstanding verification

GitHub repository access and the existing main-branch Vercel deployment integration are confirmed. Direct Vercel project access under symbol-of-honour returns 403, Not authorized, and no Vercel CLI is available. Deployment state can be checked through Vercel's GitHub integration; direct runtime-log inspection remains unavailable.

Published article bodies could not be read live; fixture content is not a substitute for an audit of the current CMS. Search Console access is not available in the current toolset: indexing, Google-selected canonical, crawl errors and traffic remain unverified. AdSense account settings, regional consent/CMP configuration, Auto ads settings and field Core Web Vitals remain unverified. No invented readiness percentage is provided.

After the required checks and merge, verify accessible production guides, checklists and sitemap against the merged code. Article/browser checks blocked in this environment must remain reported as unverified. Search Console canonical/indexing checks and an editorial review of current CMS articles remain separate follow-up work before another AdSense review request.
