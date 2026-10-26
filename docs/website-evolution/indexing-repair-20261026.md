# Search Console drilldown review — 26 October 2026

The owner export lists 79 URLs, with chart data through 23 October. All 79 map to existing route files at the reviewed main commit. Classification: 12 imported placeholder articles, 7 derivative article checklists, 9 seed checklists, 21 other articles, 9 guides, 8 categories and 13 tools/utilities. The 51 other URLs are candidates for indexing review, not 51 demonstrated broken pages. Existing source canonicals and indexing exclusions were checked; Google-selected canonicals and current crawl outcomes remain unverified.

## Demonstrated failure and narrow repair

The public database reader deliberately returns an empty list on upstream failure unless strict mode is requested. Article slug lookup, numeric legacy article resolution, category metadata/rendering and application resolution used that empty fallback. An existing page could therefore take its not-found branch during a temporary database outage. Strict reads now propagate the failure, leaving a retryable server error instead of asserting that the page does not exist. Truly missing pages still return not found after a successful database read. Other listing fallbacks stay compatible.

This behavior was reproduced by injected 503 responses and tested after repair. It is a confirmed code defect, not proof that an outage caused the exported Google backlog. No layout, settings, content, calculations, permissions or production records are changed. No additional noindex, redirect, robots block, sitemap expansion or forced indexing is introduced.

## Remaining external evidence

The export does not include URL Inspection, live test results, Google-selected canonicals or current crawler responses. The reported 1970 dates are not usable crawl timestamps. No claim is made that the 79 URLs are now indexed or that every eligible page will be indexed. Existing cloud browser access and hosting-account scope limitations remain applicable. Submit/request checks require an authenticated Search Console session; no request was fabricated.
