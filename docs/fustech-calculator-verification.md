# FUSTECH Epe screening calculator

Sources checked 11 November 2026:
- https://admissions.fustech.edu.ng/programme-requirements
- https://admissions.fustech.edu.ng/applicant/guidelines
- https://admissions.fustech.edu.ng/undergraduate
- https://fustech.edu.ng/news/20262027-academic-session-online-undergraduate-admission-screening-exercise

## Implementation

New `/fustech-calculator` page linked from the existing screening calculator hub and sitemap. Uses the site's existing nine-subject O-Level input, public navigation, theme and report dependency. No changes to LASU or other calculators.

All 34 programme names, O-Level text and UTME text were extracted from the official checker's embedded `programmes` data, not third-party admission sites. The original text is retained alongside explicit credit slots. The page works without submitting student results to an external service.

UTME contribution: score / 400 * 70. Five distinct relevant O-Level credits: A1=6, B2=5, B3=4, C4=3, C5=2, C6=1. Maximum aggregate 100. Minimum UTME 185. No departmental aggregate cutoff or sitting deduction has been assumed.

The credit matcher searches valid assignments to preserve compulsory subjects and choose the highest-scoring permissible five. Repeated subjects across sittings count once at the best credit grade. Failed grades do not count. The PDF includes selected credits, UTME subjects, points, validation notes and source links.

## Official-source inconsistencies

1. **Sittings:** the admissions guidelines and undergraduate portal allow up to two sittings; the university's 7 November news notice says one sitting. The calculator follows the admissions portal, explicitly flags the conflict whenever two sittings are chosen, and does not give an unconditional admission eligibility decision.
2. **Logistic and Supply Chain Management UTME:** published text allows English, Mathematics, Economics and one of Government, Commerce or Geography. The embedded structured rule also includes Accounts. The calculator uses the narrower displayed text and excludes Accounts for this programme. This needs university confirmation if Accounts is to be accepted.
3. Category wording such as Science, Trade and Social Science is represented by named school subjects in the input. The original wording remains visible so candidates can confirm subjects outside the input list with FUSTECH.

## Validation

- TypeScript check and production build.
- Automated cases for all 34 unique programme records and their UTME combinations.
- Formula boundaries, 185 minimum, invalid scores, missing compulsory credits, duplicate subjects, alternatives and best grades across sittings.
- Regression: 300 UTME + five relevant A1 grades = 52.50 + 30 = 82.50.
- Vercel preview READY: https://soh-consults-1lknuy1y7-symbol-of-honour.vercel.app/fustech-calculator (runtime commit ebcb2cf).
- Browser verified: 280 UTME + A1/B2/B3/C4/C5 = 49 + 20 = 69.00; valid subject result; wrong UTME and failed compulsory credit rejection; NABTEB mixing rejection; sitting-policy notice; successful PDF download; readable dark theme.
- All 34 original course names and requirement texts compared exactly against the official embedded records.
- The original managed local preview failed because its runner adds unsupported Next.js flags; browser verification was completed on the actual Vercel preview instead.

Production deployment requires owner approval.
