import type { ProgrammeRequirement } from "../../types";

// Independently observed institution tables, 2026-10-02. Never promote by analogy.
export const unilagExpansion2026: ProgrammeRequirement[] = [
  {
    "institutionId": "unilag",
    "institutionName": "University of Lagos, Lagos State",
    "institutionType": "federal-university",
    "institutionAliases": [
      "UNILAG"
    ],
    "programme": "Accounting",
    "aliases": [
      "ACCOUNTANCY/ACCOUNTING",
      "Accountancy"
    ],
    "verificationStatus": "review",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Economics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "unresolvedChecks": [
      "olevel"
    ],
    "utmeGroups": [
      {
        "count": 1,
        "subjects": [
          "Financial Accounting",
          "Geography",
          "Government",
          "Biology"
        ]
      }
    ],
    "olevelGroups": [
      {
        "count": 2,
        "subjects": [
          "Geography",
          "Further Mathematics",
          "Financial Accounting",
          "Government",
          "Business Management",
          "Data Processing",
          "Computer Studies",
          "Biology"
        ]
      }
    ],
    "reviewReasons": [
      "Financial Accounting/Principles of Accounting is normalized as one credit. Data Processing/Computer Studies and institutional programme waivers require reconciliation; the 2025/2026 official requirements PDF lists an additional Literature-in-English option.",
      "Complete current institutional programme waivers and screening conditions have not been reconciled. This record cannot return Requirements Matched."
    ],
    "minimumOlevelCreditCount": 5,
    "minimumUtmeScore": 200,
    "maximumSittings": 1,
    "firstChoiceRequired": true,
    "screeningMethod": "post-utme",
    "scoreScope": "institution-screening",
    "notes": [
      "Live IBASS programme label: ACCOUNTANCY/ACCOUNTING",
      "IBASS OLevel requirement: Five O/Level credit passes to include English Language, Mathematics, Economics and any two (2) subjects from the following: Geography, Further Mathematics, Financial Accounting/Principles of Accounting, Government, Business Management, Data Processing/Computer Studies, and Biology.",
      "IBASS UTME requirement: English Language, Mathematics, Economics and any one of Financial Accounting, Geography, Government and Biology.",
      "Age 16 by 30 September 2026, CAPS/portal result upload, aptitude test participation and prior-student restrictions require separate confirmation.",
      "JAMB eligibility checker returned an empty result dialog after a fresh retry. Evidence comes from the official live institution brochure; no successful eligibility check is claimed.",
      "UTME entry only. Direct Entry and unmodelled certificate exceptions require separate assessment. Age, document uploads, registration deadlines, examination participation and final selection are not assessed by this Matcher."
    ],
    "sources": [
      {
        "label": "JAMB IBASS live institution brochure",
        "url": "https://ibass.jamb.gov.ng/brochure-courses?id=494&school=UNIVERSITY%20OF%20LAGOS,%20LAGOS%20STATE",
        "session": "Live IBASS catalogue; admission session not specified",
        "lastVerified": "2026-10-02",
        "scope": "Current listed programme and displayed subject table; complete institutional waivers are not established",
        "locator": "ACCOUNTANCY/ACCOUNTING -> View Details"
      },
      {
        "label": "UNILAG official admission source",
        "url": "https://unilag.edu.ng/important-notice-on-2026-2027-post-utme-screening-exercise/",
        "session": "2026/2027",
        "lastVerified": "2026-10-02",
        "scope": "Only explicitly confirmed screening conditions; gaps described in notes"
      },
      {
        "label": "UNILAG previous-session programme requirements",
        "url": "https://unilag.edu.ng/wp-content/uploads/2025/05/2025-2026-Admission-Requirement-New-UPDATED.pdf",
        "session": "2025/2026; corroboration only, not current screening policy",
        "lastVerified": "2026-10-02",
        "scope": "Comparison reveals an OLevel option discrepancy requiring review",
        "locator": "Accounting"
      }
    ]
  },
  {
    "institutionId": "unilag",
    "institutionName": "University of Lagos, Lagos State",
    "institutionType": "federal-university",
    "institutionAliases": [
      "UNILAG"
    ],
    "programme": "Banking and Finance",
    "aliases": [
      "BANKING AND FINANCE"
    ],
    "verificationStatus": "review",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Economics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "unresolvedChecks": [
      "utme"
    ],
    "olevelGroups": [
      {
        "count": 2,
        "subjects": [
          "Financial Accounting",
          "Geography",
          "Government",
          "Commerce",
          "Business Studies",
          "Physics",
          "Chemistry"
        ]
      }
    ],
    "minimumOlevelCreditCount": 5,
    "minimumUtmeScore": 200,
    "maximumSittings": 1,
    "firstChoiceRequired": true,
    "screeningMethod": "post-utme",
    "scoreScope": "institution-screening",
    "reviewReasons": [
      "Complete current institutional programme waivers and screening conditions have not been reconciled. This record cannot return Requirements Matched."
    ],
    "notes": [
      "Live IBASS programme label: BANKING AND FINANCE",
      "IBASS OLevel requirement: Five O/Level credit passes in English Language,  Mathematics,  Economics and any two (2) subjects from Financial Accounting,  Geography,  Government,  Commerce,  Business Studies,  Physics and Chemistry.",
      "IBASS UTME requirement: English Language,  Mathematics,  Economics and any one (1) subject from Science,  Social Science or Arts.",
      "Age 16 by 30 September 2026, CAPS/portal result upload, aptitude test participation and prior-student restrictions require separate confirmation.",
      "JAMB eligibility checker returned an empty result dialog after a fresh retry. Evidence comes from the official live institution brochure; no successful eligibility check is claimed.",
      "UTME entry only. Direct Entry and unmodelled certificate exceptions require separate assessment. Age, document uploads, registration deadlines, examination participation and final selection are not assessed by this Matcher."
    ],
    "sources": [
      {
        "label": "JAMB IBASS live institution brochure",
        "url": "https://ibass.jamb.gov.ng/brochure-courses?id=494&school=UNIVERSITY%20OF%20LAGOS,%20LAGOS%20STATE",
        "session": "Live IBASS catalogue; admission session not specified",
        "lastVerified": "2026-10-02",
        "scope": "Current listed programme and displayed subject table; complete institutional waivers are not established",
        "locator": "BANKING AND FINANCE -> View Details"
      },
      {
        "label": "UNILAG official admission source",
        "url": "https://unilag.edu.ng/important-notice-on-2026-2027-post-utme-screening-exercise/",
        "session": "2026/2027",
        "lastVerified": "2026-10-02",
        "scope": "Only explicitly confirmed screening conditions; gaps described in notes"
      }
    ]
  },
  {
    "institutionId": "unilag",
    "institutionName": "University of Lagos, Lagos State",
    "institutionType": "federal-university",
    "institutionAliases": [
      "UNILAG"
    ],
    "programme": "Finance",
    "aliases": [
      "FINANCE"
    ],
    "verificationStatus": "review",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Economics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "unresolvedChecks": [
      "utme"
    ],
    "olevelGroups": [
      {
        "count": 2,
        "subjects": [
          "Financial Accounting",
          "Geography",
          "Government",
          "Commerce",
          "Business Studies",
          "Physics",
          "Chemistry"
        ]
      }
    ],
    "minimumOlevelCreditCount": 5,
    "minimumUtmeScore": 200,
    "maximumSittings": 1,
    "firstChoiceRequired": true,
    "screeningMethod": "post-utme",
    "scoreScope": "institution-screening",
    "reviewReasons": [
      "Complete current institutional programme waivers and screening conditions have not been reconciled. This record cannot return Requirements Matched."
    ],
    "notes": [
      "Live IBASS programme label: FINANCE",
      "IBASS OLevel requirement: Five O/Level credit passes in English Language,  Mathematics,  Economics and any two (2) subjects from Financial Accounting,  Geography,  Government,  Commerce,  Business Studies,  Physics and Chemistry.",
      "IBASS UTME requirement: English Language,  Mathematics,  Economics and any one (1) subject from Science,  Social Science or Arts.",
      "Age 16 by 30 September 2026, CAPS/portal result upload, aptitude test participation and prior-student restrictions require separate confirmation.",
      "JAMB eligibility checker returned an empty result dialog after a fresh retry. Evidence comes from the official live institution brochure; no successful eligibility check is claimed.",
      "UTME entry only. Direct Entry and unmodelled certificate exceptions require separate assessment. Age, document uploads, registration deadlines, examination participation and final selection are not assessed by this Matcher."
    ],
    "sources": [
      {
        "label": "JAMB IBASS live institution brochure",
        "url": "https://ibass.jamb.gov.ng/brochure-courses?id=494&school=UNIVERSITY%20OF%20LAGOS,%20LAGOS%20STATE",
        "session": "Live IBASS catalogue; admission session not specified",
        "lastVerified": "2026-10-02",
        "scope": "Current listed programme and displayed subject table; complete institutional waivers are not established",
        "locator": "FINANCE -> View Details"
      },
      {
        "label": "UNILAG official admission source",
        "url": "https://unilag.edu.ng/important-notice-on-2026-2027-post-utme-screening-exercise/",
        "session": "2026/2027",
        "lastVerified": "2026-10-02",
        "scope": "Only explicitly confirmed screening conditions; gaps described in notes"
      }
    ]
  },

  {
    "programme": "Actuarial Science",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Economics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "utmeGroups": [],
    "olevelGroups": [
      {
        "subjects": [
          "Financial Accounting",
          "Data Processing",
          "Further Mathematics",
          "Christian Religious Knowledge",
          "Islamic Religious Knowledge",
          "Geography",
          "Government",
          "Biology",
          "Chemistry",
          "Physics",
          "Commerce",
          "Civic Education",
          "Insurance"
        ],
        "count": 2
      }
    ],
    "minimumOlevelCreditCount": 5,
    "unresolvedChecks": [
      "utme"
    ],
    "reviewReasons": [
      "IBASS includes Further Mathematics in the third UTME slot although it is not in the approved UTME subject catalogue.",
      "Full institution-specific eligibility/waiver conditions are not yet verified for this programme; a screening floor alone is not a complete admission decision."
    ],
    "notes": [
      "The displayed UTME option list is Financial Accounting, Geography, Government, Biology, Chemistry, Physics, Further Mathematics or Commerce; this inconsistency is not converted to an automatic rule.",
      "Screening floor 200, first choice and five relevant credits in one sitting; age, result uploads and aptitude-test participation remain separate administrative checks.",
      "Availability and displayed subject rules were individually checked in the live IBASS institution modal on 2026-10-02. IBASS does not label the session of this live table. Administrative eligibility, certificate exceptions and competitive admission are separate from stored credit/subject checks.",
      "IBASS OLevel requirement: English Language, Mathematics, Economics; option/conditional limitations are preserved in the subject groups, review reasons and notes.",
      "IBASS UTME requirement: Mathematics, Economics; option/conditional limitations are preserved in the subject groups, review reasons and notes."
    ],
    "institutionId": "unilag",
    "institutionName": "University of Lagos, Lagos State",
    "institutionType": "federal-university",
    "institutionAliases": [
      "UNILAG"
    ],
    "verificationStatus": "review",
    "minimumUtmeScore": 200,
    "maximumSittings": 1,
    "firstChoiceRequired": true,
    "screeningMethod": "post-utme",
    "scoreScope": "institution-screening",
    "sources": [
      {
        "label": "JAMB IBASS live institution brochure",
        "url": "https://ibass.jamb.gov.ng/brochure-courses?id=494&school=UNIVERSITY%20OF%20LAGOS,%20LAGOS%20STATE",
        "session": "Live IBASS catalogue; admission session not specified",
        "lastVerified": "2026-10-02",
        "scope": "Programme availability and displayed UTME/O’Level requirements; limitations are recorded above.",
        "locator": "Actuarial Science"
      },
      {
        "label": "UNILAG official admission information",
        "url": "https://unilag.edu.ng/important-notice-on-2026-2027-post-utme-screening-exercise/",
        "session": "2026/2027",
        "lastVerified": "2026-10-02",
        "scope": "Screening floor 200, first choice and five relevant credits in one sitting; age, result uploads and aptitude-test participation remain separate administrative checks.",
        "locator": "Actuarial Science"
      }
    ]
  },
  {
    "programme": "Business Administration",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Economics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "utmeGroups": [],
    "olevelGroups": [],
    "minimumOlevelCreditCount": 5,
    "unresolvedChecks": [
      "utme",
      "olevel"
    ],
    "reviewReasons": [
      "IBASS uses broad Arts/Science/Social Science elective categories for UTME and O’Level.",
      "Full institution-specific eligibility/waiver conditions are not yet verified for this programme; a screening floor alone is not a complete admission decision."
    ],
    "notes": [
      "Observed O’Level pool: Biology/Agricultural Science, Further Mathematics, Technical Drawing, Economics, Geography, Metal Work or Wood Work; conditional additional credits require review.",
      "Screening floor 200, first choice and five relevant credits in one sitting; age, result uploads and aptitude-test participation remain separate administrative checks.",
      "Availability and displayed subject rules were individually checked in the live IBASS institution modal on 2026-10-02. IBASS does not label the session of this live table. Administrative eligibility, certificate exceptions and competitive admission are separate from stored credit/subject checks.",
      "Verified for the stored SSCE subject, credit, sitting and screening checks only; participation, age, CAPS uploads and final institutional selection are not predicted by the Matcher.",
      "Screening floor 200, first choice and five relevant credits in one sitting; age, result uploads and aptitude-test participation remain separate administrative checks.",
      "Availability and displayed subject rules were individually checked in the live IBASS institution modal on 2026-10-02. IBASS does not label the session of this live table. Administrative eligibility, certificate exceptions and competitive admission are separate from stored credit/subject checks.",
      "Screening floor 200, first choice and five relevant credits in one sitting; age, result uploads and aptitude-test participation remain separate administrative checks.",
      "Availability and displayed subject rules were individually checked in the live IBASS institution modal on 2026-10-02. IBASS does not label the session of this live table. Administrative eligibility, certificate exceptions and competitive admission are separate from stored credit/subject checks.",
      "Screening floor 200, first choice and five relevant credits in one sitting; age, result uploads and aptitude-test participation remain separate administrative checks.",
      "Availability and displayed subject rules were individually checked in the live IBASS institution modal on 2026-10-02. IBASS does not label the session of this live table. Administrative eligibility, certificate exceptions and competitive admission are separate from stored credit/subject checks.",
      "IBASS OLevel requirement: English Language, Mathematics, Economics; option/conditional limitations are preserved in the subject groups, review reasons and notes.",
      "IBASS UTME requirement: Mathematics, Economics; option/conditional limitations are preserved in the subject groups, review reasons and notes."
    ],
    "institutionId": "unilag",
    "institutionName": "University of Lagos, Lagos State",
    "institutionType": "federal-university",
    "institutionAliases": [
      "UNILAG"
    ],
    "verificationStatus": "review",
    "minimumUtmeScore": 200,
    "maximumSittings": 1,
    "firstChoiceRequired": true,
    "screeningMethod": "post-utme",
    "scoreScope": "institution-screening",
    "sources": [
      {
        "label": "JAMB IBASS live institution brochure",
        "url": "https://ibass.jamb.gov.ng/brochure-courses?id=494&school=UNIVERSITY%20OF%20LAGOS,%20LAGOS%20STATE",
        "session": "Live IBASS catalogue; admission session not specified",
        "lastVerified": "2026-10-02",
        "scope": "Programme availability and displayed UTME/O’Level requirements; limitations are recorded above.",
        "locator": "Business Administration"
      },
      {
        "label": "UNILAG official admission information",
        "url": "https://unilag.edu.ng/important-notice-on-2026-2027-post-utme-screening-exercise/",
        "session": "2026/2027",
        "lastVerified": "2026-10-02",
        "scope": "Screening floor 200, first choice and five relevant credits in one sitting; age, result uploads and aptitude-test participation remain separate administrative checks.",
        "locator": "Business Administration"
      }
    ]
  }

];
