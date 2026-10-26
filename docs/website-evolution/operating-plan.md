# S.O.H CONSULTS website operating plan — 26 October 2026

## Preservation and release scope

Keep the approved brand, logo, tagline, student image, Latest Updates position,
1120px viewport, pinch zoom, top display gear and saved appearance preferences.
Keep published CMS configuration and all articles, media, writer permissions,
calculator formulas, survey questions, consent and email receipts. No CMS data,
environment variables, paid plans or database schema changes are part of these
releases. Ask S.O.H answer reliability remains a separate assignment.

PR #374 repairs configuration-read cost, writes during public content reads,
historical breaking-ticker entries and dark-mode contrast. PR #375 integrates
the survey with the existing site layout. The next batch adds source-backed
school discovery, service details/enquiries and useful monthly event reporting.

## Publishing routine and content strategy

Use existing editor drafts, preview, publishing checklist, source fields,
featured image, tables, expandable sections, TOC and revisions. Existing tests
exercise saving/reopening and authorisation. Extend its templates, rather than
adding another editor: institution profiles, recruitment opportunities and
procedures join admission updates, scholarships, fees and guides.

For every announcement, identify institution, programme, route, academic session,
source publication date and deadline. Link the relevant official notice and
record when it was checked. Never refresh an old deadline by changing its
publication date. Update the original canonical article when correcting it.

- Admission guide: explain who it applies to, documents, steps, official fees,
  exceptions and next action. Link to related calculator and school listing.
- Institution profile: official name/category/state and checked official links;
  separate institution metadata from programme-specific requirements.
- Application announcement: current session, route, eligibility, deadline and
  official application link. Mark missing details explicitly.
- Scholarship: sponsor, eligibility, coverage, genuine application route,
  deadline and official source. Avoid unsupported guarantees.
- Recruitment: employer, role/location, paid/unpaid status, eligibility,
  application process and official notice. Do not invent pay.
- Educational procedure: who should use it, prerequisites, official charges,
  steps, common errors and official support.

Do not mass-publish generated pages. School profile pages remain `noindex,
follow` until they have sufficiently useful, separately verified editorial
content; query/pagination variants canonicalise to the main directory and are
not indexed. The main school directory and service pages belong in the sitemap.
Unknown institution web domains and admission portals are omitted rather than
inferred. The verified institution-link map checks both upstream ID and name.

## Directory upkeep

Run `python scripts/capture-school-directory.py` offline. It captures the live
IBASS category list and every institution page in all advertised listing types.
Requests are sequential with a two-second interval and cached for resumption.
HTTP failures, rate limits, changing totals, duplicate IDs and incomplete
pagination stop the run; no partial snapshot replaces the published dataset.
Review the resulting data and capture manifest before a release. Cache files
are working evidence; checked data and the per-page request/count/hash manifest
are tracked in git. Refresh monthly or when an institution change is reported.

IBASS records are source listings, including affiliated/specialist entries.
Completing all advertised pages does not prove every Nigerian institution is
listed, current accreditation or course eligibility. Display missing metadata
as unavailable, and send candidates to current official guidance.

## Enquiries and business measurement

Services use the existing official WhatsApp number and message-draft workflow.
A visitor chooses a specific service, reviews what to prepare and requests a
quote. Confirm availability, scope, assistance charge, separate official fees,
required documents and turnaround before accepting work. No prices, response
SLAs or admission guarantees have been invented. Do not request credentials in
an initial enquiry.

`/admin/insights` is the monthly reporting entry point. It is owner protected;
the CSV endpoint checks owner authorisation before reading data. Pick a month
in Lagos time, review event totals/top paths and download the CSV. Report reads
select only measured analytics rows and small fields for that calendar month,
with pagination and an explicit 10,000-row cap. A failed read is unavailable,
not zero. Historical events lacking a path are labelled as such.

Measured events: article views, calculator actions, WhatsApp clicks, service
views and coarse source observations. These are not unique users, completed
calculations, sent WhatsApp messages, purchases or conversion rates. Source
observations use referrer groups and a session timestamp; no full referrer,
search text, email address or persistent user identifier is stored in events.
Hosting providers may separately process technical logs. API rate limits,
bot filtering and same-origin checks remain in place. Preview environments do
not emit production analytics.

At month end:
1. Export first-party events and compare article/tool/service use with the prior
   complete month. Check known tracking changes before interpreting growth.
2. In Google Search Console, export clicks, impressions, CTR, position, landing
   pages and coverage. Keep this separate from coarse source-event counts.
3. Reconcile actual WhatsApp conversations with existing private enquiry records;
   record completed work there. Calculate customer conversion only from a
   verified enquiry denominator and matched customers.
4. Choose the next month's work from useful search queries, source changes and
   customer needs, not page-count quotas.

GSC access is not available in this session, so no current GSC baseline or
organic-growth result is claimed. Establish one complete calendar month before
setting numeric traffic growth targets. Operational acceptance targets now:
zero private URLs in sitemap, zero unverified price/admission promises,
complete source-page accounting for each directory refresh, no release test
failures, and no loss of existing content/settings.

## Health, security, backup and cost checks

Existing RLS and server-only access are preserved. Existing one-minute publishing
scheduler is active; do not create a second scheduler. Daily content snapshots
exist in the same database; this is not proof of an independent full-database
backup. Keep an owner-accessible external backup and perform a restore drill
against an isolated QA database before claiming disaster recovery readiness.
Do not test restoration against production.

Use existing backup/revision controls and full regression suite for publishing
changes. Monitor failed scheduler runs and mail history. SMTP acceptance is not
inbox delivery. Go54 Sent-folder archiving and bounce/delivery verification
remain unproven without mailbox/log access; do not send unsolicited test mail.

Vercel runtime metrics, billing/limits and protected preview access are blocked
by the connected account's project/team scope. Do not weaken deployment
protection, upgrade plans or claim live speed/Core Web Vitals scores without
measurements. Production dependency audit, type checks, lint, regression tests
and build are available through GitHub CI. The root production domain rejected
the cloud browser in the prior audit; a successful deploy status is not a live
browser smoke test. Do not repeatedly bypass that restriction.

Hero source PNG size is not mobile transfer size: Next Image transforms it.
Avoid changing the user-approved image composition without measured evidence.
New directory pages render a maximum of 24 results on the server; the full
institution JSON is not shipped to a client-side search component. No runtime
JAMB requests or additional AI/API costs are introduced.

## Outstanding external verification

- Current Search Console performance and indexing coverage require GSC access.
- Vercel project/team scope is unavailable to the connected account; authenticated
  preview fetch returned lookup 404 despite the known ready deployment.
- Live browser smoke tests, mobile device checks and speed/usage measurements
  cannot be represented as passed while the access limitations remain.
- Full independent recovery and real Go54 delivery/Sent evidence are not proven
  by unit tests or stored in-database content snapshots.

These are explicit evidence limits, not reasons to leave other authorised work
unfinished. No additional paid services are required for this implementation.
