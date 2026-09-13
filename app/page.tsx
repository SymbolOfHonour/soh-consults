"use client";

import { useMemo, useState } from "react";

/* ======================================================
   TYPES
====================================================== */

type OLevelEntry = {
  subject: string;
  grade: string;
};

type RequirementGroup = {
  label: string;
  subjects?: string[];
  required: number;
  anySubject?: boolean;
};

type CourseRequirement = {
  requiredJamb: string[];
  oneOfJamb?: RequirementGroup[];
  requiredOlevel: string[];
  oneOfOlevel?: RequirementGroup[];
  minimumRelevantCredits: number;
};

/* ======================================================
   GENERAL SETTINGS
====================================================== */

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

/* ======================================================
   JAMB SUBJECTS
====================================================== */

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
].sort((a, b) => a.localeCompare(b));

/* ======================================================
   CURRENT SSCE SUBJECTS
====================================================== */

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

/* ======================================================
   REUSABLE SUBJECT POOLS
====================================================== */

const socialScienceJamb = [
  "Economics",
  "Government",
  "Geography",
  "Commerce",
  "Accounting",
  "History",
];

const socialScienceOlevel = [
  "Economics",
  "Government",
  "Geography",
  "Commerce",
  "Accounting",
  "Marketing",
  "Nigerian History",
  "Civic Education",
];

const artsJamb = [
  "Literature in English",
  "Government",
  "History",
  "Economics",
  "Geography",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Arabic",
  "French",
  "Music",
  "Yoruba",
];

const artsOlevel = [
  "Literature-in-English",
  "Government",
  "Nigerian History",
  "Economics",
  "Geography",
  "Christian Religious Studies",
  "Islamic Studies",
  "Arabic",
  "French",
  "Music",
  "Visual Art",
  "Yoruba Language",
  "Civic Education",
];

const scienceJamb = [
  "Biology",
  "Chemistry",
  "Physics",
  "Agricultural Science",
  "Mathematics",
  "Further Mathematics",
  "Geography",
];

const scienceOlevel = [
  "Biology",
  "Chemistry",
  "Physics",
  "Agriculture",
  "Further Mathematics",
  "Geography",
  "Technical Drawing",
  "Computer Hardware and GSM Repairs",
];

const communicationJamb = [
  "Literature in English",
  "Government",
  "History",
  "Economics",
  "Geography",
  "Christian Religious Studies",
  "Islamic Religious Studies",
];

const communicationOlevel = [
  "Literature-in-English",
  "Government",
  "Economics",
  "Nigerian History",
  "Geography",
  "Commerce",
  "Marketing",
  "Civic Education",
];

/* ======================================================
   HELPER REQUIREMENT TEMPLATES
====================================================== */

const medicalRequirement: CourseRequirement = {
  requiredJamb: ["Biology", "Chemistry", "Physics"],
  requiredOlevel: [
    "English Language",
    "General Mathematics",
    "Biology",
    "Chemistry",
    "Physics",
  ],
  minimumRelevantCredits: 5,
};

