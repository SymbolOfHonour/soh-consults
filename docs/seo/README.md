# Technical SEO recovery, 10 October 2026

## Baseline and scope

Production baseline commit: 5e34fc1eb740bb0460857ed06b4a8471bedf4d6d.
Read-only HTTP audit of the complete live sitemap: 74 canonical candidates (37 articles, 9 guides, 7 categories, 21 core/tool pages). All returned 200. See production-baseline/audit.csv for per-URL status, canonical, robots, title, description, H1, visible text count and incoming-link discovery.

Search Console was not directly available. The supplied baseline says 13 indexed, 44 discovered-not-indexed and 2 redirects on the primary domain; the secondary property has 4 indexed. Those counts have not been independently refreshed or combined. The exact 44 URLs cannot be identified from these aggregate counts. Every audit row labels its individual Search Console status unavailable. The ten explicitly named affected paths in the assignment are present in the audited inventory.

## Actual findings and implementation

| Finding | Evidence | Change | Verification |
| --- | --- | --- | --- |
| Deadlines missing canonical and unique metadata | Live HTML contains no canonical; root metadata inherited | Unique title, description, canonical and social metadata | Build/type/lint, followed by rendered HTML checks |
| About lacks H1 | Live HTML audit | About page H1, existing founder text retained | Build/type/lint and rendered HTML |
| Initial Updates grid is limited to 12 | UpdatesExplorer server render/state | Native details archive renders links to every published story, with category navigation | Two React server rendering tests, including older fixture records |
| Article sidebar categories use query filters | Article route source | Link directly to canonical category routes | Build and source diff; rendered HTML check |
| Category breadcrumb absent | Category source | Visible breadcrumb and BreadcrumbList | Build and rendered JSON-LD check |
| CGPA subpages lack incoming links in audited HTML | Planner and select-scale audit rows | Links on Tools page; calculators unchanged | Build and rendered links |
| Article sharing metadata omits date fields | Article metadata source | Existing publication/modification dates exposed as article OG dates | Build and rendered metadata |
| Sitemap duplicate resilience/date fallback | Sitemap source | Keep URLs on official domain even in Preview; deduplicate URLs; use stored publication/creation date only if modification date invalid | Build and XML validation |

All articles already had at least one incoming link in the audited sitemap-page HTML. This is a discovery improvement, not evidence that all 44 pages were orphaned. No evidence of general crawl blocking or site-wide rendering failure was found. Text counts include common navigation and are not content-quality scores.

## Existing controls verified

- robots.txt permits general crawlers; admin and API excluded. Cloudflare adds training/agent crawler rules, but Googlebot is not blocked.
- Live default Vercel hostname /guides redirects permanently (308) to the custom domain.
- Live www /guides redirects permanently (308) to the non-www custom domain.
- Production sitemap XML parses and contains custom-domain URLs only.
- Sitemap is dynamic and requests published records strictly, so database failures cannot silently emit an empty publication list.
- Production canonicals remain locked to the official domain. Preview uses its own deployment URL and is blocked by robots and X-Robots-Tag.
- No redirect changes needed; neither Search Console property should be deleted.

## Search Console follow-up after approved production release

1. Inspect /deadlines, /updates, /guides, /opportunities and the highest-value current article. Confirm Google-selected/user canonical and rendered content.
2. Request indexing once for these priority pages after the approved changes are live. Do not submit every unchanged URL repeatedly.
3. Keep https://sohconsults.com.ng/sitemap.xml submitted in the primary domain property. Resubmit if its existing submission reports a fetch failure or needs refreshing after release; daily resubmission is unnecessary.
4. Export the 44 discovered URLs from Search Console and join their exact URLs to audit.csv. Reinspect outliers separately; this report does not guess their identities.
5. Review weekly over the next several weeks: sitemap fetch date/status, discovered vs crawled counts, indexed pages and canonical choices. The supplied report was last updated 4 October, so it may lag live changes.
6. “Discovered - currently not indexed” is not itself a confirmed technical error. Do not use Validate Fix for ordinary crawl-selection delays. Redirect pages are normally excluded; inspect their destinations instead.

Google chooses when to crawl and which pages to index. No indexing guarantee or claim that this explains all 44 exclusions is made. No published content was rewritten, databases accessed directly, AdSense changed, calculators modified or Ask S.O.H branch/PR touched. Production remains unchanged by this branch.

## Completed verification

- TypeScript: passed. ESLint: 0 errors, 17 existing warnings; changed TSX files: 0 errors, one existing unused-variable warning.
- 294 existing tests and 2 new server-rendered archive tests passed.
- Optimized Next.js production build passed with Preview environment and isolated published-content fixture.
- Local production server: homepage, deadlines, About, Updates, Tools, JAMB category, guide and opportunities HTTP 200 with canonicals; robots blocks Preview; sitemap has 74 unique URLs. Nonexistent article, guide and category return actual 404.
- Protected Preview: https://soh-consults-7flx4gdpz-symbol-of-honour.vercel.app. Verified HTTP 200 on representative changed and retained routes, 404 on unknown article, 74 sitemap URLs, crawl-blocking robots and noindex HTTP headers. Custom-domain production canonical remains enforced by existing getSiteUrl production branch.
- Browser: Preview loads, archive expands to all 37 published articles, canonical JAMB category link opens the category with breadcrumbs and seven matching updates. Production JAMB CAPS search returns five results and updates the shareable URL. WhatsApp links retain the business number and contextual messages; no messages sent.
- Mobile: responsive wrapping, single-column archive below sm breakpoint and touch-sized links inspected in source; actual mobile viewport/device interaction is not verified because the available browser API does not expose viewport emulation. No mobile performance score or Core Web Vitals improvement is claimed.
- Direct Search Console inspection/export remains unavailable. Per-URL Google indexing state cannot be inferred from HTTP health.
- Recommendation: ready for owner review of the private Preview; complete mobile review before production approval. Production, production database, Ask S.O.H PR #324 and calculators remain unchanged.
