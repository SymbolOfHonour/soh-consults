# Security and 1,000-concurrent-request readiness

Status: **not certified**. Do not run high-load tests against production.

## Scope
- Public cached page reads and public data endpoints.
- Search and calculator journeys.
- Ask S.O.H retrieval and generation separately.
- Admin publishing and upload authorization.

## Required engineering checks
1. Inventory actual API routes and identify dynamic rendering and Supabase queries.
2. Audit authentication, authorization, RLS, upload validation and request limits.
3. Cache only public, non-user-specific GET responses with correct invalidation on publish/unpublish.
4. Apply distributed per-client rate limits, bounded work, timeouts and provider-specific AI concurrency caps; never rely on process-local counters in serverless.
5. Avoid exposing keys or private knowledge in public responses. Verify CSP in deployed responses and SPF/DKIM/DMARC via DNS.
6. Observe error rate, p50/p95/p99, cold starts, database saturation and AI provider 429s.

## Acceptance criteria
- Stage environment with production-like configuration, isolated data and no real AI billing during synthetic traffic.
- Warm-up and test 50, 100, 250, 500, then 1,000 concurrent in-flight requests, including sustained periods and spike tests.
- At least 99% successful responses excluding intentionally rate-limited abuse traffic.
- Set p95 budgets separately for static pages, cached public APIs, uncached APIs and AI responses.
- No cross-user data leakage, unauthorized writes, or lost CMS updates.
- Test after every optimization; release only after checks pass, with rollback plan.

## Important
1,000 simultaneous page requests does not imply 1,000 concurrent AI generations. AI traffic needs its own quota and admission control. This document is a work plan, not proof of capacity.
