# Visitor discovery enhancement

Production reviewed: https://sohconsults.com.ng (5 October 2026).
Source baseline: ff3a2f0, origin/main. Work isolated on feature/visitor-discovery-preview.

## Result

- Homepage latest updates use the same publication-date ordering as Updates. Failed refreshes retain the server-rendered list.
- A visible homepage search joins published CMS updates, existing opportunities, guides and screening/CGPA calculators. Search filters unrelated records, folds Unicode headlines, understands common institution abbreviations and prioritizes title matches.
- Search text and filters are reflected in the URL and restored when returning to a list. Empty results offer recovery and a contextual WhatsApp action.
- Updates keep Latest first as the default, with an optional Recommended order. Lists load in batches while retaining access to every record.
- Related updates and next-step guides/tools use shared topics and institution context. Expired deadlines are excluded from recommendations. Recommendation calculation does not modify engagement counts.
- Opportunities retain the existing entries, integrate published scholarship stories, demote closed deadlines, and identify unknown dates as needing confirmation. WhatsApp and official application actions have distinct labels.
- Home, Updates, Search and Opportunities have readable device-width layouts and accessible search/filter controls. Existing article overview and calculator layouts/formulas are preserved. Search is reachable from the navigation; mobile Contact no longer appears selected on every page.
- Branding, founder content, existing public content and the exact tagline “Your Guide. Your Success.” are retained.

## Validation

- 190 repository tests pass, including 8 new behavior tests for actual ranking, Unicode search, filtering, deadline expiry, recommendations and the CMS/tool catalogue.
- TypeScript check passes. Focused ESLint checks pass. Production Next.js build passes using webpack (the shared dependency symlink is outside Turbopack's filesystem root).
- Private approval deployment uses an isolated, read-only snapshot of published content. It has no live database credentials, CMS writes, tracking writes or production advertisements. The production domain, repository default branch, audience and hosting settings have not been changed.
- Browser journey results and deployment identity are recorded in the private review source with the rendered artifact.
