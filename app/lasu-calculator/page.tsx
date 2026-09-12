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
  required: number;
};

type CourseRequirement = {
  requiredJamb: string[];
  oneOfJamb?: RequirementGroup[];
  requiredOlevel: string[];
  oneOfOlevel?: RequirementGroup[];
  minimumRelevantCredits: number;
};

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

const grades = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];

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
        label: "Any Social Science subject",
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
        label: "Any Social Science subject",
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
        label: "Any Social Science subject",
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
        label: "Any Social Science subject",
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
        label: "Any Social Science subject",
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
        label: "Any Social Science subject",
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
        label: "Any Social Science subject",
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
        label: "Any Social Science subject",
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
        label: "Any Social Science subject",
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
        label: "Third JAMB subject",
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
          "Commerce",
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
    requiredOlevel: [
      "English Language",
      "Literature-in-English",
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
    requiredOlevel: [
      "English Language",
      "Literature-in-English",
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
    requiredOlevel: [
      "English Language",
      "Christian Religious Studies",
    ],
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
        label: "Third JAMB subject",
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
        label: "Additional relevant subject",
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
        label: "Additional relevant subject",
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
        label: "Additional relevant subject",
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
        label: "Additional relevant subject",
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
        subjects: ["Further Mathematics", "Technical Drawing", "Biology"],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Computer Science": {
    requiredJamb: ["Mathematics", "Physics"],
    oneOfJamb: [
      {
        label: "Third JAMB subject",
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
        label: "Third JAMB subject",
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
        label: "Third JAMB subject",
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
        label: "Third JAMB subject",
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
        label: "Science JAMB subjects",
        subjects: ["Biology", "Chemistry", "Physics"],
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
        label: "Additional relevant subjects",
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
          "French",
          "Arabic",
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
        label: "Relevant JAMB subjects",
        category: "artsRelated",
        required: 3,
      },
    ],
    requiredOlevel: ["English Language", "General Mathematics"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
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
        label: "Relevant JAMB subjects",
        category: "socialScience",
        required: 3,
      },
    ],
    requiredOlevel: ["English Language", "General Mathematics"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
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
        label: "Relevant JAMB subjects",
        category: "socialScience",
        required: 3,
      },
    ],
    requiredOlevel: ["English Language", "General Mathematics"],
    oneOfOlevel: [
      {
        label: "Relevant subjects",
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
        label: "Third JAMB subject",
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
  group: RequirementGroup
) {
  const allowed = getGroupSubjects(group);

  return selectedSubjects.filter((subject) =>
    allowed.includes(subject)
  ).length;
}

function groupSatisfied(
  selectedSubjects: string[],
  group: RequirementGroup
) {
  return countSatisfiedSubjects(selectedSubjects, group) >= group.required;
}

function getRelevantSubjectPool(requirement: CourseRequirement) {
  const subjects = [
    ...requirement.requiredOlevel,
    ...(requirement.oneOfOlevel ?? []).flatMap(getGroupSubjects),
  ];

  return uniqueValues(subjects);
}

export default function LASUCalculator() {
  const [course, setCourse] = useState("");
  const [jambScore, setJambScore] = useState("");
  const [jambElectives, setJambElectives] = useState<string[]>([
    "",
    "",
    "",
  ]);

  const [oLevel, setOLevel] = useState<OLevelEntry[]>(
    Array.from({ length: 5 }, () => ({
      subject: "",
      grade: "",
    }))
  );

  const [checked, setChecked] = useState(false);

  const requirement = course ? courseRequirements[course] : undefined;

  const selectedOLevelSubjects = useMemo(
    () => oLevel.map((entry) => entry.subject).filter(Boolean),
    [oLevel]
  );

  const selectedJambSubjects = useMemo(
    () => jambElectives.filter(Boolean),
    [jambElectives]
  );

  const duplicateOLevelSubjects = useMemo(() => {
    const subjects = selectedOLevelSubjects;

    return subjects.filter(
      (subject, index) => subjects.indexOf(subject) !== index
    );
  }, [selectedOLevelSubjects]);

  const duplicateJambSubjects = useMemo(() => {
    const subjects = selectedJambSubjects;

    return subjects.filter(
      (subject, index) => subjects.indexOf(subject) !== index
    );
  }, [selectedJambSubjects]);

  /*
   * NEW LASU AGGREGATE FORMULA
   *
   * JAMB = JAMB SCORE x 0.15
   *
   * Maximum JAMB points:
   * 400 x 0.15 = 60
   *
   * O-Level:
   * Best 5 relevant subjects
   *
   * A1 = 8
   * B2 = 7
   * B3 = 6
   * C4 = 5
   * C5 = 4
   * C6 = 3
   *
   * Maximum O-Level points:
   * 8 x 5 = 40
   *
   * Maximum aggregate:
   * 60 + 40 = 100
   */

  const liveCalculator = useMemo(() => {
    const numericJambScore = Number(jambScore);

    const validJambScore =
      jambScore !== "" &&
      Number.isFinite(numericJambScore) &&
      numericJambScore >= 0 &&
      numericJambScore <= 400;

    const jambPoints = validJambScore
      ? numericJambScore * 0.15
      : 0;

    const relevantPool = requirement
      ? getRelevantSubjectPool(requirement)
      : [];

    const relevantEntries = oLevel.filter(
      (entry) =>
        entry.subject &&
        entry.grade &&
        (!requirement || relevantPool.includes(entry.subject)) &&
        gradePoints[entry.grade] !== undefined &&
        gradePoints[entry.grade] > 0
    );

    const bestFive = [...relevantEntries]
      .sort(
        (a, b) =>
          (gradePoints[b.grade] ?? 0) -
          (gradePoints[a.grade] ?? 0)
      )
      .slice(0, 5);

    const oLevelPoints = bestFive.reduce(
      (total, entry) =>
        total + (gradePoints[entry.grade] ?? 0),
      0
    );

    const aggregate = jambPoints + oLevelPoints;

    return {
      validJambScore,
      jambPoints,
      oLevelPoints,
      aggregate,
      bestFive,
      creditCount: relevantEntries.length,
    };
  }, [jambScore, oLevel, requirement]);

  const validation = useMemo(() => {
    if (!requirement) {
      return {
        eligible: false,
        jambValid: false,
        oLevelValid: false,
        messages: [],
        score: null as number | null,
        bestFive: [] as OLevelEntry[],
      };
    }

    const messages: string[] = [];
    const numericJambScore = Number(jambScore);

    if (
      jambScore === "" ||
      !Number.isFinite(numericJambScore) ||
      numericJambScore < 0 ||
      numericJambScore > 400
    ) {
      messages.push("Enter a valid JAMB score between 0 and 400.");
    }

    if (selectedJambSubjects.length !== 3) {
      messages.push(
        "Select exactly 3 JAMB subjects apart from Use of English."
      );
    }

    if (duplicateJambSubjects.length > 0) {
      messages.push("JAMB subjects must not be repeated.");
    }

    for (const subject of requirement.requiredJamb) {
      if (!selectedJambSubjects.includes(subject)) {
        messages.push(`${subject} is required for JAMB.`);
      }
    }

    for (const group of requirement.oneOfJamb ?? []) {
      if (!groupSatisfied(selectedJambSubjects, group)) {
        messages.push(
          `${group.label}: select at least ${group.required} qualifying subject${
            group.required > 1 ? "s" : ""
          }.`
        );
      }
    }

    if (oLevel.length < 5 || oLevel.length > 9) {
      messages.push("Enter between 5 and 9 O-Level subjects.");
    }

    if (duplicateOLevelSubjects.length > 0) {
      messages.push("O-Level subjects must not be repeated.");
    }

    const creditEntries = oLevel.filter(
      (entry) =>
        entry.subject &&
        entry.grade &&
        gradePoints[entry.grade] !== undefined &&
        gradePoints[entry.grade] > 0
    );

    if (creditEntries.length < requirement.minimumRelevantCredits) {
      messages.push(
        `You need at least ${requirement.minimumRelevantCredits} relevant O-Level credits.`
      );
    }

    for (const subject of requirement.requiredOlevel) {
      const entry = oLevel.find(
        (item) => item.subject === subject
      );

      if (!entry) {
        messages.push(`${subject} is required at O-Level.`);
      } else if (
        !entry.grade ||
        gradePoints[entry.grade] === undefined ||
        gradePoints[entry.grade] <= 0
      ) {
        messages.push(
          `${subject} must have a credit grade of C6 or better.`
        );
      }
    }

    for (const group of requirement.oneOfOlevel ?? []) {
      const qualifyingEntries = oLevel.filter(
        (entry) =>
          entry.subject &&
          entry.grade &&
          gradePoints[entry.grade] > 0 &&
          getGroupSubjects(group).includes(entry.subject)
      );

      if (qualifyingEntries.length < group.required) {
        messages.push(
          `${group.label}: select at least ${group.required} qualifying subject${
            group.required > 1 ? "s" : ""
          } with a credit grade.`
        );
      }
    }

    const relevantPool = getRelevantSubjectPool(requirement);

    const relevantEntries = oLevel.filter(
      (entry) =>
        entry.subject &&
        relevantPool.includes(entry.subject) &&
        gradePoints[entry.grade] !== undefined &&
        gradePoints[entry.grade] > 0
    );

    const bestFive = [...relevantEntries]
      .sort(
        (a, b) =>
          (gradePoints[b.grade] ?? 0) -
          (gradePoints[a.grade] ?? 0)
      )
      .slice(0, 5);

    if (bestFive.length < 5) {
      messages.push(
        "At least 5 relevant credit grades are required to calculate the aggregate."
      );
    }

    const jambValid =
      jambScore !== "" &&
      Number.isFinite(numericJambScore) &&
      numericJambScore >= 0 &&
      numericJambScore <= 400 &&
      selectedJambSubjects.length === 3 &&
      duplicateJambSubjects.length === 0 &&
      requirement.requiredJamb.every((subject) =>
        selectedJambSubjects.includes(subject)
      ) &&
      (requirement.oneOfJamb ?? []).every((group) =>
        groupSatisfied(selectedJambSubjects, group)
      );

    const oLevelValid =
      oLevel.length >= 5 &&
      oLevel.length <= 9 &&
      duplicateOLevelSubjects.length === 0 &&
      requirement.requiredOlevel.every((subject) => {
        const entry = oLevel.find(
          (item) => item.subject === subject
        );

        return (
          entry &&
          entry.grade &&
          gradePoints[entry.grade] !== undefined &&
          gradePoints[entry.grade] > 0
        );
      }) &&
      (requirement.oneOfOlevel ?? []).every((group) => {
        const qualifyingEntries = oLevel.filter(
          (entry) =>
            entry.subject &&
            entry.grade &&
            gradePoints[entry.grade] > 0 &&
            getGroupSubjects(group).includes(entry.subject)
        );

        return qualifyingEntries.length >= group.required;
      }) &&
      creditEntries.length >= requirement.minimumRelevantCredits &&
      bestFive.length >= 5;

    let score: number | null = null;

    if (jambValid && oLevelValid) {
      const jambPoints = numericJambScore * 0.15;

      const oLevelPoints = bestFive.reduce(
        (total, entry) =>
          total + (gradePoints[entry.grade] ?? 0),
        0
      );

      score = Number(
        (jambPoints + oLevelPoints).toFixed(2)
      );
    }

    return {
      eligible: jambValid && oLevelValid,
      jambValid,
      oLevelValid,
      messages,
      score,
      bestFive,
    };
  }, [
    requirement,
    jambScore,
    selectedJambSubjects,
    selectedOLevelSubjects,
    duplicateJambSubjects,
    duplicateOLevelSubjects,
    oLevel,
  ]);

  function updateJambSubject(index: number, value: string) {
    setChecked(false);

    setJambElectives((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  function updateOLevelSubject(index: number, value: string) {
    setChecked(false);

    setOLevel((current) => {
      const next = [...current];

      next[index] = {
        ...next[index],
        subject: value,
      };

      return next;
    });
  }

  function updateOLevelGrade(index: number, value: string) {
    setChecked(false);

    setOLevel((current) => {
      const next = [...current];

      next[index] = {
        ...next[index],
        grade: value,
      };

      return next;
    });
  }

  function addOLevelRow() {
    if (oLevel.length >= 9) return;

    setChecked(false);

    setOLevel((current) => [
      ...current,
      {
        subject: "",
        grade: "",
      },
    ]);
  }

  function removeOLevelRow(index: number) {
    if (oLevel.length <= 5) return;

    setChecked(false);

    setOLevel((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  function resetCalculator() {
    setCourse("");
    setJambScore("");
    setJambElectives(["", "", ""]);

    setOLevel(
      Array.from({ length: 5 }, () => ({
        subject: "",
        grade: "",
      }))
    );

    setChecked(false);
  }

  const requirementText = requirement
    ? [
        ...requirement.requiredOlevel,
        ...(requirement.oneOfOlevel ?? []).map(
          (group) =>
            `${group.label}: ${getGroupSubjects(group).join(", ")}`
        ),
      ]
    : [];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-6 text-white shadow-xl sm:p-8">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-green-100">
              S.O.H CONSULTS
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              LASU Aggregate & Eligibility Checker
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 sm:text-base">
              Check your LASU UTME and O-Level subject eligibility and
              estimate your aggregate using the current checker rules.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <div className="mb-7">
              <h2 className="text-xl font-bold">
                1. Select your course
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose the programme you intend to study.
              </p>
            </div>

            <select
              value={course}
              onChange={(event) => {
                setCourse(event.target.value);
                setChecked(false);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="">Select course</option>

              {courses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {course && requirement && (
              <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4">
                <p className="text-sm font-bold text-green-900">
                  {course} requirement summary
                </p>

                <div className="mt-3 space-y-2 text-sm text-green-900">
                  {requirementText.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex gap-2"
                    >
                      <span className="font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <div className="mb-5">
                <h2 className="text-xl font-bold">
                  2. JAMB subjects
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Use of English is compulsory and is automatically
                  included. Select your other three JAMB subjects.
                </p>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    1. Use of English
                  </label>

                  <input
                    value="Use of English"
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                  />
                </div>

                {jambElectives.map((subject, index) => (
                  <div key={index}>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      {index + 2}. JAMB subject
                    </label>

                    <select
                      value={subject}
                      onChange={(event) =>
                        updateJambSubject(
                          index,
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    >
                      <option value="">Select subject</option>

                      {jambSubjects.map((item) => (
                        <option
                          key={item}
                          value={item}
                          disabled={
                            selectedJambSubjects.includes(item) &&
                            subject !== item
                          }
                        >
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  JAMB UTME Score
                </label>

                <input
                  type="number"
                  min="0"
                  max="400"
                  inputMode="numeric"
                  placeholder="Enter your JAMB score (0 - 400)"
                  value={jambScore}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (
                      value === "" ||
                      (Number(value) >= 0 &&
                        Number(value) <= 400)
                    ) {
                      setJambScore(value);
                      setChecked(false);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  JAMB contributes 60% of the aggregate. Your JAMB
                  score is multiplied by 0.15.
                </p>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="border-b border-green-100 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-600">
                        Live Calculator
                      </p>

                      <h3 className="mt-1 text-lg font-extrabold text-green-950">
                        Your aggregate updates instantly
                      </h3>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-lg font-black text-white">
                      =
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-3">
                  <div className="rounded-xl bg-white p-4 ring-1 ring-green-100">
                    <p className="text-xs font-semibold text-slate-500">
                      JAMB Points
                    </p>

                    <p className="mt-1 text-2xl font-black text-green-800">
                      {liveCalculator.jambPoints.toFixed(2)}
                      <span className="ml-1 text-xs font-bold text-slate-400">
                        / 60
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4 ring-1 ring-green-100">
                    <p className="text-xs font-semibold text-slate-500">
                      O-Level Points
                    </p>

                    <p className="mt-1 text-2xl font-black text-green-800">
                      {liveCalculator.oLevelPoints}
                      <span className="ml-1 text-xs font-bold text-slate-400">
                        / 40
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-700 p-4 text-white shadow-sm">
                    <p className="text-xs font-semibold text-green-100">
                      Live Aggregate
                    </p>

                    <p className="mt-1 text-3xl font-black">
                      {liveCalculator.aggregate.toFixed(2)}
                      <span className="ml-1 text-xs font-bold text-green-200">
                        / 100
                      </span>
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  {!course ? (
                    <p className="rounded-xl bg-white/70 p-3 text-xs leading-5 text-slate-500">
                      Select a course to calculate your O-Level
                      points based on that course&apos;s relevant
                      subjects.
                    </p>
                  ) : liveCalculator.creditCount < 5 ? (
                    <p className="rounded-xl bg-white/70 p-3 text-xs leading-5 text-slate-500">
                      Enter at least 5 relevant O-Level credit grades
                      to complete the aggregate. Current relevant
                      credits:{" "}
                      <span className="font-bold">
                        {liveCalculator.creditCount}/5
                      </span>
                    </p>
                  ) : (
                    <p className="rounded-xl bg-white/70 p-3 text-xs leading-5 text-green-800">
                      Calculated using JAMB × 0.15 plus the best five
                      relevant O-Level grades.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-9">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">
                    3. O-Level results
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter between 5 and 9 subjects and select your
                    grades.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {oLevel.length}/9
                </span>
              </div>

              <div className="space-y-3">
                {oLevel.map((entry, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-2xl border border-slate-200 p-3 sm:grid-cols-[1fr_150px_auto]"
                  >
                    <select
                      value={entry.subject}
                      onChange={(event) =>
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

                      {oLevelSubjects.map((item) => (
                        <option
                          key={item}
                          value={item}
                          disabled={
                            selectedOLevelSubjects.includes(item) &&
                            entry.subject !== item
                          }
                        >
                          {item}
                        </option>
                      ))}
                    </select>

                    <select
                      value={entry.grade}
                      onChange={(event) =>
                        updateOLevelGrade(
                          index,
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    >
                      <option value="">Grade</option>

                      {grades.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>

                    {oLevel.length > 5 ? (
                      <button
                        type="button"
                        onClick={() => removeOLevelRow(index)}
                        className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                ))}
              </div>

              {oLevel.length < 9 && (
                <button
                  type="button"
                  onClick={addOLevelRow}
                  className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700 transition hover:bg-green-100"
                >
                  + Add another subject
                </button>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setChecked(true)}
                className="flex-1 rounded-xl bg-green-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
              >
                Check Eligibility
              </button>

              <button
                type="button"
                onClick={resetCalculator}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>

            {checked && (
              <div
                className={`mt-7 rounded-2xl border p-5 ${
                  validation.eligible
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black ${
                      validation.eligible
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {validation.eligible ? "✓" : "!"}
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`text-lg font-extrabold ${
                        validation.eligible
                          ? "text-green-900"
                          : "text-red-900"
                      }`}
                    >
                      {validation.eligible
                        ? "You meet the selected requirements"
                        : "Requirements not yet satisfied"}
                    </h3>

                    {validation.eligible &&
                    validation.score !== null ? (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-green-800">
                          Estimated LASU aggregate
                        </p>

                        <p className="mt-1 text-4xl font-black text-green-900">
                          {validation.score}
                          <span className="ml-1 text-base font-bold">
                            / 100
                          </span>
                        </p>

                        <p className="mt-2 text-xs leading-5 text-green-800">
                          JAMB contributes up to 60 points and O-Level
                          contributes up to 40 points. This is an
                          eligibility and aggregate estimate, not an
                          admission guarantee or official LASU
                          screening result.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-2">
                        {validation.messages.map(
                          (message, index) => (
                            <p
                              key={`${message}-${index}`}
                              className="text-sm leading-5 text-red-800"
                            >
                              • {message}
                            </p>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-extrabold">
                How the checker works
              </h2>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    JAMB
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Use of English is fixed, while three additional
                    JAMB subjects are checked against the selected
                    course.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    O-Level
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Compulsory subjects and alternative subject groups
                    are checked individually.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Aggregate formula
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    JAMB score × 0.15 gives a maximum of 60 points.
                    The best five relevant O-Level grades contribute a
                    maximum of 40 points.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Grade points
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    A1 = 8, B2 = 7, B3 = 6, C4 = 5, C5 = 4 and C6 =
                    3. D7, E8 and F9 do not contribute points.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-400">
                Important
              </p>

              <h2 className="mt-2 text-lg font-extrabold">
                Check before submitting
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Always confirm your final eligibility against the
                official LASU admission requirements and your actual
                JAMB/O-Level records before making an admission
                decision.
              </p>

              <a
                href="https://services.lidc.lasu.edu.ng/admissionscreening/courserequirement/index.php"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                View LASU requirements
              </a>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                S.O.H CONSULTS
              </p>

              <h2 className="mt-2 text-lg font-extrabold">
                Your Guide. Your Success.
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Admission guidance, registration support and student
                consultation.
              </p>

              <a
                href="https://wa.me/2348182141088"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
              >
                Chat on WhatsApp
              </a>
            </div>
          </aside>
        </div>

        <footer className="mt-8 pb-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} S.O.H CONSULTS. Eligibility
          checker for guidance purposes.
        </footer>
      </div>
    </main>
  );
}