# AdSense readiness audit — 18 October 2026

Initial baseline: main commit 09f4918. Integrated the concurrent CMS #340 merge at 7dc8a41, preserving editorial SEO fields, featured-image settings and structured tables. Scope: public SEO, content depth and attribution, application-checklist duplication, advertising display, repository regression/security checks. This is not a guarantee of AdSense approval or a completed authenticated CMS/Search Console audit.

## Evidence

The owner's AdSense screen reports “Low value content”. It does not identify a particular URL or establish the cause. The live sitemap contains 98 URLs: 40 articles, 9 guides, 8 categories, 23 application checklists and 18 other pages. The read-only HTTP audit retrieved 57 pages with HTTP 200. The homepage and all 40 articles returned 403 from this environment. This does not establish that Googlebot or ordinary visitors receive those errors. The browser also displayed “Your request was blocked” on the homepage. No production security rules were changed to bypass this restriction.

The 57 retrieved pages have canonical URLs, descriptions and H1s and no detected noindex directives. Word counts in live-audit.csv include shared navigation and are not editorial quality scores. No minimum article length, age, traffic or article count is asserted as an approval requirement.

## Corrections

- The live sitemap advertises 23 derivative application-checklist URLs, including ten seed listings without an underlying full published notice. Checklists backed by published stories now canonicalize to the original /updates article. Seed checklists remain usable but are noindex,follow. Checklist URLs are omitted from the sitemap; their original articles remain included. No published content is deleted.
- Disabled/invalid editorial advertising slots previously rendered a 250px reserved-space box. They now render nothing. Valid enabled units retain existing behavior. The AdSense verification script and publisher ID are retained.
- Update articles now visibly identify S.O.H CONSULTS as publisher with an About link and include the existing organization as author in Article JSON-LD. No personal authorship or review date is invented.
- The first six JAMB guides were brief and overlapped in subject matter. Each now includes topic-specific practical checks/troubleshooting and official references. Existing URLs and core text remain. These changes improve usefulness but do not prove the cause of rejection.

Official references checked: https://jamb.gov.ng/caps and https://support.jamb.gov.ng/faqs. Google requirements checked: https://support.google.com/adsense/answer/9724 and https://support.google.com/adsense/answer/7299563.

## Verification

- All 404 tests pass after integration (370 before the CMS merge), including three new behavioral regressions for ad rendering, checklist canonical/noindex behavior and sitemap/error propagation.
- ESLint: zero errors; 18 existing warnings.
- Optimized Next.js build, including TypeScript, passes with isolated Preview fixtures, without production credentials.
- npm audit --omit=dev: zero reported production dependency vulnerabilities at audit time. This is not a penetration test.
- Local rendered HTTP checks verify guide references, seed noindex, published-checklist canonical targeting the original article, Preview crawl exclusion, and a deduplicated 75-URL fixture sitemap containing no application checklists. Fixture counts differ from the live publication list.
- Existing security and calculator tests pass; production databases and CMS records were not modified.

## Outstanding verification and deployment blockers

GitHub repository access is confirmed with admin permission. Vercel's connected account returns no teams/projects in its default scope; an explicit request for soh-consults under symbol-of-honour returns 403, Not authorized. No Vercel CLI is available. Deployment and live verification therefore cannot be completed with current deployment access.

Published article bodies could not be read live; fixture content is not a substitute for an audit of the current CMS. Search Console access is not available in the current toolset: indexing, Google-selected canonical, crawl errors and traffic remain unverified. AdSense account settings, regional consent/CMP configuration, Auto ads settings and field Core Web Vitals remain unverified. No invented readiness percentage is provided.

After deployment access is restored: deploy the reviewed corrections, verify representative production articles/checklists/guides and sitemap, inspect affected URLs in Search Console, review the current CMS articles for originality and usefulness, then request an AdSense review only after the outstanding issues are assessed. Do not repeatedly resubmit unchanged pages.
