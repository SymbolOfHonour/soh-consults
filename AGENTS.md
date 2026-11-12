<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## School calculator O’Level dropdowns

Use `lib/olevel-subjects.ts` for all new school calculators and O’Level subject dropdowns. `LasuStyleOLevel` includes this catalogue by default; its optional `subjects` prop preserves school-specific subject labels. For custom dropdowns, call `getOLevelSubjectOptions(existingSchoolLabels)`. Keep UTME subjects, school acceptance rules and grade formulas separate from the input catalogue. Do not treat a listed input subject as automatically accepted for a programme.
