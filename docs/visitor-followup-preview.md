# Visitor discovery follow-up

Source baseline: bce154069935e712d384387676f7fc6d59f604a7. Concurrent main changes through 8f5af18f7970f8e465cd8fb117046ab44447e51b are incorporated without modifying Ask S.O.H. Isolated feature/visitor-followup-preview branch; production release requires user review.

## Visitor changes
- New application checklist pages link from every opportunity. Availability, published deadline, notice update date, eligibility/documents/fee sections (where supplied), official source and original article attachments are grouped. Missing fields are explicit; no fee or verification date is manufactured.
- My School stores up to five explicit school choices plus interests on this device. It excludes closed/upcoming/expired applications and other schools, retains relevant national guidance, and lets visitors clear preferences. No account, preference telemetry or new database writes.
- A service selector prepares a reviewable WhatsApp enquiry with school/programme and application context. Pricing remains with the owner.
- Narrow opportunity filters and header actions wrap or fit; new routes use device-width viewport and touch-sized controls. Existing wide article overview remains unchanged.
- Homepage and navigation link to My School; sitemap includes unique application routes and My School. Existing URLs remain supported.

## Boundaries
Calculators, formulas, Ask S.O.H, logo, content and “Your Guide. Your Success.” are preserved. No database schema, credentials, analytics collectors, production deployment or audience settings are changed. Existing insights and further analytics improvements are outside this batch.

## Validation
361 automated tests pass, including school isolation, expiry, corrupted preference restore, source-backed checklist sections and encoded WhatsApp enquiry tests. TypeScript and focused ESLint pass. Next production build passes. Local route evidence is in visitor-followup-local-verification.json.

Actual phone viewport emulation is unavailable through the current browser API, so visual mobile QA remains unverified; responsive markup and viewport metadata were checked. Private preview uses the existing published-content snapshot, no database credentials and no ads/tracking writes.

Browser preview testing found and corrected non-school national entities in school choices, prioritises selected-school content, and adds school search. Unicode notice headings and explicitly labelled fee lines are grouped correctly; editorial official links are reused when source metadata is absent.
