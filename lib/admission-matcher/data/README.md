# S.O.H Admission Matcher data policy

This directory is the Matcher's independent admissions-requirements dataset.

## Hard boundary

Existing screening calculator files, formulas, wording, UI, routes and datasets are not dependencies of this dataset and must not be modified by Admission Matcher work.

## Source standard

Programme records may only become `verified` when the requirements are supported by primary sources, prioritising:

1. JAMB IBASS / official JAMB material for programme availability, O'Level requirements and UTME subject combinations.
2. The institution's official admission portal, brochure, screening notice or programme requirement page for institution-specific rules.

Third-party education blogs must not be the authority for a verified record.

## Required provenance

Every verified programme record must retain:

- admission session
- official source URL(s)
- date last verified
- institution and programme identifiers
- entry mode
- O'Level rule groups
- UTME subject rules
- institution-specific minimum score only where an official source supports it
- notes/exceptions where applicable

## Safety

A match means the candidate's supplied details satisfy the requirements encoded in the current verified record. It is not an admission prediction, guarantee, cutoff-mark prediction or claim that admission will be offered.

Records with incomplete or conflicting primary-source evidence must remain `review`/unverified and must not be presented as a confirmed match.
