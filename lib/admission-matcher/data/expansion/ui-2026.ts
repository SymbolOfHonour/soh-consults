import type { ProgrammeRequirement } from "../../types";

// Independently observed institution tables, 2026-10-02. Never promote by analogy.
export const uiExpansion2026: ProgrammeRequirement[] = [
  {
    "institutionId": "ui",
    "institutionName": "University of Ibadan, Ibadan, Oyo State",
    "institutionType": "federal-university",
    "institutionAliases": [
      "UI"
    ],
    "programme": "Law",
    "aliases": [
      "LAW"
    ],
    "verificationStatus": "review",
    "requiredUtmeSubjects": [],
    "requiredOlevelCredits": [],
    "unresolvedChecks": [
      "utme",
      "olevel",
      "score",
      "sittings"
    ],
    "maximumSittings": 2,
    "reviewReasons": [
      "Five credits at one sitting versus six at two sittings cannot be represented by one unconditional minimum credit count. Broad subject categories and programme exceptions remain unconfirmed.",
      "Complete current institutional programme waivers and screening conditions have not been reconciled. This record cannot return Requirements Matched.",
      "The current first-choice policy is unconfirmed; no policy is inferred from another university."
    ],
    "minimumOlevelCreditCount": 5,
    "notes": [
      "Live IBASS programme label: LAW",
      "IBASS OLevel requirement: Five (5) level subjects at one sitting or 6 level subjects at 2 sittings to include English Language,  Literature in English and any other subjects from Arts,  Social Sciences or Science.",
      "IBASS UTME requirement: English Language and any three subjects from Arts,  Social Science and / or Science.",
      "UI requires five relevant credits at one sitting or six at two sittings. The current schema cannot express that conditional credit-count rule; OLevel and sittings remain unresolved.",
      "JAMB eligibility checker returned an empty result dialog after a fresh retry. Evidence comes from the official live institution brochure; no successful eligibility check is claimed.",
      "UTME entry only. Direct Entry and unmodelled certificate exceptions require separate assessment. Age, document uploads, registration deadlines, examination participation and final selection are not assessed by this Matcher."
    ],
    "sources": [
      {
        "label": "JAMB IBASS live institution brochure",
        "url": "https://ibass.jamb.gov.ng/brochure-courses?id=392&school=UNIVERSITY%20OF%20IBADAN,%20IBADAN,%20OYO%20STATE",
        "session": "Live IBASS catalogue; admission session not specified",
        "lastVerified": "2026-10-02",
        "scope": "Current listed programme and displayed subject table; complete institutional waivers are not established",
        "locator": "LAW -> View Details"
      },
      {
        "label": "UI official admission source",
        "url": "https://ui.edu.ng/content/undergraduate-admissions-office",
        "session": "Standing admission guidance; current screening threshold not established",
        "lastVerified": "2026-10-02",
        "scope": "Only explicitly confirmed screening conditions; gaps described in notes"
      }
    ]
  },
  {
    "institutionId": "ui",
    "institutionName": "University of Ibadan, Ibadan, Oyo State",
    "institutionType": "federal-university",
    "institutionAliases": [
      "UI"
    ],
    "programme": "Civil Engineering",
    "aliases": [
      "CIVIL ENGINEERING"
    ],
    "verificationStatus": "review",
    "requiredUtmeSubjects": [
      "Physics",
      "Chemistry",
      "Mathematics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "unresolvedChecks": [
      "olevel",
      "score",
      "sittings"
    ],
    "maximumSittings": 2,
    "reviewReasons": [
      "Five credits at one sitting versus six at two sittings cannot be represented by one unconditional minimum credit count. Broad subject categories and programme exceptions remain unconfirmed.",
      "Complete current institutional programme waivers and screening conditions have not been reconciled. This record cannot return Requirements Matched.",
      "The current first-choice policy is unconfirmed; no policy is inferred from another university."
    ],
    "minimumOlevelCreditCount": 5,
    "notes": [
      "Live IBASS programme label: CIVIL ENGINEERING",
      "IBASS OLevel requirement: Five (5) level subjects at one sitting or 6 level subjects at 2 sittings to include English Language,  Physics,  Chemistry and Mathematics with any ONE or TWO of the following subjects as the case may be; Biology,  Agricultural Science,  Further Mathematics,  Technical Drawing,  Economics,  Geography,  Metal Work and Wood Work. SSC credit passes to include Physics,  Chemistry,  Mathematics,  English Language and one Science subject",
      "IBASS UTME requirement: English Language,  Physics,  Chemistry,  and Mathematics.",
      "UI requires five relevant credits at one sitting or six at two sittings. The current schema cannot express that conditional credit-count rule; OLevel and sittings remain unresolved.",
      "JAMB eligibility checker returned an empty result dialog after a fresh retry. Evidence comes from the official live institution brochure; no successful eligibility check is claimed.",
      "UTME entry only. Direct Entry and unmodelled certificate exceptions require separate assessment. Age, document uploads, registration deadlines, examination participation and final selection are not assessed by this Matcher."
    ],
    "sources": [
      {
        "label": "JAMB IBASS live institution brochure",
        "url": "https://ibass.jamb.gov.ng/brochure-courses?id=392&school=UNIVERSITY%20OF%20IBADAN,%20IBADAN,%20OYO%20STATE",
        "session": "Live IBASS catalogue; admission session not specified",
        "lastVerified": "2026-10-02",
        "scope": "Current listed programme and displayed subject table; complete institutional waivers are not established",
        "locator": "CIVIL ENGINEERING -> View Details"
      },
      {
        "label": "UI official admission source",
        "url": "https://ui.edu.ng/content/undergraduate-admissions-office",
        "session": "Standing admission guidance; current screening threshold not established",
        "lastVerified": "2026-10-02",
        "scope": "Only explicitly confirmed screening conditions; gaps described in notes"
      }
    ]
  },
  {
    "institutionId": "ui",
    "institutionName": "University of Ibadan, Ibadan, Oyo State",
    "institutionType": "federal-university",
    "institutionAliases": [
      "UI"
    ],
    "programme": "Biochemistry",
    "aliases": [
      "BIOCHEMISTRY"
    ],
    "verificationStatus": "review",
    "requiredUtmeSubjects": [
      "Physics",
      "Chemistry",
      "Biology"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology"
    ],
    "unresolvedChecks": [
      "score",
      "sittings",
      "olevel"
    ],
    "maximumSittings": 2,
    "reviewReasons": [
      "Five credits at one sitting versus six at two sittings cannot be represented by one unconditional minimum credit count. Broad subject categories and programme exceptions remain unconfirmed.",
      "Complete current institutional programme waivers and screening conditions have not been reconciled. This record cannot return Requirements Matched.",
      "The current first-choice policy is unconfirmed; no policy is inferred from another university."
    ],
    "minimumOlevelCreditCount": 5,
    "notes": [
      "Live IBASS programme label: BIOCHEMISTRY",
      "IBASS OLevel requirement: Five (5) Level Credit Passes in English Language,  Mathematics,  Physics,  Chemistry and Biology",
      "IBASS UTME requirement: English Language,  Physics,  Chemistry,  and Biology",
      "UI requires five relevant credits at one sitting or six at two sittings. The current schema cannot express that conditional credit-count rule; OLevel and sittings remain unresolved.",
      "JAMB eligibility checker returned an empty result dialog after a fresh retry. Evidence comes from the official live institution brochure; no successful eligibility check is claimed.",
      "UTME entry only. Direct Entry and unmodelled certificate exceptions require separate assessment. Age, document uploads, registration deadlines, examination participation and final selection are not assessed by this Matcher."
    ],
    "sources": [
      {
        "label": "JAMB IBASS live institution brochure",
        "url": "https://ibass.jamb.gov.ng/brochure-courses?id=392&school=UNIVERSITY%20OF%20IBADAN,%20IBADAN,%20OYO%20STATE",
        "session": "Live IBASS catalogue; admission session not specified",
        "lastVerified": "2026-10-02",
        "scope": "Current listed programme and displayed subject table; complete institutional waivers are not established",
        "locator": "BIOCHEMISTRY -> View Details"
      },
      {
        "label": "UI official admission source",
        "url": "https://ui.edu.ng/content/undergraduate-admissions-office",
        "session": "Standing admission guidance; current screening threshold not established",
        "lastVerified": "2026-10-02",
        "scope": "Only explicitly confirmed screening conditions; gaps described in notes"
      }
    ]
  }
];
