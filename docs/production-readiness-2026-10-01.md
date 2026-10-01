# Production readiness audit, 1 October 2026

Baseline: main `a5d233d73e018ebc884737abbe5c45ba41c5e55b`.
Branch: `qa/production-readiness`. This records branch verification; it is not a claim of completed production deployment or Google approval.

## Confirmed issues addressed

- The enforced public Content Security Policy blocked the installed AdSense loader, requests and frames. Public HTML now uses per-request nonces and Google's supported strict CSP. Framework scripts, AdSense and JSON-LD receive the nonce. Admin pages omit the ad loader, retain the private policy and return noindex/private cache headers. API origin/authentication guards remain intact.
- Website Builder fetched private draft configuration before authenticating on the server. It now checks the existing admin session before reading configuration. All admin pages receive noindex metadata.
- Editing an older story moved it above newer publications on the homepage. Public records now expose publication time; homepage sorting/display and article dates use publication time. Initial published update links are server-rendered, then refreshed by the existing client API.
- Builder SEO controls did not affect public homepage metadata. Published custom SEO settings now drive the homepage title, description and share cards. Legacy default values retain the established metadata.
- Several public tools lacked canonical/share metadata, and share URLs on other pages inherited the homepage URL. Public metadata follows each page's canonical. Search results are noindex/follow; public informational pages remain indexable.
- The sitemap omitted 11 useful public tools and planner pages. A database outage previously appeared as a successful but incomplete sitemap. Strict sitemap reads now fail so crawlers can retry. Only published stories are included.
- Published article pages now emit Article and BreadcrumbList JSON-LD from actual CMS fields. Organization/WebSite schema remains; existing calculator schema is preserved and nonce-enabled. JSON-LD safely escapes '<'. No invented authors, dates or credentials.
- The homepage hero, logo and founder picture downloaded oversized original files. Those local assets now use Next Image with dimensions/sizes; the hero receives high fetch priority. Existing crops and layout remain.
- An unlayered anchor reset overrode Tailwind text colors/underlines, producing low-contrast calls to action. Moving the reset into the base layer lets existing utility styles work.

## Advertising architecture

Existing editorial ad blocks remain the source of truth. Placement requires at least 300 words, two paragraphs before each ad, subsequent article text, and no more than two units. Units reserve 250px vertical space and load near the viewport. A published Website Builder switch controls activation and defaults to off. Actual numeric AdSense slot IDs are required for active units; placeholder names remain reserved space. Private CMS pages contain no AdSense loader.

No Google account settings were altered. No ads were clicked. Local tests stub the Google loader and do not request ads or generate impressions. The privacy page now explains the existing Google advertising integration and links to Google's advertising/privacy controls.

## Verification completed before Preview

- Production build and TypeScript: passed.
- All changed TypeScript files: ESLint passed.
- Regression tests: 32 passed, including 3 new behavioral tests for ad placement, canonical social metadata and sitemap outage handling.
- Production read-only crawl: 73 URLs, including all 57 baseline sitemap URLs. All expected public pages returned successfully; the deliberately nonexistent page returned 404.
- Local production build against an isolated REST/storage mock: 26 public routes on a 390px phone and 1440px desktop; no unexpected desktop overflow. Article checks at 320/390/430/768px preserve width=980, user zoom, 75/25 article/sidebar, a physical 64px bottom nav and 44px Ask button.
- Headline/sidebar/Updates navigation, homepage four shortcuts, WhatsApp href and CTA color: passed.
- Ask S.O.H topic responses and guide navigation: passed.
- CGPA target planning for semester, session and future periods: passed. Future plan retained 30 courses and 73 units with weighted suggested credit points meeting the required GPA. PDF export returned a valid PDF.
- OOU aggregate UI: UTME 250 and Post-UTME 65 returned 63.50/100 using the existing 60/40 formula.
- Isolated CMS: password/TOTP session, unauthenticated guards, CSRF rejection, draft hiding, create/edit/publish, newest-first discovery, uppercase category normalization, sitemap/server links, image upload API, gallery arrows/touch swipes, Builder reorder/save/publish, published SEO, default-disabled ads and explicit activation, archive/republish, Trash/restore, protected permanent deletion: passed. Deletion occurred only in disposable local mock data.
- No hydration or uncaught browser exceptions in the local suite.

## Performance baseline and tradeoffs

Google PageSpeed Insights homepage lab report, 1 October 2026:

| Mode | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Mobile | 69 | 96 | 92 | 100 | 0.9s | 14.6s | 20ms | 0.072 |
| Desktop | 86 | 96 | 92 | 100 | 0.4s | 2.5s | 0ms | 0.025 |

Baseline report: https://pagespeed.web.dev/analysis/https-sohconsults-com-ng/aqn4kpq62y?form_factor=mobile
Image delivery audit identified about 2.45MiB of potential savings, led by the 2.06MiB hero image. Post-deployment measurements are still required; lab data is not a guarantee of visitor performance.

CrUX reports no field data. Real-user INP and Core Web Vitals cannot be certified from these tests. The nonce policy requires request-time HTML rendering, so previously static informational pages become dynamic. Static assets retain caching, published story reads retain their existing 300s data revalidation, and public APIs retain their existing cache rules. This CSP follows Google's supported policy, including unsafe-eval; its public restrictions differ from the previous policy. Keep monitoring response time and CSP reports after deployment.

## Account-dependent and outstanding checks

Preview interaction, passing remote CI, merge and resulting production regression are pending when this branch report is created.

The production admin session is not signed in in the available browser. Actual tenant authentication/storage/permissions have not been certified by the mock tests. Production content has not been created, deleted or published for QA.

Published CMS version 3 currently orders Hero → Start Here → Screening Tool → Latest Updates → remaining sections. This differs from the brief's stated Hero → Latest Updates → Start Here. Builder reorder/save/publish works in the isolated suite. Do not hardcode a different public order or overwrite production draft settings merely to make the brief appear satisfied; use authenticated CMS controls to reconcile it.

Cloudflare Full (Strict), Always Use HTTPS, AdSense review/approval, Google consent/account settings, Search Console indexing and real-user CWV require account-level verification. The website serves HTTPS with HSTS and the existing Vercel-domain redirect. No Cloudflare optimizations, Google review actions, database schema or production records were changed.
