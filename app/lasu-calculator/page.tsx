"use client";

import { useMemo, useState } from "react";

type OLevelEntry = {
  subject: string;
  grade: string;
};

type SubjectCategory =
  | "socialScience"
  | "science"
  | "arts"
  | "business"
  | "commercial"
  | "scienceRelated"
  | "artsRelated";

type RequirementGroup = {
  label: string;
  subjects?: string[];
  category?: SubjectCategory;
  anySubject?: boolean;
  required: number;
};

type CourseRequirement = {
  requiredJamb: string[];
  oneOfJamb?: RequirementGroup[];
  requiredOlevel: string[];
  oneOfOlevel?: RequirementGroup[];
  minimumRelevantCredits: number;
};

const LASU_CUTOFF_MARK = 195;

const gradePoints: Record<string, number> = {
  A1: 8,
  B2: 7,
  B3: 6,
  C4: 5,
  C5: 4,
  C6: 3,
  D7: 0,
  E8: 0,
  F9: 0,
};

const grades = [
  "A1",
  "B2",
  "B3",
  "C4",
  "C5",
  "C6",
  "D7",
  "E8",
  "F9",
];

const jambSubjects = [
  "Accounting",
  "Agricultural Science",
  "Arabic",
  "Biology",
  "Chemistry",
  "Christian Religious Studies",
  "Commerce",
  "Computer Studies",
  "Economics",
  "French",
  "Further Mathematics",
  "Geography",
  "Government",
  "Hausa",
  "History",
  "Igbo",
  "Islamic Religious Studies",
  "Literature in English",
  "Mathematics",
  "Music",
  "Physics",
  "Yoruba",
];

const oLevelSubjects = [
  "Accounting",
  "Agriculture",
  "Arabic",
  "Beauty and Cosmetology",
  "Biology",
  "Catering Craft",
  "Chemistry",
  "Christian Religious Studies",
  "Civic Education",
  "Commerce",
  "Computer Hardware and GSM Repairs",
  "Economics",
  "English Language",
  "Fashion Design and Garment Making",
  "Foods & Nutrition",
  "French",
  "Further Mathematics",
  "General Mathematics",
  "Geography",
  "Government",
  "Hausa Language",
  "Health Education",
  "Horticulture and Crop Production",
  "Home Management",
  "Igbo Language",
  "Islamic Studies",
  "Literature-in-English",
  "Livestock Farming",
  "Marketing",
  "Music",
  "Nigerian History",
  "Physical Education",
  "Physics",
  "Solar Photovoltaic Installation and Maintenance",
  "Technical Drawing",
  "Visual Art",
  "Yoruba Language",
].sort((a, b) => a.localeCompare(b));

const subjectCategories: Record<SubjectCategory, string[]> = {
  socialScience: [
    "Economics",
    "Government",
    "Geography",
    "Commerce",
    "Accounting",
    "Marketing",
    "Insurance",
    "History",
    "Civic Education",
    "Nigerian History",
  ],

  science: [
    "Biology",
    "Chemistry",
    "Physics",
    "Agriculture",
    "Agricultural Science",
    "Further Mathematics",
    "Geography",
  ],

  arts: [
    "Literature-in-English",
    "Literature in English",
    "History",
    "Government",
    "Geography",
    "Christian Religious Studies",
    "Islamic Religious Studies",
    "Islamic Studies",
    "Arabic",
    "French",
    "Music",
    "Yoruba",
    "Yoruba Language",
    "Hausa",
    "Hausa Language",
    "Igbo",
    "Igbo Language",
    "Visual Art",
  ],

  business: [
    "Accounting",
    "Commerce",
    "Marketing",
    "Economics",
    "Insurance",
  ],

  commercial: [
    "Accounting",
    "Commerce",
    "Marketing",
    "Economics",
    "Insurance",
  ],

  scienceRelated: [
    "Biology",
    "Chemistry",
    "Physics",
    "Agriculture",
    "Further Mathematics",
    "Geography",
    "Computer Hardware and GSM Repairs",
    "Technical Drawing",
  ],

  artsRelated: [
    "Literature-in-English",
    "Government",
    "History",
    "Nigerian History",
    "Economics",
    "Geography",
    "Civic Education",
    "Christian Religious Studies",
    "Islamic Studies",
    "Arabic",
    "French",
    "Music",
    "Visual Art",
  ],
};

