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

- Category chips ending in punctuation generated trailing-hyphen URLs that returned 404. Category links, sitemap and route matching now share one slug helper; malformed case/punctuation variants redirect to the canonical category.
- Business email links use Cloudflare's documented per-address HTML comment opt-out. This prevents its email decoder from being injected without the nonce required by the public CSP; account-level Cloudflare settings remain unchanged.

## Advertising architecture

Existing editorial ad blocks remain the source of truth. Placement requires at least 300 words, two paragraphs before each ad, subsequent article text, and no more than two units. Units reserve 250px vertical space and load near the viewport. A published Website Builder switch controls activation and defaults to off. Actual numeric AdSense slot IDs are required for active units; placeholder names remain reserved space. Private CMS pages contain no AdSense loader.

No Google account settings were altered. No ads were clicked. Local tests stub the Google loader and do not request ads or generate impressions. The privacy page now explains the existing Google advertising integration and links to Google's advertising/privacy controls.

## Verification completed before Preview

- Production build and TypeScript: passed.
- All changed TypeScript files: ESLint passed.
- Regression tests: 33 passed, including 4 new behavioral tests for ad placement, canonical social metadata and sitemap outage handling.
- Production read-only crawl: 73 URLs, including all 57 baseline sitemap URLs. All expected sitemap/public pages returned successfully; the deliberately nonexistent page returned 404. A deeper check of 21 additional internal links found two malformed category-chip URLs, fixed on this branch; the remaining non-page endpoint was Cloudflare email protection. All 26 unique image URLs returned successfully. Fourteen unique external endpoints were sampled from 294 mostly repeated share/contact links: 11 responded successfully; X returned 403 and WhatsApp destinations timed out in this HTTP checker. Their final interactive availability remains unverified, not confirmed broken.
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

PR #206 was opened as a draft. The initial commit passed GitHub CI and Vercel Preview build. The category-link follow-up requires its own passing CI/build. Interactive Preview testing is blocked by Vercel authentication in the available browser; no merge or production deployment has been performed. Post-deployment regression and fresh PageSpeed measurements remain pending.

The production admin session is not signed in in the available browser. Actual tenant authentication/storage/permissions have not been certified by the mock tests. Production content has not been created, deleted or published for QA.

Published CMS version 3 currently orders Hero → Start Here → Screening Tool → Latest Updates → remaining sections. This differs from the brief's stated Hero → Latest Updates → Start Here. Builder reorder/save/publish works in the isolated suite. Do not hardcode a different public order or overwrite production draft settings merely to make the brief appear satisfied; use authenticated CMS controls to reconcile it.

Cloudflare Full (Strict), Always Use HTTPS, AdSense review/approval, Google consent/account settings, Search Console indexing and real-user CWV require account-level verification. The website serves HTTPS with HSTS and the existing Vercel-domain redirect. No Cloudflare optimizations, Google review actions, database schema or production records were changed.


## Independent continuation verification

Repository state was re-established from GitHub rather than the previous Work session. PR #206 is the active draft for `qa/production-readiness`, based on main `a5d233d`; the starting head was `eb1cb49`. The older Phase 2 PR #167 is a different, conflicted branch and was not modified. The two existing readiness commits and their fixes were preserved. GitHub Actions run 36797878135 verified the starting head successfully, while its Vercel status failed with `api-deployments-free-per-day`.

The advertised npm test command omitted every `.test.mjs` CMS contract. Running all checked-in executable tests exposed three obsolete assertions expecting `getSiteSettings`, even though public rendering correctly calls `getPublishedSiteSettings`. The assertions now require the published accessor; npm test and CI include both CJS and MJS suites. The `BusinessContactSync.test.tsx` file exports constants only and contains no runnable tests.

Repository-wide lint exposed 62 errors that the previous CI's selected-file lint omitted. JSX apostrophes are now escaped without changing displayed copy; diagnostics uses the actual queue return type; LASUED's small subject deduplication runs directly rather than through an unstable memo dependency. No calculator formula, programme requirement or approved layout changed. CI now runs repository-wide lint. Twelve pre-existing warnings remain, chiefly hook dependencies and unused variables; they are not suppressed.

Interactive Preview checks also exposed duplicated brand suffixes on calculator titles. The shared metadata helper now preserves an already branded title as absolute and reads absolute/default title objects for social metadata. A behavioral regression covers both cases.

Fresh checks of the continuation changes:

- 61 automated tests passed, no skipped or failed tests.
- Production build and TypeScript passed.
- Repository-wide ESLint passed with zero errors and 12 warnings; whitespace check passed.
- Production dependency audit passed the CI high/critical threshold; one low-severity DOMPurify advisory remains.
- A local production server with a disposable HTTP database fixture crawled 62 public pages (49 sitemap destinations plus discovered links), and fetched 76 linked local assets successfully. Eighteen legacy articles were seeded only into the disposable fixture. Article number and malformed category redirects returned 308; every public script received its CSP nonce; branded page titles had one suffix; homepage server HTML linked its newest story; protected Builder access redirected to login with noindex. The deliberately missing URL returned 404. There were no unexpected route or local-resource failures.
- The existing Vercel Preview is now publicly accessible in this browser. Twenty-six public navigation/tool/guide/legal destinations opened without an application-error page. This supersedes the earlier authentication-block observation, but does not certify the latest branch head: Vercel's successful deployment predates the category-link follow-up.
- That older Preview's homepage has no news cards and `/updates` reports zero updates. Two article links from Opportunities show 404. The published database/configuration path is therefore not verified on Preview; a missing or unavailable Preview database is a possible cause, not a confirmed diagnosis. No credentials, Preview environment settings or production records were changed.
- Cloud Browser rejected navigation to Preview sitemap XML with `ERR_BLOCKED_BY_CLIENT`; terminal access to the Preview host timed out. Local sitemap validation succeeded; remote sitemap validation remains blocked. External destination availability is not certified by the local resource crawl.

The PR must remain draft until a Vercel deployment of the latest QA head succeeds and its published-content routes can be verified with an appropriate Preview data source. Deployment quota/account configuration are external blockers, not reasons to merge. Production/main, production CMS ordering and all production records remain untouched. Historical browser stress/CMS/performance claims above are previous repository evidence, not results independently repeated in this continuation.
