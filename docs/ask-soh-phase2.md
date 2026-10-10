# Ask S.O.H Phase 2

Authorized by the user's instruction to deploy Phase 1 and proceed with Phase 2. Phase 3–5 remain planned.

## Result

A shared conversation planner runs in the browser and search API. It carries institution, academic session/year, candidate category, programme, stated UTME score, intent and response preference. Answers still pass through Phase 1 source applicability and verification. Conversation state is a hint, never evidence.

| Required capability | Implemented behavior |
| --- | --- |
| Intent recognition | Existing resolver plus result, certificate, CAPS and price intents |
| Multi-turn memory | Versioned compact state shared with the API |
| Follow-ups | Scoped questions inherit the active school, session and category |
| Yes/okay/next/continue | Continue verified retrieval or ask the outstanding clarification |
| Institution switching | Fresh school clears stale scope; explicit comparisons retain the requested university session |
| Topic switching | Result/certificate/CAPS topics clear incompatible admissions scope |
| Context inheritance | Session-only and course-only replies resume pending questions |
| Nigerian English | Admission phrasing and common local abbreviations |
| Pidgin | Common wetin/wen/abeg/form-still-dey/form-go-close patterns |
| Abbreviations | Institution aliases, Post-UTME variants, DE and UTME |
| Misspellings | Common intent typos and unambiguous one-edit institution abbreviations |
| Decomposition | Up to three scoped questions or institutions; each independently verified |
| Natural conversation | Greetings, acknowledgements, next steps and closure |
| Concise/detail | Default verified answers; explain-more and shorten preferences |
| Clarification | Missing institution, session/year, programme or UTME/DE route prompts |
| Visitor guidance | Stated programme and explicitly labelled UTME score retained; unlabelled scores are not assumed to be UTME; no admission or eligibility promises |
| Long conversations | Compact state survives beyond the bounded transcript |
| Reset/correction | Reset clears state and cancels in-flight requests; category corrections replace old values |
| Grounded multi-turn | Detail and follow-up questions retrieve and verify again |
| Contamination protection | Assistant history is never evidence; cross-school compound parts have independent scope |

Browser persistence uses tab-scoped sessionStorage, a 30-minute expiry and up to 60 redacted text turns. API history is capped at 40 turns. No new database schema or stored customer profile. Reset and quick-topic changes cancel old requests and prevent late replies from restoring stale context.

## Validation

Actual TypeScript conversation tests cover multi-turn clarification, comparisons, fresh switches, category corrections, Nigerian English/Pidgin, typos, long conversations, expiry, privacy, reset and decomposition. Actual API tests cover reviewed evidence, independently verified compound questions and short acknowledgements. Existing CMS/calculator tests remain in the full suite.

Limitations: language normalization is conservative and does not claim to understand every Pidgin expression or arbitrary misspelling. Institution coverage remains the reviewed registry. Memory does not survive a new browser tab or its expiry. A programme/score alone never determines admission eligibility. Official evidence gaps remain visible rather than being filled from conversation history.

Phase 2 is prepared on a Preview branch for review before production release.

Full local validation: 403 repository tests passed, TypeScript passed and targeted ESLint passed. Requirement verification and displayed official sources exclude DE-only notices for explicit UTME questions. Actual API and verifier regressions cover this category isolation. Final Preview and CI identifiers are recorded in PR #329.