const engineeringRequirement: CourseRequirement = {
  requiredJamb: ["Mathematics", "Physics", "Chemistry"],
  requiredOlevel: [
    "English Language",
    "General Mathematics",
    "Physics",
    "Chemistry",
  ],
  oneOfOlevel: [
    {
      label: "One other relevant Science subject",
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
};

const computingRequirement: CourseRequirement = {
  requiredJamb: ["Mathematics", "Physics"],
  oneOfJamb: [
    {
      label: "One relevant Science subject",
      subjects: [
        "Chemistry",
        "Biology",
        "Further Mathematics",
        "Computer Studies",
        "Economics",
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
      label: "Two relevant subjects",
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
};

const communicationRequirement: CourseRequirement = {
  requiredJamb: ["Literature in English"],
  oneOfJamb: [
    {
      label: "Two Arts or Social Science subjects",
      subjects: communicationJamb,
      required: 2,
    },
  ],
  requiredOlevel: [
    "English Language",
    "General Mathematics",
    "Literature-in-English",
  ],
  oneOfOlevel: [
    {
      label: "Two relevant Arts or Social Science subjects",
      subjects: communicationOlevel,
      required: 2,
    },
  ],
  minimumRelevantCredits: 5,
};

const lawRequirement: CourseRequirement = {
  requiredJamb: [],
  oneOfJamb: [
    {
      label: "Literature in English and Government",
      subjects: ["Literature in English", "Government"],
      required: 2,
    },
    {
      label: "One other Arts or Social Science subject",
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
      label: "Two relevant subjects",
      subjects: [
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
};

const agricultureRequirement: CourseRequirement = {
  requiredJamb: ["Chemistry"],
  oneOfJamb: [
    {
      label: "Biology or Agricultural Science",
      subjects: ["Biology", "Agricultural Science"],
      required: 1,
    },
    {
      label: "One relevant Science subject",
      subjects: [
        "Physics",
        "Mathematics",
        "Geography",
        "Economics",
      ],
      required: 1,
    },
  ],
  requiredOlevel: [
    "English Language",
    "General Mathematics",
    "Chemistry",
  ],
  oneOfOlevel: [
    {
      label: "Biology or Agriculture",
      subjects: ["Biology", "Agriculture"],
      required: 1,
    },
    {
      label: "One relevant Science subject",
      subjects: [
        "Physics",
        "Geography",
        "Further Mathematics",
        "Economics",
      ],
      required: 1,
    },
  ],
  minimumRelevantCredits: 5,
};

const artsEducationRequirement: CourseRequirement = {
  requiredJamb: ["Literature in English"],
  oneOfJamb: [
    {
      label: "Two relevant Arts subjects",
      subjects: artsJamb,
      required: 2,
    },
  ],
  requiredOlevel: ["English Language"],
  oneOfOlevel: [
    {
      label: "Four relevant Arts subjects",
      subjects: artsOlevel,
      required: 4,
    },
  ],
  minimumRelevantCredits: 5,
};

const socialEducationRequirement: CourseRequirement = {
  requiredJamb: [],
  oneOfJamb: [
    {
      label: "Three relevant Social Science subjects",
      subjects: socialScienceJamb,
      required: 3,
    },
  ],
  requiredOlevel: [
    "English Language",
    "General Mathematics",
  ],
  oneOfOlevel: [
    {
      label: "Three relevant Social Science subjects",
      subjects: socialScienceOlevel,
      required: 3,
    },
  ],
  minimumRelevantCredits: 5,
};

const scienceEducationRequirement: CourseRequirement = {
  requiredJamb: [],
  oneOfJamb: [
    {
      label: "Three relevant Science subjects",
      subjects: scienceJamb,
      required: 3,
    },
  ],
  requiredOlevel: [
    "English Language",
    "General Mathematics",
  ],
  oneOfOlevel: [
    {
      label: "Three relevant Science subjects",
      subjects: scienceOlevel,
      required: 3,
    },
  ],
  minimumRelevantCredits: 5,
};

/* ======================================================
   LASU COURSE REQUIREMENTS
====================================================== */

const courseRequirements: Record<string, CourseRequirement> = {
  Accounting: {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "One relevant Social Science subject",
        subjects: socialScienceJamb,
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
        label: "Two relevant Social Science subjects",
        subjects: socialScienceOlevel,
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Aeronautics and Astronautics Engineering": {
    requiredJamb: ["Mathematics", "Physics", "Chemistry"],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
      "Chemistry",
      "Further Mathematics",
    ],
    minimumRelevantCredits: 5,
  },

  "Agricultural Economics and Farm Management":
    agricultureRequirement,

  "Agricultural Extension and Rural Management":
    agricultureRequirement,

  "Agricultural Science": agricultureRequirement,

  Agriculture: agricultureRequirement,

  "Animal Science": agricultureRequirement,

  Arabic: {
    requiredJamb: ["Arabic"],
    oneOfJamb: [
      {
        label: "Two relevant Arts subjects",
        subjects: artsJamb,
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "Arabic",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant Arts subjects",
        subjects: artsOlevel,
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Arabic Education": artsEducationRequirement,

  Architecture: {
    requiredJamb: ["Mathematics", "Physics"],
    oneOfJamb: [
      {
        label: "One relevant subject",
        subjects: [
          "Chemistry",
          "Economics",
          "Geography",
        ],
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant subjects",
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

  "Banking and Finance": {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "One relevant Social Science subject",
        subjects: socialScienceJamb,
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
        label: "Two relevant Social Science subjects",
        subjects: socialScienceOlevel,
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Biochemistry: medicalRequirement,

  Botany: {
    requiredJamb: ["Biology", "Chemistry"],
    oneOfJamb: [
      {
        label: "One relevant Science subject",
        subjects: [
          "Physics",
          "Mathematics",
          "Agricultural Science",
        ],
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
        label: "One relevant Science subject",
        subjects: [
          "Physics",
          "Agriculture",
          "Geography",
        ],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  /* BUILDING NOW EXISTS IN THE MASTER DATA */

  Building: {
    requiredJamb: ["Mathematics", "Physics"],
    oneOfJamb: [
      {
        label: "One relevant subject",
        subjects: [
          "Chemistry",
          "Geography",
          "Economics",
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
        label: "Two relevant subjects",
        subjects: [
          "Chemistry",
          "Geography",
          "Economics",
          "Technical Drawing",
          "Further Mathematics",
          "Visual Art",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Business Administration": {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "One relevant Social Science subject",
        subjects: socialScienceJamb,
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
        label: "Two relevant subjects",
        subjects: socialScienceOlevel,
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Chemical Engineering": engineeringRequirement,

  "Chemical and Polymer Engineering":
    engineeringRequirement,

  Chemistry: {
    requiredJamb: [
      "Chemistry",
      "Physics",
      "Mathematics",
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Chemistry",
      "Physics",
    ],
    oneOfOlevel: [
      {
        label: "One other Science subject",
        subjects: [
          "Biology",
          "Agriculture",
          "Further Mathematics",
        ],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Christian Religious Studies": {
    requiredJamb: [
      "Christian Religious Studies",
    ],
    oneOfJamb: [
      {
        label: "Two relevant Arts subjects",
        subjects: artsJamb,
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "Christian Religious Studies",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant Arts subjects",
        subjects: artsOlevel,
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Christian Religious Studies Education":
    artsEducationRequirement,

  Cinematography: communicationRequirement,

  "Civil Engineering": engineeringRequirement,

  "Common and Islamic Law": lawRequirement,

  "Common/Civil Law": lawRequirement,

  "Communication Technology": communicationRequirement,

  "Computer Science": computingRequirement,

  "Crop Production": agricultureRequirement,

  "Cyber Security": computingRequirement,

  Dentistry: medicalRequirement,

  "Early Childhood and Primary Education":
    socialEducationRequirement,

  "Early Childhood Education":
    socialEducationRequirement,

  Economics: {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "One relevant subject",
        subjects: [
          "Government",
          "Geography",
          "Commerce",
          "Accounting",
        ],
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
        label: "Two relevant subjects",
        subjects: [
          "Government",
          "Geography",
          "Commerce",
          "Accounting",
          "Nigerian History",
          "Civic Education",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Economics Education": socialEducationRequirement,

  "Educational Management":
    socialEducationRequirement,

  "Educational Management (Accounting Education Option)":
    socialEducationRequirement,

  "Educational Management (Business Education Option)":
    socialEducationRequirement,

  "Electronics and Computer Engineering":
    engineeringRequirement,

  "English Education": artsEducationRequirement,

  "English Language": {
    requiredJamb: ["Literature in English"],
    oneOfJamb: [
      {
        label: "Two relevant Arts subjects",
        subjects: artsJamb,
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "Literature-in-English",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant Arts subjects",
        subjects: artsOlevel,
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "English Literature": {
    requiredJamb: ["Literature in English"],
    oneOfJamb: [
      {
        label: "Two relevant Arts subjects",
        subjects: artsJamb,
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "Literature-in-English",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant Arts subjects",
        subjects: artsOlevel,
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Environmental Management": {
    requiredJamb: ["Geography"],
    oneOfJamb: [
      {
        label: "Two relevant subjects",
        subjects: [
          "Biology",
          "Chemistry",
          "Physics",
          "Economics",
          "Government",
          "Mathematics",
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
        label: "Two relevant subjects",
        subjects: [
          "Biology",
          "Chemistry",
          "Physics",
          "Economics",
          "Government",
          "Agriculture",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Estate Management": {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "One relevant subject",
        subjects: [
          "Geography",
          "Physics",
          "Chemistry",
        ],
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
        label: "Two relevant subjects",
        subjects: [
          "Geography",
          "Physics",
          "Chemistry",
          "Technical Drawing",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Fine Arts": {
    requiredJamb: [],
    oneOfJamb: [
      {
        label: "Three relevant Arts subjects",
        subjects: artsJamb,
        required: 3,
      },
    ],
    requiredOlevel: ["English Language"],
    oneOfOlevel: [
      {
        label: "Four relevant subjects",
        subjects: [
          "Visual Art",
          ...artsOlevel,
        ],
        required: 4,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Fisheries and Aquatic Biology": {
    requiredJamb: ["Biology", "Chemistry"],
    oneOfJamb: [
      {
        label: "Physics or Agricultural Science",
        subjects: [
          "Physics",
          "Agricultural Science",
        ],
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
        label: "One relevant subject",
        subjects: [
          "Physics",
          "Agriculture",
          "Geography",
        ],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  French: {
    requiredJamb: ["French"],
    oneOfJamb: [
      {
        label: "Two relevant Arts subjects",
        subjects: artsJamb,
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "French",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant Arts subjects",
        subjects: artsOlevel,
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "French Education": artsEducationRequirement,

  "Geography and Regional Planning": {
    requiredJamb: ["Geography"],
    oneOfJamb: [
      {
        label: "Two relevant subjects",
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
        label: "Two relevant subjects",
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

  "Geography Education": socialEducationRequirement,

  "Guidance and Counseling Education":
    socialEducationRequirement,

  "Health Education": {
    requiredJamb: ["Biology"],
    oneOfJamb: [
      {
        label: "Two relevant subjects",
        subjects: scienceJamb,
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
    ],
    oneOfOlevel: [
      {
        label: "Two relevant subjects",
        subjects: [
          "Health Education",
          "Chemistry",
          "Physics",
          "Agriculture",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "History and International Relations": {
    requiredJamb: ["History"],
    oneOfJamb: [
      {
        label: "Two relevant Arts subjects",
        subjects: artsJamb,
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "Nigerian History",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant Arts subjects",
        subjects: artsOlevel,
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "History Education": artsEducationRequirement,

  "Human Communication": communicationRequirement,

  "Human Kinetic Education": {
    requiredJamb: ["Biology"],
    oneOfJamb: [
      {
        label: "Two relevant subjects",
        subjects: scienceJamb,
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant subjects",
        subjects: [
          "Biology",
          "Health Education",
          "Physical Education",
          "Chemistry",
          "Physics",
          "Agriculture",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Industrial Design": {
    requiredJamb: ["Mathematics", "Physics"],
    oneOfJamb: [
      {
        label: "One relevant subject",
        subjects: [
          "Chemistry",
          "Geography",
          "Further Mathematics",
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
        label: "Two relevant subjects",
        subjects: [
          "Technical Drawing",
          "Visual Art",
          "Chemistry",
          "Further Mathematics",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Industrial Engineering and Production":
    engineeringRequirement,

  "Industrial Relations and Human Resources Management": {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "One relevant Social Science subject",
        subjects: socialScienceJamb,
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
        label: "Two relevant subjects",
        subjects: socialScienceOlevel,
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Insurance: {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "One relevant Social Science subject",
        subjects: socialScienceJamb,
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
        label: "Two relevant Social Science subjects",
        subjects: socialScienceOlevel,
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Islamic Religious Studies": {
    requiredJamb: [
      "Islamic Religious Studies",
    ],
    oneOfJamb: [
      {
        label: "Two relevant Arts subjects",
        subjects: artsJamb,
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "Islamic Studies",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant Arts subjects",
        subjects: artsOlevel,
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Islamic Religious Studies Education":
    artsEducationRequirement,

  Journalism: communicationRequirement,

  "Library and Information Science": {
    requiredJamb: [],
    oneOfJamb: [
      {
        label: "Three relevant subjects",
        subjects: [
          ...artsJamb,
          ...socialScienceJamb,
        ],
        required: 3,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant subjects",
        subjects: [
          ...artsOlevel,
          ...socialScienceOlevel,
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Linguistics: {
    requiredJamb: ["Literature in English"],
    oneOfJamb: [
      {
        label: "Two relevant Arts subjects",
        subjects: artsJamb,
        required: 2,
      },
    ],
    requiredOlevel: ["English Language"],
    oneOfOlevel: [
      {
        label: "Four relevant Arts subjects",
        subjects: artsOlevel,
        required: 4,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Linguistics, African Languages and Communication Arts": {
    requiredJamb: ["Literature in English"],
    oneOfJamb: [
      {
        label: "Two relevant Arts subjects",
        subjects: artsJamb,
        required: 2,
      },
    ],
    requiredOlevel: ["English Language"],
    oneOfOlevel: [
      {
        label: "Four relevant Arts subjects",
        subjects: artsOlevel,
        required: 4,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Local Government Development and Administration":
    socialEducationRequirement,

  "Logistics and Supply Chain Management": {
    requiredJamb: ["Mathematics"],
    oneOfJamb: [
      {
        label: "Two relevant subjects",
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
    requiredOlevel: [
      "English Language",
      "General Mathematics",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant subjects",
        subjects: [
          "Economics",
          "Geography",
          "Government",
          "Commerce",
          "Accounting",
          "Physics",
        ],
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Management Technology": {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "One relevant subject",
        subjects: socialScienceJamb,
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
        label: "Two relevant subjects",
        subjects: socialScienceOlevel,
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Marketing: {
    requiredJamb: ["Mathematics"],
    oneOfJamb: [
      {
        label: "Two relevant subjects",
        subjects: [
          "Economics",
          "Commerce",
          "Accounting",
          "Government",
          "Geography",
        ],
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant subjects",
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

  "Mass Communication": communicationRequirement,

  Mathematics: {
    requiredJamb: [
      "Mathematics",
      "Physics",
      "Chemistry",
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
      "Chemistry",
    ],
    oneOfOlevel: [
      {
        label: "One relevant subject",
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

  "Mechanical Engineering": engineeringRequirement,

  "Medical Laboratory Science": medicalRequirement,

  /* ONLY ONE MEDICINE ENTRY */

  "Medicine and Surgery": medicalRequirement,

  Microbiology: medicalRequirement,

  Music: {
    requiredJamb: ["Music"],
    oneOfJamb: [
      {
        label: "Two relevant Arts subjects",
        subjects: artsJamb,
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "Music",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant Arts subjects",
        subjects: artsOlevel,
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Nursing: medicalRequirement,

  "Peace Studies": {
    requiredJamb: [],
    oneOfJamb: [
      {
        label: "Any three Arts or Social Science subjects",
        subjects: [
          ...artsJamb,
          ...socialScienceJamb,
        ],
        required: 3,
      },
    ],
    requiredOlevel: ["English Language"],
    oneOfOlevel: [
      {
        label: "Four Arts or Social Science subjects",
        subjects: [
          ...artsOlevel,
          ...socialScienceOlevel,
        ],
        required: 4,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Pharmacology: medicalRequirement,

  Pharmacy: medicalRequirement,

  /* PHILOSOPHY HAS NO SUBJECT RESTRICTION */

  Philosophy: {
    requiredJamb: [],
    oneOfJamb: [
      {
        label: "Any three JAMB subjects",
        subjects: jambSubjects,
        required: 3,
        anySubject: true,
      },
    ],
    requiredOlevel: ["English Language"],
    oneOfOlevel: [
      {
        label: "Any four O-Level subjects",
        subjects: oLevelSubjects.filter(
          (subject) => subject !== "English Language"
        ),
        required: 4,
        anySubject: true,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Photojournalism: communicationRequirement,

  Physics: {
    requiredJamb: [
      "Physics",
      "Mathematics",
      "Chemistry",
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
      "Chemistry",
    ],
    oneOfOlevel: [
      {
        label: "One relevant Science subject",
        subjects: [
          "Further Mathematics",
          "Biology",
          "Agriculture",
        ],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Physiology: medicalRequirement,

  Physiotherapy: medicalRequirement,

  "Political Science": {
    requiredJamb: ["Government"],
    oneOfJamb: [
      {
        label: "Two relevant subjects",
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
        label: "Two relevant subjects",
        subjects: [
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

  "Political Science Education":
    socialEducationRequirement,

  "Portuguese / English": {
    requiredJamb: ["Literature in English"],
    oneOfJamb: [
      {
        label: "Two relevant Arts subjects",
        subjects: artsJamb,
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "Literature-in-English",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant Arts subjects",
        subjects: artsOlevel,
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Project Management": {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "One relevant subject",
        subjects: socialScienceJamb,
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
        label: "Two relevant subjects",
        subjects: socialScienceOlevel,
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Psychology: {
    requiredJamb: ["Biology"],
    oneOfJamb: [
      {
        label: "Two relevant subjects",
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
    requiredOlevel: [
      "English Language",
      "General Mathematics",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant subjects",
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

  "Public Administration": {
    requiredJamb: ["Government"],
    oneOfJamb: [
      {
        label: "Two relevant subjects",
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
        label: "Two relevant subjects",
        subjects: [
          "Economics",
          "Nigerian History",
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

  "Public Relations and Advertising":
    communicationRequirement,

  "Quantity Surveying": {
    requiredJamb: ["Mathematics", "Physics"],
    oneOfJamb: [
      {
        label: "One relevant subject",
        subjects: [
          "Chemistry",
          "Economics",
          "Geography",
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
        label: "Two relevant subjects",
        subjects: [
          "Chemistry",
          "Economics",
          "Geography",
          "Technical Drawing",
          "Further Mathematics",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Radio and Television Broadcast":
    communicationRequirement,

  Radiography: medicalRequirement,

  "Radiography and Radiation Science":
    medicalRequirement,

  "Science and Technology Education (Biology Option)":
    scienceEducationRequirement,

  "Science and Technology Education (Chemistry Option)":
    scienceEducationRequirement,

  "Science and Technology Education (Computer Science Option)":
    scienceEducationRequirement,

  "Science and Technology Education (Educational Technology Option)":
    scienceEducationRequirement,

  "Science and Technology Education (Mathematics Option)":
    scienceEducationRequirement,

  "Science and Technology Education (Physics Option)":
    scienceEducationRequirement,

  "Science Laboratory Technology": {
    requiredJamb: ["Chemistry"],
    oneOfJamb: [
      {
        label: "Two Science subjects",
        subjects: [
          "Biology",
          "Physics",
          "Mathematics",
        ],
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Chemistry",
    ],
    oneOfOlevel: [
      {
        label: "Two Science subjects",
        subjects: [
          "Biology",
          "Physics",
          "Further Mathematics",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Social Studies and Civic Education":
    socialEducationRequirement,

  Sociology: {
    requiredJamb: ["Mathematics"],
    oneOfJamb: [
      {
        label: "Two relevant subjects",
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
    requiredOlevel: [
      "English Language",
      "General Mathematics",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant subjects",
        subjects: [
          "Economics",
          "Government",
          "Geography",
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

  "Special Education": socialEducationRequirement,

  "Survey and Geo-Informatics": {
    requiredJamb: ["Mathematics", "Physics"],
    oneOfJamb: [
      {
        label: "One relevant subject",
        subjects: [
          "Geography",
          "Chemistry",
          "Further Mathematics",
        ],
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
      "Geography",
    ],
    oneOfOlevel: [
      {
        label: "One relevant subject",
        subjects: [
          "Chemistry",
          "Technical Drawing",
          "Further Mathematics",
        ],
        required: 1,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Taxation: {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "One relevant subject",
        subjects: [
          "Accounting",
          "Commerce",
          "Government",
          "Geography",
        ],
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
        label: "Two relevant subjects",
        subjects: [
          "Accounting",
          "Commerce",
          "Government",
          "Geography",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Taxation Studies": {
    requiredJamb: ["Mathematics", "Economics"],
    oneOfJamb: [
      {
        label: "One relevant subject",
        subjects: socialScienceJamb,
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
        label: "Two relevant subjects",
        subjects: socialScienceOlevel,
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Theatre and Film Arts": {
    requiredJamb: ["Literature in English"],
    oneOfJamb: [
      {
        label: "Two relevant Arts subjects",
        subjects: artsJamb,
        required: 2,
      },
    ],
    requiredOlevel: [
      "English Language",
      "Literature-in-English",
    ],
    oneOfOlevel: [
      {
        label: "Three relevant Arts subjects",
        subjects: artsOlevel,
        required: 3,
      },
    ],
    minimumRelevantCredits: 5,
  },

  Transport: {
    requiredJamb: ["Mathematics"],
    oneOfJamb: [
      {
        label: "Two relevant subjects",
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
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Physics",
    ],
    oneOfOlevel: [
      {
        label: "Two relevant subjects",
        subjects: [
          "Chemistry",
          "Economics",
          "Geography",
          "Accounting",
          "Further Mathematics",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Urban and Regional Planning": {
    requiredJamb: [
      "Mathematics",
      "Geography",
    ],
    oneOfJamb: [
      {
        label: "One relevant subject",
        subjects: [
          "Economics",
          "Physics",
          "Chemistry",
          "Government",
        ],
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Geography",
    ],
    oneOfOlevel: [
      {
        label: "Two relevant subjects",
        subjects: [
          "Economics",
          "Physics",
          "Chemistry",
          "Government",
          "Technical Drawing",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },

  "Yoruba Education": artsEducationRequirement,

  Zoology: {
    requiredJamb: ["Biology", "Chemistry"],
    oneOfJamb: [
      {
        label: "One relevant Science subject",
        subjects: [
          "Physics",
          "Mathematics",
          "Agricultural Science",
        ],
        required: 1,
      },
    ],
    requiredOlevel: [
      "English Language",
      "General Mathematics",
      "Biology",
    ],
    oneOfOlevel: [
      {
        label: "Two relevant Science subjects",
        subjects: [
          "Chemistry",
          "Physics",
          "Agriculture",
        ],
        required: 2,
      },
    ],
    minimumRelevantCredits: 5,
  },
};

/* ======================================================
   LASU MASTER PROGRAMME LIST
   Do not derive the dropdown from random aliases.
   This is the single course catalogue used by the app.
====================================================== */

const lasuProgrammes = [
  "Accounting",
  "Aeronautics and Astronautics Engineering",
  "Agricultural Economics and Farm Management",
  "Agricultural Extension and Rural Management",
  "Agricultural Science",
  "Animal Science",
  "Arabic",
  "Arabic Education",
  "Architecture",
  "Banking and Finance",
  "Biochemistry",
  "Botany",
  "Building",
  "Business Administration",
  "Chemical Engineering",
  "Chemistry",
  "Christian Religious Studies",
  "Christian Religious Studies Education",
  "Cinematography",
  "Civil Engineering",
  "Common and Islamic Law",
  "Common/Civil Law",
  "Communication Technology",
  "Computer Science",
  "Crop Production",
  "Cyber Security",
  "Dentistry",
  "Early Childhood and Primary Education",
  "Economics",
  "Economics Education",
  "Educational Management",
  "Educational Management (Accounting Education Option)",
  "Educational Management (Business Education Option)",
  "Electronics and Computer Engineering",
  "English Education",
  "English Language",
  "English Literature",
  "Environmental Management",
  "Estate Management",
  "Fine Arts",
  "Fisheries and Aquatic Biology",
  "French",
  "French Education",
  "Geography and Regional Planning",
  "Geography Education",
  "Guidance and Counseling Education",
  "Health Education",
  "History and International Relations",
  "History Education",
  "Human Communication",
  "Human Kinetic Education",
  "Industrial Design",
  "Industrial Engineering and Production",
  "Industrial Relations and Human Resources Management",
  "Insurance",
  "Islamic Religious Studies",
  "Islamic Religious Studies Education",
  "Journalism",
  "Library and Information Science",
  "Linguistics",
  "Linguistics, African Languages and Communication Arts",
  "Local Government Development and Administration",
  "Logistics and Supply Chain Management",
  "Management Technology",
  "Marketing",
  "Mass Communication",
  "Mathematics",
  "Mechanical Engineering",
  "Medical Laboratory Science",
  "Medicine and Surgery",
  "Microbiology",
  "Music",
  "Nursing",
  "Peace Studies",
  "Pharmacology",
  "Pharmacy",
  "Philosophy",
  "Photojournalism",
  "Physics",
  "Physiology",
  "Physiotherapy",
  "Political Science",
  "Political Science Education",
  "Portuguese / English",
  "Project Management",
  "Psychology",
  "Public Administration",
  "Public Relations and Advertising",
  "Quantity Surveying",
  "Radio and Television Broadcast",
  "Radiography",
  "Radiography and Radiation Science",
  "Science and Technology Education (Biology Option)",
  "Science and Technology Education (Chemistry Option)",
  "Science and Technology Education (Computer Science Option)",
  "Science and Technology Education (Educational Technology Option)",
  "Science and Technology Education (Mathematics Option)",
  "Science and Technology Education (Physics Option)",
  "Science Laboratory Technology",
  "Social Studies and Civic Education",
  "Sociology",
  "Special Education",
  "Survey and Geo-Informatics",
  "Taxation",
  "Taxation Studies",
  "Theatre and Film Arts",
  "Transport",
  "Urban and Regional Planning",
  "Yoruba Education",
  "Zoology",
];

/* ======================================================
   FINAL CLEAN COURSE LIST

   Set removes duplicates automatically.
   Medicine and Surgery therefore appears once only.
====================================================== */

const courses = [...new Set(lasuProgrammes)]
  .filter((course) => Boolean(courseRequirements[course]))
  .sort((a, b) => a.localeCompare(b));

/* ======================================================
   HELPERS
====================================================== */

function uniqueValues(values: string[]) {
  return [...new Set(values)];
}

function getGroupSubjects(group: RequirementGroup) {
  return group.subjects ?? [];
}

function getRelevantOlevelPool(
  requirement: CourseRequirement
) {
  return uniqueValues([
    ...requirement.requiredOlevel,
    ...(requirement.oneOfOlevel ?? []).flatMap((group) =>
      group.anySubject
        ? oLevelSubjects
        : getGroupSubjects(group)
    ),
  ]);
}

function getBestFiveRelevantEntries(
  entries: OLevelEntry[],
  requirement: CourseRequirement
) {
  const creditEntries = entries.filter(
    (entry) =>
      entry.subject &&
      entry.grade &&
      (gradePoints[entry.grade] ?? 0) > 0
  );

  const selected: OLevelEntry[] = [];
  const usedSubjects = new Set<string>();

  const sortByPoints = (
    a: OLevelEntry,
    b: OLevelEntry
  ) =>
    (gradePoints[b.grade] ?? 0) -
    (gradePoints[a.grade] ?? 0);

  requirement.requiredOlevel.forEach((subject) => {
    const match = creditEntries.find(
      (entry) => entry.subject === subject
    );

    if (
      match &&
      !usedSubjects.has(match.subject)
    ) {
      selected.push(match);
      usedSubjects.add(match.subject);
    }
  });

  (requirement.oneOfOlevel ?? []).forEach(
    (group) => {
      const allowedSubjects = group.anySubject
        ? oLevelSubjects
        : getGroupSubjects(group);

      const candidates = creditEntries
        .filter(
          (entry) =>
            !usedSubjects.has(entry.subject) &&
            allowedSubjects.includes(entry.subject)
        )
        .sort(sortByPoints);

      candidates
        .slice(0, group.required)
        .forEach((entry) => {
          selected.push(entry);
          usedSubjects.add(entry.subject);
        });
    }
  );

  if (selected.length < 5) {
    const relevantPool =
      getRelevantOlevelPool(requirement);

    const fillers = creditEntries
      .filter(
        (entry) =>
          !usedSubjects.has(entry.subject) &&
          relevantPool.includes(entry.subject)
      )
      .sort(sortByPoints);

    fillers
      .slice(0, 5 - selected.length)
      .forEach((entry) => {
        selected.push(entry);
        usedSubjects.add(entry.subject);
      });
  }

  return selected.slice(0, 5);
}

/* ======================================================
   PDF HELPERS
====================================================== */

function escapePdfText(text: string) {
  return text
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapPdfLine(
  text: string,
  maxCharacters = 80
) {
  if (text.length <= maxCharacters) {
    return [text];
  }

  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current
      ? `${current} ${word}`
      : word;

    if (candidate.length <= maxCharacters) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);

  return lines;
}

function createPdfDocument(lines: string[]) {
  const pageWidth = 595;
  const pageHeight = 842;

  const leftMargin = 45;
  const topMargin = 58;
  const bottomMargin = 55;

  const lineHeight = 15;

  const cleanedLines = lines.flatMap((line) => {
    const clean = line
      .replace(/[^\x20-\x7E]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!clean) return [""];

    return wrapPdfLine(clean, 82);
  });

  const maxLinesPerPage = Math.floor(
    (pageHeight - topMargin - bottomMargin) /
      lineHeight
  );

  const pages: string[][] = [];

  for (
    let index = 0;
    index < cleanedLines.length;
    index += maxLinesPerPage
  ) {
    pages.push(
      cleanedLines.slice(
        index,
        index + maxLinesPerPage
      )
    );
  }

  if (!pages.length) {
    pages.push(["S.O.H CONSULTS"]);
  }

  const catalogueObject = 1;
  const pagesObject = 2;
  const normalFontObject = 3;
  const boldFontObject = 4;

  const pageObjects = pages.map(
    (_, index) => 5 + index * 2
  );

  const contentObjects = pages.map(
    (_, index) => 6 + index * 2
  );

  const maxObject = 4 + pages.length * 2;

  const objects = new Map<number, string>();

  objects.set(
    catalogueObject,
    `<< /Type /Catalog /Pages ${pagesObject} 0 R >>`
  );

  objects.set(
    pagesObject,
    `<< /Type /Pages /Kids [${pageObjects
      .map((object) => `${object} 0 R`)
      .join(" ")}] /Count ${pages.length} >>`
  );

  objects.set(
    normalFontObject,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  );

  objects.set(
    boldFontObject,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  );

  const headings = [
    "S.O.H CONSULTS",
    "LASU AGGREGATE & ELIGIBILITY REPORT",
    "CANDIDATE INFORMATION",
    "JAMB UTME",
    "O-LEVEL RESULTS",
    "BEST FIVE RELEVANT O-LEVEL RESULTS",
    "AGGREGATE",
    "ASSESSMENT",
    "VALIDATION NOTES",
    "IMPORTANT DISCLAIMER",
  ];

  pages.forEach((page, pageIndex) => {
    const commands = ["BT"];

    page.forEach((line, lineIndex) => {
      const y =
        pageHeight -
        topMargin -
        lineIndex * lineHeight;

      const bold = headings.includes(line);

      commands.push(
        bold ? "/F2 10 Tf" : "/F1 9 Tf"
      );

      commands.push(
        `1 0 0 1 ${leftMargin} ${y} Tm`
      );

      commands.push(
        `(${escapePdfText(line)}) Tj`
      );
    });

    commands.push("ET");

    const stream = commands.join("\n");

    objects.set(
      pageObjects[pageIndex],
      `<< /Type /Page /Parent ${pagesObject} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${normalFontObject} 0 R /F2 ${boldFontObject} 0 R >> >> /Contents ${contentObjects[pageIndex]} 0 R >>`
    );

    objects.set(
      contentObjects[pageIndex],
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
    );
  });

  let pdf = "%PDF-1.4\n";

  const offsets = new Array(
    maxObject + 1
  ).fill(0);

  for (
    let objectNumber = 1;
    objectNumber <= maxObject;
    objectNumber++
  ) {
    offsets[objectNumber] = pdf.length;

    pdf += `${objectNumber} 0 obj\n`;
    pdf += `${objects.get(objectNumber) ?? ""}\n`;
    pdf += "endobj\n";
  }

  const xrefPosition = pdf.length;

  pdf += `xref\n0 ${maxObject + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (
    let objectNumber = 1;
    objectNumber <= maxObject;
    objectNumber++
  ) {
    pdf += `${String(
      offsets[objectNumber]
    ).padStart(10, "0")} 00000 n \n`;
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${
    maxObject + 1
  } /Root ${catalogueObject} 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefPosition}\n`;
  pdf += "%%EOF";

  return pdf;
}

/* ======================================================
   PAGE
====================================================== */

export default function LASUCalculator() {
  const [candidateName, setCandidateName] =
    useState("");

  const [course, setCourse] = useState("");

  const [jambScore, setJambScore] =
    useState("");

  const [jambElectives, setJambElectives] =
    useState<string[]>(["", "", ""]);

  const [oLevel, setOLevel] =
    useState<OLevelEntry[]>([
      {
        subject: "English Language",
        grade: "",
      },
      ...Array.from({ length: 8 }, () => ({
        subject: "",
        grade: "",
      })),
    ]);

  const [checked, setChecked] =
    useState(false);

  const requirement =
    courseRequirements[course];

  const selectedJambSubjects = useMemo(
    () => jambElectives.filter(Boolean),
    [jambElectives]
  );

  const completedOLevelResults = useMemo(
    () =>
      oLevel.filter(
        (entry) =>
          entry.subject && entry.grade
      ),
    [oLevel]
  );

  /* ======================================================
     JAMB OPTIONS

     Subjects already selected disappear from the
     other dropdowns.
  ====================================================== */

  function getAvailableJambOptions(
    index: number
  ) {
    const selectedByOthers =
      jambElectives.filter(
        (_, currentIndex) =>
          currentIndex !== index
      );

    return jambSubjects.filter(
      (subject) =>
        !selectedByOthers.includes(subject) ||
        jambElectives[index] === subject
    );
  }

  /* ======================================================
     O-LEVEL OPTIONS

     English is already selected in row 1.
     It therefore cannot appear in another row.
  ====================================================== */

  function getAvailableOLevelOptions(
    index: number
  ) {
    if (index === 0) {
      return ["English Language"];
    }

    const selectedByOthers = oLevel
      .filter(
        (_, currentIndex) =>
          currentIndex !== index
      )
      .map((entry) => entry.subject)
      .filter(Boolean);

    return oLevelSubjects.filter(
      (subject) =>
        !selectedByOthers.includes(subject) ||
        oLevel[index].subject === subject
    );
  }

  function updateJambSubject(
    index: number,
    subject: string
  ) {
    setJambElectives((current) => {
      const next = [...current];
      next[index] = subject;
      return next;
    });

    setChecked(false);
  }

  function updateOlevelSubject(
    index: number,
    subject: string
  ) {
    setOLevel((current) => {
      const next = [...current];

      next[index] = {
        ...next[index],
        subject,
      };

      return next;
    });

    setChecked(false);
  }

  function updateOlevelGrade(
    index: number,
    grade: string
  ) {
    setOLevel((current) => {
      const next = [...current];

      next[index] = {
        ...next[index],
        grade,
      };

      return next;
    });

    setChecked(false);
  }

  /* ======================================================
     LIVE AGGREGATE
  ====================================================== */

  const liveCalculator = useMemo(() => {
    const numericJambScore =
      Number(jambScore);

    const jambScoreValid =
      jambScore !== "" &&
      Number.isFinite(numericJambScore) &&
      numericJambScore >= 0 &&
      numericJambScore <= 400;

    const jambPoints = jambScoreValid
      ? numericJambScore * 0.15
      : 0;

    const bestFive = requirement
      ? getBestFiveRelevantEntries(
          oLevel,
          requirement
        )
      : [];

    const oLevelPoints = bestFive.reduce(
      (total, entry) =>
        total +
        (gradePoints[entry.grade] ?? 0),
      0
    );

    return {
      jambPoints,
      oLevelPoints,
      aggregate:
        jambPoints + oLevelPoints,
      bestFive,
    };
  }, [jambScore, oLevel, requirement]);

  /* ======================================================
     VALIDATION
  ====================================================== */

  const validation = useMemo(() => {
    const messages: string[] = [];

    const numericJambScore =
      Number(jambScore);

    const jambScoreValid =
      jambScore !== "" &&
      Number.isFinite(numericJambScore) &&
      numericJambScore >= 0 &&
      numericJambScore <= 400;

    const jambCutoffValid =
      jambScoreValid &&
      numericJambScore >= LASU_CUTOFF_MARK;

    if (!candidateName.trim()) {
      messages.push(
        "Enter the candidate's name."
      );
    }

    if (!course) {
      messages.push(
        "Select a LASU programme."
      );
    }

    if (!jambScoreValid) {
      messages.push(
        "Enter a valid JAMB score between 0 and 400."
      );
    }

    if (
      jambScoreValid &&
      !jambCutoffValid
    ) {
      messages.push(
        `JAMB score is below LASU minimum cut-off mark of ${LASU_CUTOFF_MARK}.`
      );
    }

    if (
      selectedJambSubjects.length !== 3
    ) {
      messages.push(
        "Select all three additional JAMB subjects."
      );
    }

    if (
      new Set(selectedJambSubjects).size !==
      selectedJambSubjects.length
    ) {
      messages.push(
        "A JAMB subject cannot be selected more than once."
      );
    }

    if (
      completedOLevelResults.length < 5
    ) {
      messages.push(
        "Enter at least five complete O-Level results."
      );
    }

    if (
      completedOLevelResults.length > 9
    ) {
      messages.push(
        "A maximum of nine O-Level results is allowed."
      );
    }

    const oLevelNames =
      completedOLevelResults.map(
        (entry) => entry.subject
      );

    if (
      new Set(oLevelNames).size !==
      oLevelNames.length
    ) {
      messages.push(
        "An O-Level subject cannot be selected more than once."
      );
    }

    let jambRequirementValid = false;
    let oLevelRequirementValid = false;

    if (requirement) {
      /* JAMB compulsory subjects */

      const missingJamb =
        requirement.requiredJamb.filter(
          (subject) =>
            !selectedJambSubjects.includes(
              subject
            )
        );

      if (missingJamb.length) {
        messages.push(
          `Missing required JAMB subject${
            missingJamb.length > 1
              ? "s"
              : ""
          }: ${missingJamb.join(", ")}.`
        );
      }

      const jambGroupsValid =
        (
          requirement.oneOfJamb ?? []
        ).every((group) => {
          const count = group.anySubject
            ? selectedJambSubjects.length
            : selectedJambSubjects.filter(
                (subject) =>
                  (
                    group.subjects ?? []
                  ).includes(subject)
              ).length;

          if (count < group.required) {
            messages.push(
              `${group.label}: select at least ${group.required} qualifying subject${
                group.required > 1
                  ? "s"
                  : ""
              }.`
            );

            return false;
          }

          return true;
        });

      jambRequirementValid =
        missingJamb.length === 0 &&
        jambGroupsValid &&
        selectedJambSubjects.length === 3;

      /* O-Level */

      const creditSubjects =
        completedOLevelResults
          .filter(
            (entry) =>
              (gradePoints[entry.grade] ??
                0) > 0
          )
          .map((entry) => entry.subject);

      const missingOlevel =
        requirement.requiredOlevel.filter(
          (subject) =>
            !creditSubjects.includes(subject)
        );

      if (missingOlevel.length) {
        messages.push(
          `Missing O-Level credit${
            missingOlevel.length > 1
              ? "s"
              : ""
          }: ${missingOlevel.join(", ")}.`
        );
      }

      const oLevelGroupsValid =
        (
          requirement.oneOfOlevel ?? []
        ).every((group) => {
          const eligibleSubjects =
            group.anySubject
              ? creditSubjects.filter(
                  (subject) =>
                    !requirement.requiredOlevel.includes(
                      subject
                    )
                )
              : creditSubjects.filter(
                  (subject) =>
                    (
                      group.subjects ?? []
                    ).includes(subject)
                );

          if (
            new Set(eligibleSubjects)
              .size < group.required
          ) {
            messages.push(
              `${group.label}: at least ${group.required} credit${
                group.required > 1
                  ? "s are"
                  : " is"
              } required.`
            );

            return false;
          }

          return true;
        });

      const relevantCredits =
        getBestFiveRelevantEntries(
          completedOLevelResults,
          requirement
        );

      if (
        relevantCredits.length <
        requirement.minimumRelevantCredits
      ) {
        messages.push(
          `A minimum of ${requirement.minimumRelevantCredits} relevant O-Level credit passes is required.`
        );
      }

      oLevelRequirementValid =
        missingOlevel.length === 0 &&
        oLevelGroupsValid &&
        relevantCredits.length >=
          requirement.minimumRelevantCredits;
    }

    const eligible =
      Boolean(requirement) &&
      Boolean(candidateName.trim()) &&
      jambScoreValid &&
      jambCutoffValid &&
      selectedJambSubjects.length === 3 &&
      jambRequirementValid &&
      completedOLevelResults.length >= 5 &&
      oLevelRequirementValid;

    return {
      eligible,
      messages,
      jambCutoffValid,
      score:
        jambScoreValid && requirement
          ? liveCalculator.aggregate
          : null,
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

  /* ======================================================
     RESET
  ====================================================== */

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
        subject: "English Language",
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

  /* ======================================================
     PDF REPORT
  ====================================================== */

  function downloadEligibilityReport() {
    const status = validation.eligible
      ? "ELIGIBLE"
      : "NOT ELIGIBLE";

    const reportJambSubjects = [
      "Use of English",
      ...selectedJambSubjects,
    ];

    const olevelLines =
      completedOLevelResults.length
        ? completedOLevelResults.map(
            (entry) =>
              `${entry.subject}: ${entry.grade}`
          )
        : [
            "No completed O-Level result entered",
          ];

    const bestFiveLines =
      validation.bestFive.length
        ? validation.bestFive.map(
            (entry) =>
              `${entry.subject}: ${entry.grade}`
          )
        : ["Not available"];

    const lines = [
      "S.O.H CONSULTS",
      "LASU AGGREGATE & ELIGIBILITY REPORT",
      "",
      "CANDIDATE INFORMATION",
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
      `Cut-off Status: ${
        validation.jambCutoffValid
          ? "Passed"
          : "Failed"
      }`,
      `JAMB Points: ${liveCalculator.jambPoints.toFixed(
        2
      )} / 60`,
      "",
      "Selected JAMB Subjects:",
      ...reportJambSubjects.map(
        (subject) => `- ${subject}`
      ),
      "",
      "O-LEVEL RESULTS",
      `Completed Results: ${completedOLevelResults.length} / 9`,
      ...olevelLines.map(
        (line) => `- ${line}`
      ),
      "",
      "BEST FIVE RELEVANT O-LEVEL RESULTS",
      ...bestFiveLines.map(
        (line) => `- ${line}`
      ),
      "",
      "AGGREGATE",
      `O-Level Points: ${liveCalculator.oLevelPoints.toFixed(
        2
      )} / 40`,
      `Estimated Aggregate: ${
        validation.score !== null
          ? validation.score.toFixed(2)
          : "Not available"
      } / 100`,
      "",
      "ASSESSMENT",
      validation.eligible
        ? "The candidate satisfies the entered LASU screening requirements for the selected programme."
        : "The candidate does not satisfy one or more of the entered LASU screening requirements.",
      "",
      "VALIDATION NOTES",
      ...(validation.messages.length
        ? validation.messages
            .slice(0, 15)
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
      "It is not an official LASU admission letter, screening result or guarantee of admission.",
      "Requirements should always be cross-checked with the current LASU and JAMB admission information.",
      `Generated: ${new Date().toLocaleString(
        "en-NG"
      )}`,
    ];

    const pdf =
      createPdfDocument(lines);

    const blob = new Blob([pdf], {
      type: "application/pdf",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    const safeName =
      candidateName
        .trim()
        .replace(
          /[^a-zA-Z0-9]+/g,
          "_"
        )
        .replace(
          /^_+|_+$/g,
          ""
        ) || "Candidate";

    link.href = url;

    link.download =
      `LASU_Eligibility_Report_${safeName}.pdf`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-6 text-white shadow-xl sm:p-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-100">
              S.O.H CONSULTS
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              LASU Aggregate & Eligibility Checker
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-green-50 sm:text-base">
              Check your estimated LASU aggregate and course eligibility using your JAMB score, JAMB subjects and O-Level results.
            </p>
          </div>
        </header>

        <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_360px]">

          {/* MAIN CALCULATOR */}

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">

            {/* PERSONAL DETAILS */}

            <div>
              <h2 className="text-xl font-black text-slate-900">
                Candidate Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter your details before checking your eligibility.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Candidate Name
                  </label>

                  <input
                    type="text"
                    value={candidateName}
                    onChange={(event) => {
                      setCandidateName(
                        event.target.value
                      );
                      setChecked(false);
                    }}
                    placeholder="Enter candidate name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    LASU Programme
                  </label>

                  <select
                    value={course}
                    onChange={(event) => {
                      setCourse(
                        event.target.value
                      );

                      setJambElectives([
                        "",
                        "",
                        "",
                      ]);

                      setChecked(false);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  >
                    <option value="">
                      Select programme
                    </option>

                    {courses.map(
                      (courseName) => (
                        <option
                          key={courseName}
                          value={courseName}
                        >
                          {courseName}
                        </option>
                      )
                    )}
                  </select>

                  <p className="mt-2 text-xs text-slate-500">
                    {courses.length} LASU programmes currently loaded.
                  </p>
                </div>
              </div>
            </div>

            {/* JAMB */}

            <div className="mt-9 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-black text-slate-900">
                JAMB UTME Details
              </h2>

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
                      JAMB score is below the LASU minimum screening score of {LASU_CUTOFF_MARK}.
                    </p>
                  )}
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  UTME Subject 1
                </label>

                <input
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
                        onChange={(
                          event
                        ) =>
                          updateJambSubject(
                            index,
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      >
                        <option value="">
                          Select subject
                        </option>

                        {getAvailableJambOptions(
                          index
                        ).map(
                          (subject) => (
                            <option
                              key={
                                subject
                              }
                              value={
                                subject
                              }
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
                  Use of English is compulsory. The other three JAMB subjects can be any JAMB subjects.
                </div>
              )}
            </div>

            {/* O-LEVEL */}

            <div className="mt-9 border-t border-slate-200 pt-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    O-Level Results
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Enter 5 to 9 O-Level results and select your grades. English Language is compulsory.
                  </p>
                </div>

                <div className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-black text-green-700">
                  {
                    completedOLevelResults.length
                  }
                  /9 completed
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {oLevel.map(
                  (entry, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[1fr_160px]"
                    >
                      <select
                        value={
                          entry.subject
                        }
                        disabled={
                          index === 0
                        }
                        onChange={(
                          event
                        ) =>
                          updateOlevelSubject(
                            index,
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-100 disabled:font-semibold disabled:text-slate-500"
                      >
                        <option value="">
                          Select subject
                        </option>

                        {getAvailableOLevelOptions(
                          index
                        ).map(
                          (subject) => (
                            <option
                              key={
                                subject
                              }
                              value={
                                subject
                              }
                            >
                              {subject}
                            </option>
                          )
                        )}
                      </select>

                      <select
                        value={
                          entry.grade
                        }
                        onChange={(
                          event
                        ) =>
                          updateOlevelGrade(
                            index,
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      >
                        <option value="">
                          Select grade
                        </option>

                        {grades.map(
                          (grade) => (
                            <option
                              key={grade}
                              value={grade}
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

              {course ===
                "Philosophy" && (
                <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800 ring-1 ring-blue-100">
                  <span className="font-bold">
                    Philosophy O-Level:
                  </span>{" "}
                  English Language is compulsory and any other four O-Level credit subjects can complete the five relevant credits.
                </div>
              )}
            </div>

            {/* LIVE CALCULATOR */}

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  JAMB Points
                </p>

                <p className="mt-1 text-xl font-black text-slate-900">
                  {liveCalculator.jambPoints.toFixed(
                    2
                  )}
                  /60
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  O-Level Points
                </p>

                <p className="mt-1 text-xl font-black text-slate-900">
                  {liveCalculator.oLevelPoints.toFixed(
                    2
                  )}
                  /40
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-4 ring-1 ring-green-100">
                <p className="text-xs font-semibold text-green-700">
                  Estimated Aggregate
                </p>

                <p className="mt-1 text-xl font-black text-green-700">
                  {liveCalculator.aggregate.toFixed(
                    2
                  )}
                  /100
                </p>
              </div>
            </div>

            {/* BUTTONS */}

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

            {/* RESULT */}

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
                          Programme:{" "}
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
                        JAMB score is below LASU&apos;s minimum cut-off mark of{" "}
                        {
                          LASU_CUTOFF_MARK
                        }
                        . Candidate is disqualified regardless of the calculated aggregate.
                      </div>
                    )}

                  {validation.messages
                    .length > 0 && (
                    <div className="mt-5 rounded-xl bg-white/70 p-4">
                      <p className="text-sm font-black">
                        Requirements to review
                      </p>

                      <ul className="mt-2 space-y-1.5 text-sm">
                        {validation.messages.map(
                          (
                            message,
                            index
                          ) => (
                            <li
                              key={
                                index
                              }
                            >
                              •{" "}
                              {
                                message
                              }
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {validation.bestFive
                    .length > 0 && (
                    <div className="mt-5 rounded-xl bg-white/70 p-4">
                      <p className="text-sm font-black">
                        Best Five Relevant O-Level Results
                      </p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {validation.bestFive.map(
                          (
                            entry,
                            index
                          ) => (
                            <div
                              key={`${entry.subject}-${index}`}
                              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-100"
                            >
                              <span>
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

                  <button
                    type="button"
                    onClick={
                      downloadEligibilityReport
                    }
                    className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white transition hover:bg-slate-800"
                  >
                    📄 Download Eligibility Report (PDF)
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* SIDEBAR */}

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
                    LASU&apos;s current minimum UTME score for the 2026/2027 screening is 195.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    2. JAMB subjects
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Use of English is compulsory plus three additional UTME subjects.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    3. O-Level results
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Enter up to nine results. The checker identifies the best five relevant credit subjects.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    4. Duplicate protection
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Once a subject has been selected, it cannot be selected again in another subject field.
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
                Get help with LASU admission, registration, O-Level uploads and other admission services.
              </p>

              <a
                href="https://wa.me/2348182141088?text=Hello%20S.O.H%20CONSULTS%2C%20I%20need%20admission%20guidance."
                target="_blank"
                rel="noreferrer"
                className="mt-4 block rounded-xl bg-white px-4 py-3 text-center text-sm font-black text-green-700 transition hover:bg-green-50"
              >
                Chat on WhatsApp
              </a>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-black text-amber-900">
                Important
              </p>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                This calculator is for admission guidance and self-screening. Final admission decisions remain with LASU and JAMB.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}