const courseRequirements: Record<string, CourseRequirement> = {
  Accounting: {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "Relevant Social Science subject",
        category: "socialScience",
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Economics",
    ],
    oneOfOlevel: [
      {
        label: "Relevant Social Science subject",
        category: "socialScience",
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Banking and Finance": {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "Relevant Social Science subject",
        category: "socialScience",
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Economics",
    ],
    oneOfOlevel: [
      {
        label: "Relevant Social Science subjects",
        category: "socialScience",
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Business Administration": {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "Relevant Social Science subject",
        category: "socialScience",
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Economics",
    ],
    oneOfOlevel: [
      {
        label: "Relevant Social Science subjects",
        category: "socialScience",
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Insurance: {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "Relevant Social Science subject",
        category: "socialScience",
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Economics",
    ],
    oneOfOlevel: [
      {
        label: "Relevant Social Science subjects",
        category: "socialScience",
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Industrial Relations and Personnel Management": {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "Relevant Social Science subjects",
        category: "socialScience",
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Economics",
    ],
    oneOfOlevel: [
      {
        label: "Relevant Social Science subjects",
        category: "socialScience",
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Marketing: {
    requiredJamb: ["Mathematics"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Economics",
          "Commerce",
          "Accounting",
          "Government",
          "Geography",
          "Marketing",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "General Mathematics"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Marketing",
          "Economics",
          "Commerce",
          "Accounting",
          "Geography",
          "Government",
          "Civic Education",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Public Administration": {
    requiredJamb: ["Government"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Economics",
          "History",
          "Geography",
          "Literature in English",
          "Christian Religious Studies",
          "Islamic Religious Studies",
        ],
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Government",
    ],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Economics",
          "History",
          "Geography",
          "Literature-in-English",
          "Christian Religious Studies",
          "Islamic Studies",
          "Civic Education",
          "Commerce",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Economics: {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "Relevant subject",
        subjects: ["Government", "Geography", "Commerce", "Accounting"],
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Economics",
    ],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "Geography",
          "Commerce",
          "Accounting",
          "History",
          "Civic Education",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Political Science": {
    requiredJamb: ["Government"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "History",
          "Economics",
          "Geography",
          "Literature in English",
          "Christian Religious Studies",
          "Islamic Religious Studies",
        ],
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Government",
    ],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "History",
          "Nigerian History",
          "Economics",
          "Geography",
          "Civic Education",
          "Literature-in-English",
          "Christian Religious Studies",
          "Islamic Studies",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Psychology: {
    requiredJamb: ["Biology"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Economics",
          "Government",
          "Geography",
          "Literature in English",
          "Chemistry",
          "Physics",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "General Mathematics"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Biology",
          "Economics",
          "Government",
          "Geography",
          "Civic Education",
          "Literature-in-English",
          "Chemistry",
          "Physics",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Sociology: {
    requiredJamb: ["Mathematics"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Economics",
          "Government",
          "Geography",
          "History",
          "Literature in English",
          "Christian Religious Studies",
          "Islamic Religious Studies",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "General Mathematics"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Economics",
          "Government",
          "Geography",
          "History",
          "Nigerian History",
          "Civic Education",
          "Literature-in-English",
          "Biology",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Geography and Planning": {
    requiredJamb: ["Geography"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Economics",
          "Government",
          "Biology",
          "Chemistry",
          "Physics",
          "Agricultural Science",
        ],
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Geography",
    ],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Economics",
          "Government",
          "Biology",
          "Chemistry",
          "Physics",
          "Agriculture",
          "Civic Education",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "English Language": {
    requiredJamb: ["Literature in English"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "History",
          "Economics",
          "Geography",
          "Christian Religious Studies",
          "Islamic Religious Studies",
          "French",
          "Music",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "Literature-in-English"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "History",
          "Nigerian History",
          "Economics",
          "Geography",
          "Civic Education",
          "Christian Religious Studies",
          "Islamic Studies",
          "French",
          "Arabic",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Mass Communication": {
    requiredJamb: ["Literature in English"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "History",
          "Economics",
          "Geography",
          "Christian Religious Studies",
          "Islamic Religious Studies",
          "French",
          "Music",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "Literature-in-English"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "Economics",
          "History",
          "Nigerian History",
          "Geography",
          "Commerce",
          "Marketing",
          "Civic Education",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Common Law": {
    requiredJamb: [],
    oneOfJamb: [
      {
        label: "Law UTME subjects",
        subjects: ["Literature in English", "Government"],
        required: 2,
      },
      {
        label: "Additional relevant subject",
        subjects: [
          "History",
          "Economics",
          "Geography",
          "Christian Religious Studies",
          "Islamic Religious Studies",
        ],
        required: 1,
      },
    ],
    requiredOlevel: ["English Language", "Literature-in-English", "Government"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "History",
          "Nigerian History",
          "Economics",
          "Geography",
          "Christian Religious Studies",
          "Islamic Studies",
          "Civic Education",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Civil Law": {
    requiredJamb: [],
    oneOfJamb: [
      {
        label: "Law UTME subjects",
        subjects: ["Literature in English", "Government"],
        required: 2,
      },
      {
        label: "Additional relevant subject",
        subjects: [
          "History",
          "Economics",
          "Geography",
          "Christian Religious Studies",
          "Islamic Religious Studies",
        ],
        required: 1,
      },
    ],
    requiredOlevel: ["English Language", "Literature-in-English", "Government"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "History",
          "Nigerian History",
          "Economics",
          "Geography",
          "Christian Religious Studies",
          "Islamic Studies",
          "Civic Education",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "History and International Studies": {
    requiredJamb: ["History"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "Economics",
          "Geography",
          "Literature in English",
          "Christian Religious Studies",
          "Islamic Religious Studies",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "Nigerian History"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "Economics",
          "Geography",
          "Literature-in-English",
          "Christian Religious Studies",
          "Islamic Studies",
          "Civic Education",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Arabic Language and Literature": {
    requiredJamb: ["Arabic"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Literature in English",
          "Government",
          "History",
          "Economics",
          "Islamic Religious Studies",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "Arabic"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Literature-in-English",
          "Government",
          "History",
          "Nigerian History",
          "Economics",
          "Islamic Studies",
          "Civic Education",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Christian Religious Studies": {
    requiredJamb: ["Christian Religious Studies"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "History",
          "Government",
          "Economics",
          "Literature in English",
          "Geography",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "Christian Religious Studies"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "History",
          "Nigerian History",
          "Economics",
          "Literature-in-English",
          "Geography",
          "Civic Education",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Islamic Studies": {
    requiredJamb: ["Islamic Religious Studies"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "History",
          "Government",
          "Economics",
          "Literature in English",
          "Geography",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "Islamic Studies"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "History",
          "Nigerian History",
          "Economics",
          "Literature-in-English",
          "Geography",
          "Civic Education",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  French: {
    requiredJamb: ["French"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Literature in English",
          "Government",
          "History",
          "Economics",
          "Geography",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "French"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Literature-in-English",
          "Government",
          "History",
          "Nigerian History",
          "Economics",
          "Geography",
          "Civic Education",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Music: {
    requiredJamb: ["Music"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Literature in English",
          "Government",
          "History",
          "Economics",
          "Christian Religious Studies",
          "Islamic Religious Studies",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "Music"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Literature-in-English",
          "Government",
          "History",
          "Nigerian History",
          "Economics",
          "Christian Religious Studies",
          "Islamic Studies",
          "Civic Education",
          "Visual Art",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Philosophy: {
    requiredJamb: [],
    oneOfJamb: [
      {
        label: "Any three JAMB subjects",
        anySubject: true,
        required: 3,
      },
    ],
    requiredOlevel: ["English Language"],
    oneOfOlevel: [
      {
        label: "Any four additional O-Level subjects",
        anySubject: true,
        required: 4,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Theatre Arts": {
    requiredJamb: ["Literature in English"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "History",
          "Economics",
          "Christian Religious Studies",
          "Islamic Religious Studies",
          "Music",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "Literature-in-English"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "History",
          "Nigerian History",
          "Economics",
          "Geography",
          "Civic Education",
          "Christian Religious Studies",
          "Islamic Studies",
          "Music",
          "Visual Art",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Theatre Arts and Music": {
    requiredJamb: ["Literature in English"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "History",
          "Economics",
          "Christian Religious Studies",
          "Islamic Religious Studies",
          "Music",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "Literature-in-English"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "History",
          "Nigerian History",
          "Economics",
          "Geography",
          "Civic Education",
          "Christian Religious Studies",
          "Islamic Studies",
          "Music",
          "Visual Art",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Yoruba Language and Communication Arts": {
    requiredJamb: ["Yoruba"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Literature in English",
          "Government",
          "History",
          "Economics",
          "Geography",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "Yoruba Language"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Literature-in-English",
          "Government",
          "History",
          "Nigerian History",
          "Economics",
          "Geography",
          "Civic Education",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Medicine: {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  "Medicine and Surgery": {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  Dentistry: {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  "Dental Surgery": {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  "Nursing Science": {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  "Medical Laboratory Science": {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  Pharmacology: {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  Physiotherapy: {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  Physiology: {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  Biochemistry: {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  Microbiology: {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  Botany: {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  Zoology: {
    requiredJamb: ["Biology", "Chemistry", "Physics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    minimumRelevantCredits: 5,
  },

  "Fisheries and Aquatic Biology": {
    requiredJamb: ["Biology", "Chemistry"],
    oneOfJamb: [
      {
        label: "Additional relevant subject",
        subjects: ["Physics", "Agricultural Science"],
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
      "Chemistry",
    ],
    oneOfOlevel: [
      {
        label: "Additional relevant subject",
        subjects: ["Physics", "Agriculture", "Geography"],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Chemistry: {
    requiredJamb: ["Chemistry", "Physics", "Mathematics"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Chemistry",
      "Physics",
    ],
    oneOfOlevel: [
      {
        label: "Additional science subject",
        subjects: ["Biology", "Agriculture", "Further Mathematics"],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Physics: {
    requiredJamb: ["Physics", "Mathematics", "Chemistry"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
      "Chemistry",
    ],
    oneOfOlevel: [
      {
        label: "Additional science subject",
        subjects: ["Further Mathematics", "Biology", "Agriculture"],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Mathematics: {
    requiredJamb: ["Mathematics", "Physics", "Chemistry"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
      "Chemistry",
    ],
    oneOfOlevel: [
      {
        label: "Additional science subject",
        subjects: [
          "Further Mathematics",
          "Biology",
          "Agriculture",
          "Economics",
        ],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Chemical and Polymer Engineering": {
    requiredJamb: ["Mathematics", "Physics", "Chemistry"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
      "Chemistry",
    ],
    oneOfOlevel: [
      {
        label: "Additional science subject",
        subjects: ["Biology", "Agriculture", "Further Mathematics"],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Civil Engineering": {
    requiredJamb: ["Mathematics", "Physics", "Chemistry"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
      "Chemistry",
    ],
    oneOfOlevel: [
      {
        label: "Additional relevant subject",
        subjects: [
          "Further Mathematics",
          "Technical Drawing",
          "Biology",
          "Agriculture",
        ],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Mechanical Engineering": {
    requiredJamb: ["Mathematics", "Physics", "Chemistry"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
      "Chemistry",
    ],
    oneOfOlevel: [
      {
        label: "Additional relevant subject",
        subjects: [
          "Further Mathematics",
          "Technical Drawing",
          "Biology",
          "Agriculture",
        ],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Electronic and Computer Engineering": {
    requiredJamb: ["Mathematics", "Physics", "Chemistry"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
      "Chemistry",
    ],
    oneOfOlevel: [
      {
        label: "Additional relevant subject",
        subjects: [
          "Further Mathematics",
          "Technical Drawing",
          "Biology",
          "Computer Hardware and GSM Repairs",
        ],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Aerospace Engineering": {
    requiredJamb: ["Mathematics", "Physics", "Chemistry"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
      "Chemistry",
    ],
    oneOfOlevel: [
      {
        label: "Additional relevant subject",
        subjects: [
          "Further Mathematics",
          "Technical Drawing",
          "Biology",
        ],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Computer Science": {
    requiredJamb: ["Mathematics", "Physics"],
    oneOfJamb: [
      {
        label: "Additional relevant subject",
        subjects: [
          "Chemistry",
          "Economics",
          "Biology",
          "Further Mathematics",
          "Computer Studies",
        ],
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
    ],
    oneOfOlevel: [
      {
        label: "Additional relevant subjects",
        subjects: [
          "Chemistry",
          "Biology",
          "Further Mathematics",
          "Computer Hardware and GSM Repairs",
          "Economics",
          "Agriculture",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Software Engineering": {
    requiredJamb: ["Mathematics", "Physics"],
    oneOfJamb: [
      {
        label: "Additional relevant subject",
        subjects: [
          "Chemistry",
          "Economics",
          "Biology",
          "Further Mathematics",
          "Computer Studies",
        ],
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
    ],
    oneOfOlevel: [
      {
        label: "Additional relevant subjects",
        subjects: [
          "Chemistry",
          "Biology",
          "Further Mathematics",
          "Computer Hardware and GSM Repairs",
          "Economics",
          "Agriculture",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Cyber Security": {
    requiredJamb: ["Mathematics", "Physics"],
    oneOfJamb: [
      {
        label: "Additional relevant subject",
        subjects: [
          "Chemistry",
          "Economics",
          "Biology",
          "Further Mathematics",
          "Computer Studies",
        ],
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
    ],
    oneOfOlevel: [
      {
        label: "Additional relevant subjects",
        subjects: [
          "Chemistry",
          "Biology",
          "Further Mathematics",
          "Computer Hardware and GSM Repairs",
          "Economics",
          "Agriculture",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Information Technology": {
    requiredJamb: ["Mathematics", "Physics"],
    oneOfJamb: [
      {
        label: "Additional relevant subject",
        subjects: [
          "Chemistry",
          "Economics",
          "Biology",
          "Further Mathematics",
          "Computer Studies",
        ],
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
    ],
    oneOfOlevel: [
      {
        label: "Additional relevant subjects",
        subjects: [
          "Chemistry",
          "Biology",
          "Further Mathematics",
          "Computer Hardware and GSM Repairs",
          "Economics",
          "Agriculture",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Science Education": {
    requiredJamb: [],
    oneOfJamb: [
      {
        label: "Any three science subjects",
        subjects: [
          "Biology",
          "Chemistry",
          "Physics",
          "Agricultural Science",
          "Geography",
          "Further Mathematics",
        ],
        required: 3,
      },
    ],
    requiredOlevel: ["English Language", "General Mathematics"],
    oneOfOlevel: [
      {
        label: "Science subjects",
        subjects: [
          "Biology",
          "Chemistry",
          "Physics",
          "Agriculture",
          "Further Mathematics",
          "Geography",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Technology Education": {
    requiredJamb: ["Mathematics", "Physics", "Chemistry"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
    ],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Chemistry",
          "Further Mathematics",
          "Technical Drawing",
          "Computer Hardware and GSM Repairs",
          "Agriculture",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Arts Education": {
    requiredJamb: ["Literature in English"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Government",
          "History",
          "Economics",
          "Geography",
          "Christian Religious Studies",
          "Islamic Religious Studies",
          "French",
          "Music",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language"],
    oneOfOlevel: [
      {
        label: "Arts subjects",
        subjects: [
          "Literature-in-English",
          "Government",
          "History",
          "Nigerian History",
          "Economics",
          "Geography",
          "Civic Education",
          "Christian Religious Studies",
          "Islamic Studies",
          "Arabic",
          "French",
          "Music",
          "Visual Art",
        ],
        required: 4,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Early Childhood Education": {
    requiredJamb: [],
    oneOfJamb: [
      {
        label: "Relevant Arts subjects",
        category: "artsRelated",
        required: 3,
      },
    ],
    requiredOlevel: ["English Language", "General Mathematics"],
    oneOfOlevel: [
      {
        label: "Relevant Arts subjects",
        category: "artsRelated",
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Educational Management": {
    requiredJamb: [],
    oneOfJamb: [
      {
        label: "Relevant Social Science subjects",
        category: "socialScience",
        required: 3,
      },
    ],
    requiredOlevel: ["English Language", "General Mathematics"],
    oneOfOlevel: [
      {
        label: "Relevant Social Science subjects",
        category: "socialScience",
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Guidance and Counselling": {
    requiredJamb: [],
    oneOfJamb: [
      {
        label: "Relevant Social Science subjects",
        category: "socialScience",
        required: 3,
      },
    ],
    requiredOlevel: ["English Language", "General Mathematics"],
    oneOfOlevel: [
      {
        label: "Relevant Social Science subjects",
        category: "socialScience",
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Architecture: {
    requiredJamb: ["Mathematics", "Physics"],
    oneOfJamb: [
      {
        label: "Additional relevant subject",
        subjects: ["Chemistry", "Economics", "Geography"],
        required: 1,
      },
    ],
    requiredOlevel: ["English Language", "General Mathematics"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Physics",
          "Chemistry",
          "Technical Drawing",
          "Visual Art",
          "Geography",
          "Further Mathematics",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Transport Management": {
    requiredJamb: ["Mathematics"],
    oneOfJamb: [
      {
        label: "Relevant subjects",
        subjects: [
          "Economics",
          "Geography",
          "Government",
          "Commerce",
          "Accounting",
          "Physics",
        ],
        required: 2,
      },
    ],
    requiredOlevel: ["English Language", "General Mathematics"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
        subjects: [
          "Economics",
          "Geography",
          "Government",
          "Commerce",
          "Accounting",
          "Physics",
          "Civic Education",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },
};

const courses = Object.keys(courseRequirements).sort((a, b) =>
  a.localeCompare(b)
);

function getGroupSubjects(group: RequirementGroup): string[] {
  if (group.anySubject) {
    return [];
  }

  if (group.subjects) {
    return group.subjects;
  }

  if (group.category) {
    return subjectCategories[group.category] ?? [];
  }

  return [];
}

function uniqueValues(values: string[]) {
  return [...new Set(values)];
}

function countSatisfiedSubjects(
  selectedSubjects: string[],
  group: RequirementGroup,
  excludedSubjects: string[] = []
) {
  const filtered = uniqueValues(selectedSubjects).filter(
    (subject) => !excludedSubjects.includes(subject)
  );

  if (group.anySubject) {
    return filtered.length;
  }

  const allowed = getGroupSubjects(group);

  return filtered.filter((subject) =>
    allowed.includes(subject)
  ).length;
}

function groupSatisfied(
  selectedSubjects: string[],
  group: RequirementGroup,
  excludedSubjects: string[] = []
) {
  return (
    countSatisfiedSubjects(
      selectedSubjects,
      group,
      excludedSubjects
    ) >= group.required
  );
}

function getRelevantSubjectPool(
  requirement: CourseRequirement
) {
  const groups = requirement.oneOfOlevel ?? [];

  const subjects = [
    ...requirement.requiredOlevel,
    ...groups.flatMap((group) =>
      group.anySubject
        ? oLevelSubjects
        : getGroupSubjects(group)
    ),
  ];

  return uniqueValues(subjects);
}

/* -------------------------------------------------------
   PDF GENERATOR
------------------------------------------------------- */

function escapePdfText(text: string) {
  return text
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function createPdfDocument(lines: string[]) {
  const pageWidth = 595;
  const pageHeight = 842;
  const leftMargin = 45;
  const rightMargin = 45;
  const topMargin = 55;
  const bottomMargin = 55;
  const lineHeight = 15;
  const usableHeight =
    pageHeight - topMargin - bottomMargin;
  const maxLinesPerPage = Math.floor(
    usableHeight / lineHeight
  );

  const cleanedLines = lines
    .map((line) =>
      line
        .replace(/[^\x20-\x7E]/g, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .flatMap((line) => {
      if (!line) return [""];
      return wrapPdfLine(
        line,
        pageWidth - leftMargin - rightMargin,
        10
      );
    });

  const pages: string[][] = [];

  for (
    let i = 0;
    i < cleanedLines.length;
    i += maxLinesPerPage
  ) {
    pages.push(
      cleanedLines.slice(
        i,
        i + maxLinesPerPage
      )
    );
  }

  if (pages.length === 0) {
    pages.push(["LASU Eligibility Report"]);
  }

  const catalogObject = 1;
  const pagesObject = 2;
  const regularFontObject = 3;
  const boldFontObject = 4;

  const pageObjects = pages.map(
    (_, index) =>
      5 + index * 2
  );

  const contentObjects = pages.map(
    (_, index) =>
      6 + index * 2
  );

  const maxObject =
    4 + pages.length * 2;

  const objects = new Map<
    number,
    string
  >();

  objects.set(
    catalogObject,
    `<< /Type /Catalog /Pages ${pagesObject} 0 R >>`
  );

  objects.set(
    pagesObject,
    `<< /Type /Pages /Kids [${pageObjects
      .map(
        (number) =>
          `${number} 0 R`
      )
      .join(" ")}] /Count ${pages.length} >>`
  );

  objects.set(
    regularFontObject,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  );

  objects.set(
    boldFontObject,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  );

  pages.forEach(
    (page, pageIndex) => {
      const pageObject =
        pageObjects[pageIndex];

      const contentObject =
        contentObjects[pageIndex];

      const textCommands: string[] = [
        "BT",
      ];

      page.forEach(
        (line, lineIndex) => {
          const y =
            pageHeight -
            topMargin -
            lineIndex *
              lineHeight;

          const isHeading =
            [
              "S.O.H CONSULTS",
              "LASU AGGREGATE & ELIGIBILITY REPORT",
              "Candidate Information",
              "JAMB UTME",
              "O-LEVEL RESULTS",
              "BEST FIVE RELEVANT O-LEVEL RESULTS",
              "AGGREGATE",
              "ASSESSMENT",
              "Validation Notes",
              "IMPORTANT DISCLAIMER",
            ].includes(line);

          textCommands.push(
            isHeading
              ? "/F2 10 Tf"
              : "/F1 9 Tf"
          );

          textCommands.push(
            `1 0 0 1 ${leftMargin} ${y} Tm`
          );

          textCommands.push(
            `(${escapePdfText(
              line
            )}) Tj`
          );
        }
      );

      textCommands.push("ET");

      const stream =
        textCommands.join(
          "\n"
        );

      objects.set(
        pageObject,
        `<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${regularFontObject} 0 R /F2 ${boldFontObject} 0 R >> >> /Contents ${contentObject} 0 R >>`
      );

      objects.set(
        contentObject,
        `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
      );
    }
  );

  let pdf = "%PDF-1.4\n";

  const offsets: number[] =
    new Array(
      maxObject + 1
    ).fill(0);

  for (
    let objectNumber = 1;
    objectNumber <= maxObject;
    objectNumber++
  ) {
    offsets[objectNumber] =
      pdf.length;

    pdf += `${objectNumber} 0 obj\n`;
    pdf += `${
      objects.get(
        objectNumber
      ) ?? ""
    }\n`;
    pdf += "endobj\n";
  }

  const xrefOffset =
    pdf.length;

  pdf += `xref\n`;
  pdf += `0 ${
    maxObject + 1
  }\n`;
  pdf +=
    "0000000000 65535 f \n";

  for (
    let objectNumber = 1;
    objectNumber <= maxObject;
    objectNumber++
  ) {
    pdf += `${String(
      offsets[objectNumber]
    ).padStart(
      10,
      "0"
    )} 00000 n \n`;
  }

  pdf += `trailer\n`;
  pdf += `<< /Size ${
    maxObject + 1
  } /Root ${catalogObject} 0 R >>\n`;
  pdf += `startxref\n`;
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF";

  return pdf;
}

function wrapPdfLine(
  text: string,
  maxWidth: number,
  fontSize: number
) {
  const approximateCharWidth =
    fontSize * 0.52;

  const maxCharacters = Math.max(
    20,
    Math.floor(
      maxWidth /
        approximateCharWidth
    )
  );

  if (
    text.length <=
    maxCharacters
  ) {
    return [text];
  }

  const words =
    text.split(" ");

  const lines: string[] = [];

  let current = "";

  words.forEach((word) => {
    const candidate = current
      ? `${current} ${word}`
      : word;

    if (
      candidate.length <=
      maxCharacters
    ) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
      }

      current = word;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

/* -------------------------------------------------------
   REPORT HELPERS
------------------------------------------------------- */

function getSafeCandidateName(
  candidateName: string
) {
  return (
    candidateName
      .trim()
      .replace(
        /[^a-zA-Z0-9]+/g,
        "_"
      )
      .replace(
        /^_+|_+$/g,
        ""
      ) ||
    "Candidate"
  );
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const words =
    text.split(" ");

  const lines: string[] = [];

  let currentLine = "";

  words.forEach(
    (word) => {
      const testLine =
        currentLine
          ? `${currentLine} ${word}`
          : word;

      if (
        context.measureText(
          testLine
        ).width <=
        maxWidth
      ) {
        currentLine =
          testLine;
      } else {
        if (currentLine) {
          lines.push(
            currentLine
          );
        }

        currentLine = word;
      }
    }
  );

  if (currentLine) {
    lines.push(
      currentLine
    );
  }

  return lines;
}

function createReportLines(
  candidateName: string,
  course: string,
  jambScore: string,
  selectedJambSubjects: string[],
  completedOLevelResults: OLevelEntry[],
  validation: {
    eligible: boolean;
    jambCutoffValid: boolean;
    messages: string[];
    score: number | null;
    bestFive: OLevelEntry[];
  },
  liveCalculator: {
    jambPoints: number;
    oLevelPoints: number;
  }
) {
  const status =
    validation.eligible
      ? "ELIGIBLE"
      : "NOT ELIGIBLE";

  const reportJambSubjects = [
    "Use of English",
    ...selectedJambSubjects,
  ];

  const reportOLevelResults =
    completedOLevelResults.length >
    0
      ? completedOLevelResults.map(
          (entry) =>
            `${entry.subject}: ${entry.grade}`
        )
      : [
          "No completed O-Level result entered",
        ];

  const bestFiveResults =
    validation.bestFive.length >
    0
      ? validation.bestFive.map(
          (entry) =>
            `${entry.subject}: ${entry.grade}`
        )
      : ["Not available"];

  return [
    "S.O.H CONSULTS",
    "LASU AGGREGATE & ELIGIBILITY REPORT",
    "",
    "Candidate Information",
    `Candidate Name: ${
      candidateName.trim() ||
      "Not provided"
    }`,
    `Selected Course: ${
      course || "Not selected"
    }`,
    `Eligibility Status: ${status}`,
    "",
    "JAMB UTME",
    `JAMB Score: ${
      jambScore || "Not provided"
    }`,
    `LASU Minimum Cut-off: ${LASU_CUTOFF_MARK}`,
    `JAMB Cut-off Status: ${
      validation.jambCutoffValid
        ? "Passed"
        : "Failed"
    }`,
    `JAMB Points: ${liveCalculator.jambPoints.toFixed(
      2
    )} / 60`,
    "Selected JAMB Subjects:",
    ...reportJambSubjects.map(
      (subject) =>
        `- ${subject}`
    ),
    "",
    "O-LEVEL RESULTS",
    `Completed Results: ${completedOLevelResults.length} / 9`,
    ...reportOLevelResults.map(
      (result) =>
        `- ${result}`
    ),
    "",
    "BEST FIVE RELEVANT O-LEVEL RESULTS",
    ...bestFiveResults.map(
      (result) =>
        `- ${result}`
    ),
    "",
    "AGGREGATE",
    `O-Level Points: ${liveCalculator.oLevelPoints} / 40`,
    `Estimated Aggregate: ${
      validation.score !==
      null
        ? `${validation.score.toFixed(
            2
          )} / 100`
        : "Not available"
    }`,
    "",
    "ASSESSMENT",
    validation.eligible
      ? "The candidate satisfies the entered LASU screening requirements for the selected course."
      : "The candidate does not satisfy one or more of the entered LASU screening requirements.",
    "",
    "Validation Notes",
    ...(validation.messages
      .length > 0
      ? validation.messages
          .slice(0, 12)
          .map(
            (message) =>
              `- ${message}`
          )
      : [
          "- No validation errors.",
        ]),
    "",
    "IMPORTANT DISCLAIMER",
    "This report is generated by S.O.H CONSULTS for guidance and self-screening purposes.",
    "It is not an official LASU admission letter, screening result, or guarantee of admission.",
    "LASU Course Requirements Checker: https://services.lidc.lasu.edu.ng/admissionscreening/courserequirement/index.php",
    "Requirements are presented by LASU as listed in the JAMB Brochure.",
    `Generated: ${new Date().toLocaleString(
      "en-NG"
    )}`,
  ];
}

export default function LASUCalculator() {
  const [candidateName, setCandidateName] =
    useState("");

  const [course, setCourse] =
    useState("");

  const [jambScore, setJambScore] =
    useState("");

  const [jambElectives, setJambElectives] =
    useState<string[]>([
      "",
      "",
      "",
    ]);

  const [oLevel, setOLevel] =
    useState<OLevelEntry[]>([
      {
        subject:
          "English Language",
        grade: "",
      },
      ...Array.from(
        { length: 8 },
        () => ({
          subject: "",
          grade: "",
        })
      ),
    ]);

  const [checked, setChecked] =
    useState(false);

  const requirement =
    course
      ? courseRequirements[
          course
        ]
      : undefined;

  const completedOLevelResults =
    useMemo(
      () =>
        oLevel.filter(
          (entry) =>
            entry.subject &&
            entry.grade
        ),
      [oLevel]
    );

  const selectedJambSubjects =
    useMemo(
      () =>
        jambElectives.filter(
          Boolean
        ),
      [jambElectives]
    );

  const liveCalculator =
    useMemo(() => {
      const numericJambScore =
        Number(jambScore);

      const validJambScore =
        jambScore !== "" &&
        Number.isFinite(
          numericJambScore
        ) &&
        numericJambScore >= 0 &&
        numericJambScore <= 400;

      const jambPoints =
        validJambScore
          ? numericJambScore *
            0.15
          : 0;

      const relevantPool =
        requirement
          ? getRelevantSubjectPool(
              requirement
            )
          : [];

      const relevantEntries =
        oLevel.filter(
          (entry) =>
            entry.subject &&
            entry.grade &&
            (!requirement ||
              relevantPool.includes(
                entry.subject
              )) &&
            gradePoints[
              entry.grade
            ] !==
              undefined &&
            gradePoints[
              entry.grade
            ] > 0
        );

      const bestFive = [
        ...relevantEntries,
      ]
        .sort(
          (a, b) =>
            (gradePoints[
              b.grade
            ] ?? 0) -
            (gradePoints[
              a.grade
            ] ?? 0)
        )
        .slice(0, 5);

      const oLevelPoints =
        bestFive.reduce(
          (
            total,
            entry
          ) =>
            total +
            (gradePoints[
              entry.grade
            ] ?? 0),
          0
        );

      const aggregate =
        jambPoints +
        oLevelPoints;

      return {
        validJambScore,
        jambPoints,
        oLevelPoints,
        aggregate,
        bestFive,
        creditCount:
          relevantEntries.length,
      };
    }, [
      jambScore,
      oLevel,
      requirement,
    ]);

  const validation =
    useMemo(() => {
      const messages: string[] =
        [];

      if (
        !candidateName.trim()
      ) {
        messages.push(
          "Enter the candidate name."
        );
      }

      if (!course) {
        messages.push(
          "Select a course."
        );
      }

      if (!jambScore) {
        messages.push(
          "Enter your JAMB score."
        );
      }

      const numericJambScore =
        Number(jambScore);

      const jambScoreValid =
        jambScore !== "" &&
        Number.isFinite(
          numericJambScore
        ) &&
        numericJambScore >= 0 &&
        numericJambScore <= 400;

      const jambCutoffValid =
        jambScoreValid &&
        numericJambScore >=
          LASU_CUTOFF_MARK;

      if (
        jambScoreValid &&
        !jambCutoffValid
      ) {
        messages.push(
          `JAMB score below LASU minimum cut-off mark of ${LASU_CUTOFF_MARK}. Candidate is disqualified.`
        );
      }

      if (!requirement) {
        messages.push(
          "Select a course to continue."
        );
      }

      const duplicateJambSubjects =
        uniqueValues(
          selectedJambSubjects
        ).length !==
        selectedJambSubjects.length;

      if (
        selectedJambSubjects.length !==
        3
      ) {
        messages.push(
          "Select exactly 3 JAMB subjects in addition to Use of English."
        );
      }

      if (
        duplicateJambSubjects
      ) {
        messages.push(
          "JAMB subjects must not contain duplicates."
        );
      }

      let jambValid = false;

      if (requirement) {
        const requiredJambSatisfied =
          requirement.requiredJamb.every(
            (subject) =>
              selectedJambSubjects.includes(
                subject
              )
          );

        const oneOfJambSatisfied =
          requirement.oneOfJamb?.every(
            (group) =>
              groupSatisfied(
                selectedJambSubjects,
                group
              )
          ) ?? true;

        jambValid =
          selectedJambSubjects.length ===
            3 &&
          !duplicateJambSubjects &&
          requiredJambSatisfied &&
          oneOfJambSatisfied &&
          jambCutoffValid;

        if (
          !requiredJambSatisfied
        ) {
          requirement.requiredJamb.forEach(
            (subject) => {
              if (
                !selectedJambSubjects.includes(
                  subject
                )
              ) {
                messages.push(
                  `${subject} is required for ${course}.`
                );
              }
            }
          );
        }

        requirement.oneOfJamb?.forEach(
          (group) => {
            if (
              !groupSatisfied(
                selectedJambSubjects,
                group
              )
            ) {
              messages.push(
                `${group.label}: select at least ${group.required} qualifying subject(s).`
              );
            }
          }
        );
      }

      const duplicateOLevelSubjects =
        uniqueValues(
          completedOLevelResults.map(
            (entry) =>
              entry.subject
          )
        ).length !==
        completedOLevelResults.length;

      if (
        completedOLevelResults.length <
          5 ||
        completedOLevelResults.length >
          9
      ) {
        messages.push(
          "Select between 5 and 9 completed O-Level results."
        );
      }

      if (
        duplicateOLevelSubjects
      ) {
        messages.push(
          "O-Level subjects must not contain duplicates."
        );
      }

      let oLevelValid = false;

      if (requirement) {
        const creditEntries =
          completedOLevelResults.filter(
            (entry) =>
              gradePoints[
                entry.grade
              ] !==
                undefined &&
              gradePoints[
                entry.grade
              ] > 0
          );

        const requiredOlevelSatisfied =
          requirement.requiredOlevel.every(
            (subject) =>
              completedOLevelResults.some(
                (entry) =>
                  entry.subject ===
                    subject &&
                  (gradePoints[
                    entry.grade
                  ] ?? 0) > 0
              )
          );

        const oneOfOlevelSatisfied =
          requirement.oneOfOlevel?.every(
            (group) =>
              groupSatisfied(
                completedOLevelResults
                  .filter(
                    (entry) =>
                      (gradePoints[
                        entry.grade
                      ] ?? 0) > 0
                  )
                  .map(
                    (entry) =>
                      entry.subject
                  ),
                group,
                group.anySubject
                  ? requirement.requiredOlevel
                  : []
              )
          ) ?? true;

        const relevantPool =
          getRelevantSubjectPool(
            requirement
          );

        const relevantCredits =
          completedOLevelResults.filter(
            (entry) =>
              relevantPool.includes(
                entry.subject
              ) &&
              (gradePoints[
                entry.grade
              ] ?? 0) > 0
          );

        const bestFive = [
          ...relevantCredits,
        ]
          .sort(
            (a, b) =>
              (gradePoints[
                b.grade
              ] ?? 0) -
              (gradePoints[
                a.grade
              ] ?? 0)
          )
          .slice(0, 5);

        const hasFiveRelevantCredits =
          bestFive.length >= 5;

        if (
          !requiredOlevelSatisfied
        ) {
          requirement.requiredOlevel.forEach(
            (subject) => {
              const hasCredit =
                completedOLevelResults.some(
                  (entry) =>
                    entry.subject ===
                      subject &&
                    (gradePoints[
                      entry.grade
                    ] ?? 0) > 0
                );

              if (!hasCredit) {
                messages.push(
                  `${subject} requires a credit pass.`
                );
              }
            }
          );
        }

        requirement.oneOfOlevel?.forEach(
          (group) => {
            if (
              !groupSatisfied(
                completedOLevelResults
                  .filter(
                    (entry) =>
                      (gradePoints[
                        entry.grade
                      ] ?? 0) > 0
                  )
                  .map(
                    (entry) =>
                      entry.subject
                  ),
                group,
                group.anySubject
                  ? requirement.requiredOlevel
                  : []
              )
            ) {
              messages.push(
                `${group.label}: select at least ${group.required} qualifying O-Level subject(s) with credit passes.`
              );
            }
          }
        );

        if (
          creditEntries.length <
          requirement.minimumRelevantCredits
        ) {
          messages.push(
            `At least ${requirement.minimumRelevantCredits} relevant O-Level credit passes are required.`
          );
        }

        if (
          !hasFiveRelevantCredits
        ) {
          messages.push(
            "At least five relevant O-Level credit passes are required for the aggregate calculation."
          );
        }

        oLevelValid =
          completedOLevelResults.length >=
            5 &&
          completedOLevelResults.length <=
            9 &&
          !duplicateOLevelSubjects &&
          requiredOlevelSatisfied &&
          oneOfOlevelSatisfied &&
          creditEntries.length >=
            requirement.minimumRelevantCredits &&
          hasFiveRelevantCredits;
      }

      const score =
        jambScoreValid &&
        oLevelValid
          ? liveCalculator.aggregate
          : null;

      return {
        eligible:
          candidateName.trim()
            .length > 0 &&
          jambValid &&
          oLevelValid &&
          jambCutoffValid,

        jambValid,
        oLevelValid,
        jambScoreValid,
        jambCutoffValid,
        messages,
        score,
        bestFive:
          liveCalculator.bestFive,
      };
    }, [
      candidateName,
      course,
      jambScore,
      selectedJambSubjects,
      completedOLevelResults,
      requirement,
      liveCalculator,
    ]);

  function updateJambSubject(
    index: number,
    value: string
  ) {
    setChecked(false);

    setJambElectives(
      (current) => {
        if (
          value &&
          current.some(
            (
              subject,
              optionIndex
            ) =>
              optionIndex !==
                index &&
              subject ===
                value
          )
        ) {
          return current;
        }

        const next = [
          ...current,
        ];

        next[index] =
          value;

        return next;
      }
    );
  }

  function updateOLevelSubject(
    index: number,
    value: string
  ) {
    setChecked(false);

    setOLevel(
      (current) => {
        if (
          value &&
          current.some(
            (
              entry,
              optionIndex
            ) =>
              optionIndex !==
                index &&
              entry.subject ===
                value
          )
        ) {
          return current;
        }

        const next = [
          ...current,
        ];

        next[index] = {
          ...next[index],
          subject: value,
        };

        return next;
      }
    );
  }

  function updateOLevelGrade(
    index: number,
    value: string
  ) {
    setChecked(false);

    setOLevel(
      (current) => {
        const next = [
          ...current,
        ];

        next[index] = {
          ...next[index],
          grade: value,
        };

        return next;
      }
    );
  }

  function resetCalculator() {
    setCandidateName("");
    setCourse("");
    setJambScore("");

    setJambElectives([
      "",
      "",
      "",
    ]);

    setOLevel([
      {
        subject:
          "English Language",
        grade: "",
      },
      ...Array.from(
        { length: 8 },
        () => ({
          subject: "",
          grade: "",
        })
      ),
    ]);

    setChecked(false);
  }

  function getCurrentReportLines() {
    return createReportLines(
      candidateName,
      course,
      jambScore,
      selectedJambSubjects,
      completedOLevelResults,
      validation,
      liveCalculator
    );
  }

  function downloadEligibilityReportPDF() {
    const lines =
      getCurrentReportLines();

    const pdf =
      createPdfDocument(
        lines
      );

    const blob =
      new Blob(
        [pdf],
        {
          type: "application/pdf",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    const safeCandidateName =
      getSafeCandidateName(
        candidateName
      );

    link.download =
      `LASU_Eligibility_Report_${safeCandidateName}.pdf`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    setTimeout(() => {
      URL.revokeObjectURL(
        url
      );
    }, 1000);
  }

  function downloadEligibilityReportJPG() {
    if (
      typeof document ===
      "undefined"
    ) {
      return;
    }

    const lines =
      getCurrentReportLines();

    const canvas =
      document.createElement(
        "canvas"
      );

    const width = 1400;
    const padding = 80;
    const lineWidth =
      width -
      padding * 2;

    const measuringContext =
      canvas.getContext(
        "2d"
      );

    if (!measuringContext) {
      return;
    }

    measuringContext.font =
      "400 20px Arial";

    const wrappedLines =
      lines.flatMap(
        (line) =>
          line
            ? wrapText(
                measuringContext,
                line,
                lineWidth
              )
            : [""]
      );

    const estimatedHeight =
      Math.max(
        1100,
        360 +
          wrappedLines.length *
            38 +
          160
      );

    canvas.width = width;
    canvas.height =
      estimatedHeight;

    const context =
      canvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    context.fillStyle =
      "#f8fafc";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle =
      "#15803d";

    context.fillRect(
      0,
      0,
      width,
      220
    );

    context.fillStyle =
      "#ffffff";

    context.font =
      "800 38px Arial";

    context.fillText(
      "S.O.H CONSULTS",
      padding,
      72
    );

    context.font =
      "800 46px Arial";

    context.fillText(
      "LASU Aggregate & Eligibility Report",
      padding,
      130
    );

    context.font =
      "400 22px Arial";

    context.fillText(
      `LASU Minimum UTME Cut-off: ${LASU_CUTOFF_MARK}`,
      padding,
      178
    );

    let y = 275;

    const status =
      validation.eligible
        ? "ELIGIBLE"
        : "NOT ELIGIBLE";

    context.fillStyle =
      validation.eligible
        ? "#dcfce7"
        : "#fee2e2";

    context.fillRect(
      padding,
      y - 35,
      lineWidth,
      100
    );

    context.fillStyle =
      validation.eligible
        ? "#166534"
        : "#991b1b";

    context.font =
      "800 34px Arial";

    context.fillText(
      `Eligibility Status: ${status}`,
      padding + 25,
      y + 10
    );

    context.font =
      "600 20px Arial";

    context.fillText(
      `Candidate: ${
        candidateName.trim() ||
        "Not provided"
      }`,
      padding + 25,
      y + 45
    );

    y += 125;

    const sectionTitles = [
      "Candidate Information",
      "JAMB UTME",
      "O-LEVEL RESULTS",
      "BEST FIVE RELEVANT O-LEVEL RESULTS",
      "AGGREGATE",
      "ASSESSMENT",
      "Validation Notes",
      "IMPORTANT DISCLAIMER",
    ];

    lines.forEach(
      (line) => {
        if (
          sectionTitles.includes(
            line
          )
        ) {
          context.font =
            "800 27px Arial";

          context.fillStyle =
            "#166534";

          context.fillText(
            line,
            padding,
            y
          );

          y += 42;

          return;
        }

        if (!line) {
          y += 15;
          return;
        }

        context.font =
          "400 20px Arial";

        context.fillStyle =
          "#334155";

        const wrapped =
          wrapText(
            context,
            line,
            lineWidth
          );

        wrapped.forEach(
          (
            wrappedLine
          ) => {
            context.fillText(
              wrappedLine,
              padding,
              y
            );

            y += 31;
          }
        );

        y += 8;
      }
    );

    context.font =
      "400 16px Arial";

    context.fillStyle =
      "#64748b";

    context.fillText(
      "Generated by S.O.H CONSULTS • For guidance and self-screening purposes only.",
      padding,
      canvas.height - 45
    );

    const safeCandidateName =
      getSafeCandidateName(
        candidateName
      );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          `LASU_Eligibility_Report_${safeCandidateName}.jpg`;

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        setTimeout(() => {
          URL.revokeObjectURL(
            url
          );
        }, 1000);
      },
      "image/jpeg",
      0.95
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-6 text-white shadow-xl sm:p-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-100">
              S.O.H CONSULTS
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              LASU Aggregate & Eligibility Checker
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-green-50 sm:text-base">
              Check your estimated LASU aggregate and
              course eligibility using your JAMB score,
              JAMB subjects and O-Level results.
            </p>

            <div className="mt-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur">
              LASU UTME minimum cut-off:{" "}
              {LASU_CUTOFF_MARK}
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Candidate Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the candidate's details before
                checking eligibility.
              </p>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Candidate Name
                </label>

                <input
                  type="text"
                  placeholder="Enter candidate full name"
                  value={candidateName}
                  onChange={(event) => {
                    setCandidateName(
                      event.target.value
                    );

                    setChecked(false);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Course
                </label>

                <select
                  value={course}
                  onChange={(event) => {
                    setCourse(
                      event.target.value
                    );

                    setChecked(false);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  <option value="">
                    Select your course
                  </option>

                  {courses.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    JAMB UTME
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter your JAMB score and select
                    your three UTME subjects in addition
                    to compulsory Use of English.
                  </p>
                </div>

                <div className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                  Minimum:{" "}
                  {LASU_CUTOFF_MARK}
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  JAMB Score
                </label>

                <input
                  type="number"
                  min="0"
                  max="400"
                  placeholder="e.g. 245"
                  value={jambScore}
                  onChange={(event) => {
                    setJambScore(
                      event.target.value
                    );

                    setChecked(false);
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                    jambScore !== "" &&
                    Number(jambScore) <
                      LASU_CUTOFF_MARK
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 bg-white focus:border-green-600 focus:ring-green-100"
                  }`}
                />

                {jambScore !== "" &&
                  Number(jambScore) <
                    LASU_CUTOFF_MARK && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      JAMB score below{" "}
                      {LASU_CUTOFF_MARK}.
                      Candidate is
                      disqualified for
                      LASU screening.
                    </p>
                  )}
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  UTME Subject 1
                </label>

                <input
                  type="text"
                  value="Use of English"
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500"
                />

                <p className="mt-2 text-xs font-semibold text-green-700">
                  Compulsory
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {jambElectives.map(
                  (value, index) => (
                    <div key={index}>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        UTME Subject{" "}
                        {index + 2}
                      </label>

                      <select
                        value={value}
                        onChange={(event) =>
                          updateJambSubject(
                            index,
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      >
                        <option value="">
                          Select subject
                        </option>

                        {jambSubjects.map(
                          (subject) => (
                            <option
                              key={subject}
                              value={subject}
                              disabled={jambElectives.some(
                                (
                                  selected,
                                  optionIndex
                                ) =>
                                  optionIndex !==
                                    index &&
                                  selected ===
                                    subject
                              )}
                            >
                              {subject}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )
                )}
              </div>

              {course ===
                "Philosophy" && (
                <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800 ring-1 ring-blue-100">
                  <span className="font-bold">
                    Philosophy:
                  </span>{" "}
                  Use of English is
                  compulsory, while the
                  other three JAMB
                  subjects can be any
                  JAMB subjects.
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    O-Level Results
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter 5 to 9 O-Level results and
                    select your grades. English Language
                    is compulsory.
                  </p>
                </div>

                <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                  {
                    completedOLevelResults.length
                  }
                  /9
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {oLevel.map(
                  (entry, index) => (
                    <div
                      key={index}
                      className="grid gap-3 sm:grid-cols-[1fr_150px]"
                    >
                      <div>
                        {index ===
                        0 ? (
                          <input
                            value="English Language"
                            disabled
                            className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                          />
                        ) : (
                          <select
                            value={
                              entry.subject
                            }
                            onChange={(
                              event
                            ) =>
                              updateOLevelSubject(
                                index,
                                event.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                          >
                            <option value="">
                              Select O-Level subject
                            </option>

                            {oLevelSubjects
                              .filter(
                                (
                                  item
                                ) =>
                                  item !==
                                  "English Language"
                              )
                              .map(
                                (
                                  subject
                                ) => (
                                  <option
                                    key={
                                      subject
                                    }
                                    value={
                                      subject
                                    }
                                    disabled={oLevel.some(
                                      (
                                        selected,
                                        optionIndex
                                      ) =>
                                        optionIndex !==
                                          index &&
                                        selected.subject ===
                                          subject
                                    )}
                                  >
                                    {
                                      subject
                                    }
                                  </option>
                                )
                              )}
                          </select>
                        )}
                      </div>

                      <select
                        value={
                          entry.grade
                        }
                        onChange={(
                          event
                        ) =>
                          updateOLevelGrade(
                            index,
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      >
                        <option value="">
                          Select grade
                        </option>

                        {grades.map(
                          (grade) => (
                            <option
                              key={
                                grade
                              }
                              value={
                                grade
                              }
                            >
                              {grade}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )
                )}
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                You may enter between 5 and 9
                O-Level results. English Language is
                compulsory.
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    Live Aggregate
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Based on your current entries.
                  </p>
                </div>

                <p className="text-2xl font-black text-green-700">
                  {liveCalculator.aggregate.toFixed(
                    2
                  )}
                  /100
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                  <p className="text-xs text-slate-500">
                    JAMB Points
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {liveCalculator.jambPoints.toFixed(
                      2
                    )}
                    /60
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                  <p className="text-xs text-slate-500">
                    O-Level Points
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {
                      liveCalculator.oLevelPoints
                    }
                    /40
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                  <p className="text-xs text-slate-500">
                    Relevant Credits
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {
                      liveCalculator.creditCount
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  setChecked(true)
                }
                className="flex-1 rounded-xl bg-green-700 px-5 py-3.5 text-sm font-black text-white transition hover:bg-green-800"
              >
                Check Eligibility
              </button>

              <button
                type="button"
                onClick={
                  resetCalculator
                }
                className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>

            {checked && (
              <div className="mt-7">
                <div
                  className={`rounded-2xl p-5 ring-1 ${
                    validation.eligible
                      ? "bg-green-50 text-green-900 ring-green-200"
                      : "bg-red-50 text-red-900 ring-red-200"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">
                        Eligibility Result
                      </p>

                      <h3 className="mt-1 text-2xl font-black">
                        {validation.eligible
                          ? "Eligible"
                          : "Not Eligible"}
                      </h3>

                      <p className="mt-2 text-sm font-semibold">
                        Candidate:{" "}
                        {candidateName.trim() ||
                          "Not provided"}
                      </p>

                      {course && (
                        <p className="mt-1 text-sm">
                          Course:{" "}
                          {course}
                        </p>
                      )}
                    </div>

                    {validation.score !==
                      null && (
                      <div className="rounded-xl bg-white px-5 py-3 text-center shadow-sm ring-1 ring-black/5">
                        <p className="text-xs text-slate-500">
                          Estimated Aggregate
                        </p>

                        <p className="text-2xl font-black text-green-700">
                          {validation.score.toFixed(
                            2
                          )}
                          /100
                        </p>
                      </div>
                    )}
                  </div>

                  {!validation.jambCutoffValid &&
                    jambScore !== "" && (
                      <div className="mt-4 rounded-xl bg-red-100 p-3 text-sm font-bold text-red-800">
                        JAMB score is below LASU's
                        minimum cut-off mark of{" "}
                        {
                          LASU_CUTOFF_MARK
                        }
                        . The candidate is
                        disqualified regardless of
                        the calculated aggregate.
                      </div>
                    )}

                  {validation.messages.length >
                    0 && (
                    <div className="mt-5 rounded-xl bg-white/70 p-4">
                      <p className="text-sm font-black">
                        Requirements to review
                      </p>

                      <ul className="mt-2 space-y-1.5 text-sm">
                        {validation.messages
                          .slice(
                            0,
                            10
                          )
                          .map(
                            (
                              message,
                              index
                            ) => (
                              <li
                                key={
                                  index
                                }
                                className="flex gap-2"
                              >
                                <span>
                                  •
                                </span>

                                <span>
                                  {
                                    message
                                  }
                                </span>
                              </li>
                            )
                          )}
                      </ul>
                    </div>
                  )}

                  <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-sm font-bold text-slate-800">
                      JAMB subjects entered
                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {[
                        "Use of English",
                        ...selectedJambSubjects,
                      ].map(
                        (
                          subject,
                          index
                        ) => (
                          <div
                            key={`${subject}-${index}`}
                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                          >
                            <span className="font-medium text-slate-700">
                              {
                                subject
                              }
                            </span>

                            {index ===
                              0 && (
                              <span className="font-black text-green-700">
                                Compulsory
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-sm font-bold text-slate-800">
                      O-Level results entered
                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {completedOLevelResults.map(
                        (
                          entry,
                          index
                        ) => (
                          <div
                            key={`${entry.subject}-${index}`}
                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                          >
                            <span className="font-medium text-slate-700">
                              {
                                entry.subject
                              }
                            </span>

                            <span className="font-black text-green-700">
                              {
                                entry.grade
                              }
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    {completedOLevelResults.length ===
                      0 && (
                      <p className="mt-2 text-sm text-slate-500">
                        No completed O-Level result
                        has been entered yet.
                      </p>
                    )}
                  </div>

                  {validation.bestFive.length >
                    0 && (
                    <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                      <p className="text-sm font-bold text-slate-800">
                        Best five relevant O-Level
                        results
                      </p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {validation.bestFive.map(
                          (
                            entry,
                            index
                          ) => (
                            <div
                              key={`${entry.subject}-${index}`}
                              className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm"
                            >
                              <span className="font-medium text-slate-700">
                                {
                                  entry.subject
                                }
                              </span>

                              <span className="font-black text-green-700">
                                {
                                  entry.grade
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={
                        downloadEligibilityReportPDF
                      }
                      className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white transition hover:bg-slate-800"
                    >
                      📄 Download Report
                      (PDF)
                    </button>

                    <button
                      type="button"
                      onClick={
                        downloadEligibilityReportJPG
                      }
                      className="w-full rounded-xl bg-green-700 px-4 py-3.5 text-sm font-black text-white transition hover:bg-green-800"
                    >
                      🖼️ Download Report
                      (JPG)
                    </button>
                  </div>

                  <p className="mt-3 text-center text-xs text-slate-500">
                    Download your complete
                    eligibility report as a PDF or
                    JPG image.
                  </p>
                </div>
              </div>
            )}
          </section>

          <aside className="h-fit space-y-5">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-black text-slate-900">
                How the checker works
              </h2>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    1. JAMB score
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    LASU's current minimum UTME score
                    for the 2026/2027 screening is
                    195.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    2. JAMB subjects
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Use of English is compulsory, plus
                    three additional UTME subjects that
                    are checked against the selected
                    course requirements.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    3. O-Level
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Relevant O-Level credits are
                    checked against the selected
                    course requirements.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    4. Aggregate
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    JAMB contributes up to 60 points
                    and the best five relevant O-Level
                    grades contribute up to 40 points.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-green-700 p-5 text-white shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-green-100">
                S.O.H CONSULTS
              </p>

              <h2 className="mt-2 text-xl font-black">
                Need admission guidance?
              </h2>

              <p className="mt-2 text-sm leading-6 text-green-50">
                Get guidance with LASU admission
                screening, registration and related
                admission processes.
              </p>

              <div className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold">
                WhatsApp: 0818 214 1088
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-8 rounded-2xl bg-slate-900 px-5 py-5 text-center text-xs leading-5 text-slate-400">
          S.O.H CONSULTS • LASU Aggregate &
          Eligibility Checker
          <br />
          For guidance purposes only. This checker
          does not guarantee admission.
        </footer>
      </div>
    </main>
  );
}