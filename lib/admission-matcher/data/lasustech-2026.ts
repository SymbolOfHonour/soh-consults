import type { ProgrammeRequirement } from "../types";

// Official named UTME sections. Shared institution rules are not programme admission cutoffs.
const base: Omit<ProgrammeRequirement, "programme" | "requiredUtmeSubjects" | "requiredOlevelCredits"> = {
  "institutionId": "lasustech",
  "institutionName": "Lagos State University of Science and Technology (LASUSTECH)",
  "institutionType": "state-university",
  "institutionAliases": [
    "LASUSTECH"
  ],
  "minimumUtmeScore": 195,
  "scoreScope": "institution-screening",
  "minimumOlevelCreditCount": 5,
  "maximumSittings": 2,
  "firstChoiceRequired": true,
  "screeningMethod": "online",
  "verificationStatus": "verified",
  "sources": []
};
const sources = [
  {
    "label": "LASUSTECH official programme admission requirements",
    "url": "https://www.lasustech.edu.ng/colleges-and-directorates/admissions/",
    "session": "Undated current requirements, checked for 2026/2027 screening",
    "lastVerified": "2026-10-01",
    "scope": "Programme UTME and SSCE credits/sittings"
  },
  {
    "label": "LASUSTECH 2026/2027 online admission screening notice",
    "url": "https://lasustech.edu.ng/events.php?event=2026-2027-online-admission-screening-exercise-for-100-level-and-direct-entry-candidates",
    "session": "2026/2027",
    "lastVerified": "2026-10-01",
    "scope": "Institution screening floor of 195, first choice and screening process"
  }
];
type ProgrammeRule = Pick<ProgrammeRequirement, "programme" | "requiredUtmeSubjects" | "requiredOlevelCredits"> & Partial<ProgrammeRequirement>;
const rules: ProgrammeRule[] = [
  {
    "programme": "Agricultural and Biosystems Engineering",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science",
          "Technical Drawing",
          "Further Mathematics",
          "Economics",
          "Computer Studies",
          "Geography"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Chemical Engineering",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science",
          "Technical Drawing",
          "Further Mathematics",
          "Economics",
          "Computer Studies",
          "Geography"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Civil and Construction Engineering",
    "aliases": [
      "Civil Engineering"
    ],
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science",
          "Technical Drawing",
          "Further Mathematics",
          "Economics",
          "Computer Studies",
          "Geography"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Computer Engineering",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science",
          "Technical Drawing",
          "Further Mathematics",
          "Economics",
          "Computer Studies",
          "Geography"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Electrical and Electronics Engineering",
    "aliases": [
      "Electrical/Electronic Engineering"
    ],
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science",
          "Technical Drawing",
          "Further Mathematics",
          "Economics",
          "Computer Studies",
          "Geography"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Mechanical Engineering",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science",
          "Technical Drawing",
          "Further Mathematics",
          "Economics",
          "Computer Studies",
          "Geography"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Mechatronics Engineering",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science",
          "Technical Drawing",
          "Further Mathematics",
          "Economics",
          "Computer Studies",
          "Geography"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Agricultural Economics and Farm Management",
    "requiredUtmeSubjects": [
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Chemistry"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Mathematics",
          "Physics",
          "Economics"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Agricultural Science",
          "Biology",
          "Fisheries"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Physics",
          "Geography",
          "Economics",
          "Marketing",
          "Data Processing",
          "Computer Studies"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Agricultural Extension and Rural Development",
    "requiredUtmeSubjects": [
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Chemistry"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Mathematics",
          "Physics",
          "Economics"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Agricultural Science",
          "Biology",
          "Fisheries"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Physics",
          "Geography",
          "Economics",
          "Marketing",
          "Data Processing",
          "Computer Studies"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Animal Production",
    "requiredUtmeSubjects": [
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Chemistry"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Mathematics",
          "Physics",
          "Economics"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Agricultural Science",
          "Biology",
          "Fisheries"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Physics",
          "Geography",
          "Economics",
          "Marketing",
          "Data Processing",
          "Computer Studies"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Crop Science",
    "requiredUtmeSubjects": [
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Chemistry"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Mathematics",
          "Physics",
          "Economics"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Agricultural Science",
          "Biology",
          "Fisheries"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Physics",
          "Geography",
          "Economics",
          "Marketing",
          "Data Processing",
          "Computer Studies"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Aquaculture and Fisheries Management",
    "requiredUtmeSubjects": [
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Chemistry"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Physics",
          "Mathematics"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Geography",
          "Economics"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Biology",
          "Agricultural Science",
          "Fisheries"
        ],
        "count": 1
      }
    ],
    "reviewReasons": [
      "The official rule also requires at least P7 in Physics. This credit-only profile cannot confirm a Physics pass grade."
    ],
    "verificationStatus": "review"
  },
  {
    "programme": "Food Science and Technology",
    "requiredUtmeSubjects": [
      "Physics",
      "Chemistry",
      "Biology"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Horticulture and Landscape Management",
    "requiredUtmeSubjects": [
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Mathematics",
          "Physics"
        ],
        "count": 1
      }
    ],
    "reviewReasons": [
      "The official rule permits certain Biology/Physics pass-grade waivers with substitute credits. Those pass grades are not collected; request institutional review of a waived profile."
    ],
    "unresolvedChecks": [
      "olevel"
    ],
    "verificationStatus": "review"
  },
  {
    "programme": "Accounting",
    "aliases": [
      "Accountancy"
    ],
    "requiredUtmeSubjects": [
      "Mathematics",
      "Economics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Commerce",
          "Government",
          "Geography",
          "Financial Accounting"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Financial Accounting",
          "Business Methods",
          "Commerce",
          "Book Keeping",
          "Marketing",
          "Insurance",
          "Government",
          "Civic Education",
          "Geography",
          "Data Processing",
          "Computer Studies",
          "Office Practice",
          "Christian Religious Knowledge",
          "Islamic Religious Knowledge",
          "Agricultural Science",
          "Biology",
          "Physics"
        ],
        "count": 2
      }
    ]
  },
  {
    "programme": "Insurance",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Economics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Financial Accounting",
          "Commerce",
          "Government",
          "Agricultural Science",
          "Biology",
          "Physics"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Financial Accounting",
          "Business Methods",
          "Commerce",
          "Book Keeping",
          "Marketing",
          "Insurance",
          "Government",
          "Civic Education",
          "Geography",
          "Data Processing",
          "Computer Studies",
          "Office Practice",
          "Christian Religious Knowledge",
          "Islamic Religious Knowledge",
          "Agricultural Science",
          "Biology",
          "Physics"
        ],
        "count": 2
      }
    ]
  },
  {
    "programme": "Economics",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Economics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Commerce",
          "Financial Accounting",
          "Government",
          "Geography",
          "Christian Religious Knowledge",
          "Islamic Religious Knowledge",
          "French",
          "Physics",
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Financial Accounting",
          "Business Methods",
          "Commerce",
          "Book Keeping",
          "Marketing",
          "Insurance",
          "Government",
          "Civic Education",
          "Geography",
          "Data Processing",
          "Computer Studies",
          "Office Practice",
          "Christian Religious Knowledge",
          "Islamic Religious Knowledge",
          "Agricultural Science",
          "Biology",
          "Physics"
        ],
        "count": 2
      }
    ]
  },
  {
    "programme": "Marketing",
    "requiredUtmeSubjects": [
      "Mathematics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Economics",
          "Commerce",
          "Government",
          "Financial Accounting"
        ],
        "count": 2
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Financial Accounting",
          "Business Methods",
          "Commerce",
          "Book Keeping",
          "Marketing",
          "Insurance",
          "Government",
          "Civic Education",
          "Geography",
          "Data Processing",
          "Computer Studies",
          "Office Practice",
          "Christian Religious Knowledge",
          "Islamic Religious Knowledge",
          "Agricultural Science",
          "Biology",
          "Physics"
        ],
        "count": 2
      }
    ]
  },
  {
    "programme": "Actuarial Science",
    "requiredUtmeSubjects": [
      "Mathematics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Economics",
          "Financial Accounting",
          "Commerce",
          "Government",
          "Agricultural Science",
          "Biology",
          "Physics"
        ],
        "count": 2
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Financial Accounting",
          "Business Methods",
          "Commerce",
          "Book Keeping",
          "Marketing",
          "Insurance",
          "Government",
          "Civic Education",
          "Geography",
          "Data Processing",
          "Computer Studies",
          "Christian Religious Knowledge",
          "Islamic Religious Knowledge",
          "Agricultural Science",
          "Biology",
          "Physics",
          "Further Mathematics"
        ],
        "count": 2
      }
    ]
  },
  {
    "programme": "Hospitality and Tourism Management",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Economics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Geography",
          "Financial Accounting",
          "Commerce",
          "Business Methods",
          "Government",
          "Physics",
          "Chemistry",
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Geography",
          "Financial Accounting",
          "Commerce",
          "Business Methods",
          "Government",
          "Physics",
          "Chemistry",
          "Biology",
          "Agricultural Science",
          "Food and Nutrition",
          "Home Economics"
        ],
        "count": 2
      }
    ]
  },
  {
    "programme": "Office and Information Technology",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Economics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Commerce",
          "Government",
          "Financial Accounting",
          "Agricultural Science",
          "Biology",
          "Physics",
          "Chemistry"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Financial Accounting",
          "Business Methods",
          "Commerce",
          "Book Keeping",
          "Marketing",
          "Insurance",
          "Government",
          "Civic Education",
          "Geography",
          "Data Processing",
          "Computer Studies",
          "Office Practice",
          "Christian Religious Knowledge",
          "Islamic Religious Knowledge",
          "Agricultural Science",
          "Biology",
          "Physics",
          "Word Processing",
          "Typewriting",
          "Shorthand"
        ],
        "count": 2
      }
    ]
  },
  {
    "programme": "Mass Communication",
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Literature in English",
          "History",
          "Government",
          "Geography",
          "Mathematics",
          "Christian Religious Knowledge",
          "Islamic Religious Knowledge",
          "Economics",
          "Commerce",
          "Fine Arts",
          "French",
          "Yoruba",
          "Igbo",
          "Hausa"
        ],
        "count": 3
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Literature in English",
          "History",
          "Government",
          "Geography",
          "Christian Religious Knowledge",
          "Islamic Religious Knowledge",
          "Economics",
          "Commerce",
          "Fine Arts",
          "French",
          "Yoruba",
          "Igbo",
          "Hausa",
          "Financial Accounting",
          "Business Methods",
          "Book Keeping",
          "Marketing",
          "Insurance",
          "Civic Education",
          "Word Processing",
          "Data Processing",
          "Computer Studies",
          "Office Practice",
          "Statistics"
        ],
        "count": 3
      }
    ],
    "requiredUtmeSubjects": []
  },
  {
    "programme": "Chemistry",
    "requiredUtmeSubjects": [
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Chemistry",
      "Physics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Biology",
          "Physics",
          "Mathematics"
        ],
        "count": 2
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Computer Science",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science",
          "Further Mathematics",
          "Technical Drawing",
          "Computer Studies"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Industrial Chemistry",
    "requiredUtmeSubjects": [
      "Chemistry",
      "Mathematics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Chemistry",
      "Physics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science",
          "Physics"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Industrial Mathematics",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Chemistry",
          "Biology",
          "Geography",
          "Economics"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Further Mathematics",
          "Chemistry",
          "Biology",
          "Agricultural Science",
          "Economics",
          "Geography",
          "Computer Studies",
          "Data Processing",
          "Information and Communication Technology"
        ],
        "count": 2
      }
    ]
  },
  {
    "programme": "Mathematics",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Chemistry",
          "Biology",
          "Geography",
          "Economics"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Further Mathematics",
          "Chemistry",
          "Biology",
          "Agricultural Science",
          "Economics",
          "Geography",
          "Computer Studies",
          "Data Processing",
          "Information and Communication Technology"
        ],
        "count": 2
      }
    ]
  },
  {
    "programme": "Statistics",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Chemistry",
          "Biology",
          "Geography",
          "Economics"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Further Mathematics",
          "Chemistry",
          "Biology",
          "Agricultural Science",
          "Economics",
          "Geography",
          "Computer Studies",
          "Data Processing",
          "Information and Communication Technology"
        ],
        "count": 2
      }
    ]
  },
  {
    "programme": "Microbiology",
    "requiredUtmeSubjects": [
      "Chemistry",
      "Physics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Chemistry"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Physics",
          "Geography",
          "Further Mathematics",
          "Food and Nutrition",
          "Economics",
          "Health Science"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Zoology",
    "requiredUtmeSubjects": [
      "Chemistry",
      "Physics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Chemistry"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Physics",
          "Geography",
          "Further Mathematics",
          "Food and Nutrition",
          "Economics",
          "Health Science"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Physics with Electronics",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry"
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Biology",
          "Agricultural Science",
          "Further Mathematics",
          "Technical Drawing",
          "Economics",
          "Data Processing",
          "Computer Studies"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Architecture",
    "requiredUtmeSubjects": [
      "Mathematics",
      "Physics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Chemistry",
          "Geography",
          "Biology",
          "Economics",
          "Further Mathematics"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Chemistry",
          "Geography",
          "Biology",
          "Economics",
          "Technical Drawing",
          "Further Mathematics",
          "Graphic Design",
          "Plumbing and Pipe Fitting",
          "Carpentry and Joinery",
          "Painting and Decoration"
        ],
        "count": 2
      }
    ]
  },
  {
    "programme": "Arts and Industrial Design",
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Literature in English",
          "History",
          "Government",
          "Geography",
          "Mathematics",
          "Christian Religious Knowledge",
          "Islamic Religious Knowledge",
          "Economics",
          "Commerce",
          "Fine Arts",
          "French",
          "Yoruba",
          "Igbo",
          "Hausa",
          "Physics",
          "Chemistry",
          "Biology",
          "Agricultural Science"
        ],
        "count": 3
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Literature in English",
          "History",
          "Government",
          "Geography",
          "Christian Religious Knowledge",
          "Islamic Religious Knowledge",
          "Economics",
          "Commerce",
          "Fine Arts",
          "French",
          "Yoruba",
          "Igbo",
          "Hausa",
          "Physics",
          "Chemistry",
          "Biology",
          "Agricultural Science"
        ],
        "count": 3
      }
    ],
    "reviewReasons": [
      "The official rule allows any three arts, science or social science subjects. This named-subject list is illustrative; full subject classifications need institutional review."
    ],
    "unresolvedChecks": [
      "utme",
      "olevel"
    ],
    "verificationStatus": "review",
    "requiredUtmeSubjects": []
  },
  {
    "programme": "Estate Management and Valuation",
    "aliases": [
      "Estate Management"
    ],
    "requiredUtmeSubjects": [
      "Mathematics",
      "Economics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Economics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Chemistry",
          "Physics",
          "Biology",
          "Geography",
          "Government"
        ],
        "count": 1
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Physics",
          "Chemistry",
          "Biology"
        ],
        "count": 1
      },
      {
        "subjects": [
          "Government",
          "History",
          "Civic Education",
          "Biology",
          "Physics",
          "Chemistry",
          "Geography",
          "Agricultural Science",
          "Computer Studies",
          "Data Processing",
          "Information and Communication Technology",
          "Technical Drawing",
          "Woodwork",
          "Plumbing and Pipe Fitting",
          "Literature in English",
          "Metal Work",
          "Financial Accounting",
          "Book Keeping"
        ],
        "count": 1
      }
    ]
  },
  {
    "programme": "Quantity Surveying",
    "requiredUtmeSubjects": [
      "Mathematics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Physics"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Chemistry",
          "Physics",
          "Biology",
          "Geography"
        ],
        "count": 2
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Building Construction",
          "Technical Drawing",
          "Economics",
          "Computer Studies",
          "Geography",
          "Chemistry",
          "Biology",
          "Commerce"
        ],
        "count": 2
      }
    ]
  },
  {
    "programme": "Urban and Regional Planning",
    "requiredUtmeSubjects": [
      "Mathematics"
    ],
    "requiredOlevelCredits": [
      "English Language",
      "Mathematics",
      "Geography"
    ],
    "utmeGroups": [
      {
        "subjects": [
          "Agricultural Science",
          "Biology",
          "Chemistry",
          "Economics",
          "Geography",
          "Physics",
          "Computer Studies",
          "Fine Arts",
          "Home Economics"
        ],
        "count": 2
      }
    ],
    "olevelGroups": [
      {
        "subjects": [
          "Physics",
          "Chemistry",
          "Biology",
          "Economics",
          "Commerce",
          "Further Mathematics",
          "Data Processing",
          "Agricultural Science",
          "Information and Communication Technology",
          "Civic Education",
          "Fine Arts",
          "Technical Drawing",
          "History",
          "Government",
          "Marketing",
          "Computer Studies",
          "Home Economics"
        ],
        "count": 2
      }
    ]
  }
];
export const lasustech2026Requirements: ProgrammeRequirement[] = rules.map(rule => ({
  ...base, ...rule, sources: sources.map(s => ({ ...s, locator: rule.programme })),
  notes: ["195 is an institution screening floor, not a departmental admission cutoff. Administrative screening, origin verification where applicable and admission decisions remain with LASUSTECH."]
}));
