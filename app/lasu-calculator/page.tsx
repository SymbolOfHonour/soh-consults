"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import SiteContact from "../components/SiteContact";

type Programme = {
  id: string;
  name: string;
};

type LasuRequirement = {
  success: boolean;
  source?: string;
  courseId?: string;
  programme?: string;
  oLevel?: string;
  utme?: string;
  retrievedAt?: string;
  error?: string;
};

type OLevelEntry = {
  subject: string;
  grade: string;
};

type ParsedRequirement = {
  required: string[];
  alternatives: string[];
  alternativeCategories: string[];
  alternativesRequired: number;
  unrestricted: boolean;
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
  "Mathematics",
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

const jambAliases: Record<string, string[]> = {
  Accounting: ["accounting", "acc"],
  "Agricultural Science": [
    "agricultural science",
    "agriculture",
    "agric",
  ],
  Arabic: ["arabic"],
  Biology: ["biology", "bio"],
  Chemistry: ["chemistry", "che"],
  "Christian Religious Studies": [
    "christian religious studies",
    "christian religious knowledge",
    "crs",
    "crk",
  ],
  Commerce: ["commerce"],
  "Computer Studies": [
    "computer studies",
    "computer science",
  ],
  Economics: ["economics", "eco"],
  French: ["french"],
  "Further Mathematics": [
    "further mathematics",
    "further maths",
  ],
  Geography: ["geography", "geo"],
  Government: ["government", "gov"],
  Hausa: ["hausa"],
  History: ["history"],
  Igbo: ["igbo"],
  "Islamic Religious Studies": [
    "islamic religious studies",
    "islamic studies",
    "irs",
    "irk",
  ],
  "Literature in English": [
    "literature in english",
    "literature-in-english",
    "literature",
    "lit",
  ],
  Mathematics: [
    "mathematics",
    "maths",
    "mat",
  ],
  Music: ["music"],
  Physics: ["physics", "phy"],
  Yoruba: ["yoruba"],
};

const oLevelAliases: Record<string, string[]> = {
  Accounting: ["accounting"],
  Agriculture: [
    "agriculture",
    "agricultural science",
  ],
  Arabic: ["arabic"],
  Biology: ["biology"],
  Chemistry: ["chemistry"],
  "Christian Religious Studies": [
    "christian religious studies",
    "christian religious knowledge",
    "crs",
    "crk",
  ],
  "Civic Education": [
    "civic education",
  ],
  Commerce: ["commerce"],
  Economics: ["economics"],
  "English Language": [
    "english language",
    "english",
  ],
  French: ["french"],
  "Further Mathematics": [
    "further mathematics",
    "further maths",
  ],
  Mathematics: [
    "general mathematics",
    "mathematics",
    "maths",
  ],
  Geography: ["geography"],
  Government: ["government"],
  "Hausa Language": [
    "hausa language",
    "hausa",
  ],
  "Igbo Language": [
    "igbo language",
    "igbo",
  ],
  "Islamic Studies": [
    "islamic studies",
    "islamic religious studies",
    "irs",
    "irk",
  ],
  "Literature-in-English": [
    "literature-in-english",
    "literature in english",
    "literature",
  ],
  Marketing: ["marketing"],
  Music: ["music"],
  "Nigerian History": [
    "nigerian history",
    "history",
  ],
  Physics: ["physics"],
  "Technical Drawing": [
    "technical drawing",
  ],
  "Visual Art": [
    "visual art",
    "fine art",
    "fine arts",
  ],
  "Yoruba Language": [
    "yoruba language",
    "yoruba",
  ],
};

const jambSubjectCategories: Record<string, string[]> = {
  "Social Science": [
    "Accounting",
    "Commerce",
    "Economics",
    "Geography",
    "Government",
  ],

  Science: [
    "Agricultural Science",
    "Biology",
    "Chemistry",
    "Computer Studies",
    "Further Mathematics",
    "Mathematics",
    "Physics",
  ],

  Arts: [
    "Arabic",
    "Christian Religious Studies",
    "French",
    "Government",
    "History",
    "Islamic Religious Studies",
    "Literature in English",
    "Music",
    "Yoruba",
  ],

  Commercial: [
    "Accounting",
    "Commerce",
    "Economics",
    "Government",
  ],
};

const oLevelSubjectCategories: Record<string, string[]> = {
  "Social Science": [
    "Accounting",
    "Commerce",
    "Economics",
    "Geography",
    "Government",
    "Marketing",
  ],

  Science: [
    "Agriculture",
    "Biology",
    "Chemistry",
    "Further Mathematics",
    "Mathematics",
    "Physics",
  ],

  Arts: [
    "Arabic",
    "Christian Religious Studies",
    "French",
    "Government",
    "Islamic Studies",
    "Literature-in-English",
    "Music",
    "Nigerian History",
    "Visual Art",
    "Yoruba Language",
  ],

  Commercial: [
    "Accounting",
    "Commerce",
    "Economics",
    "Government",
    "Marketing",
  ],
};

function uniqueValues(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function normaliseText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

function containsWord(text: string, value: string) {
  return text
    .toLowerCase()
    .includes(value.toLowerCase());
}

function extractSubjects(
  text: string,
  aliases: Record<string, string[]>
) {
  const lower = ` ${text
    .toLowerCase()
    .replace(/[()]/g, " ")} `;

  const found: string[] = [];

  Object.entries(aliases).forEach(
    ([canonical, possibleNames]) => {
      const matched =
        possibleNames.some((alias) => {
          if (alias.length <= 3) {
            const regex =
              new RegExp(
                `(^|[^a-z])${alias.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                )}([^a-z]|$)`,
                "i"
              );

            return regex.test(lower);
          }

          return containsWord(
            lower,
            alias
          );
        });

      if (matched) {
        found.push(canonical);
      }
    }
  );

  return uniqueValues(found);
}

function wordToNumber(value: string) {
  const cleaned =
    value.toLowerCase().trim();

  const map: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
  };

  if (map[cleaned]) {
    return map[cleaned];
  }

  const numeric =
    Number(cleaned);

  if (
    Number.isFinite(numeric) &&
    numeric > 0
  ) {
    return numeric;
  }

  return 1;
}

function extractRequirementCategories(
  text: string
) {
  const categories: string[] =
    [];

  if (
    /\bsocial\s+sciences?\b/i.test(
      text
    )
  ) {
    categories.push(
      "Social Science"
    );
  }

  const withoutSocialScience =
    text.replace(
      /\bsocial\s+sciences?\b/gi,
      ""
    );

  if (
    /\bsciences?\b/i.test(
      withoutSocialScience
    )
  ) {
    categories.push("Science");
  }

  if (
    /\barts?\b/i.test(text)
  ) {
    categories.push("Arts");
  }

  if (
    /\bcommercial\b/i.test(
      text
    ) ||
    /\bcommercial\s+subjects?\b/i.test(
      text
    )
  ) {
    categories.push(
      "Commercial"
    );
  }

  return uniqueValues(categories);
}

function parseRequirement(
  rawText: string,
  type: "jamb" | "olevel",
  programme: string
): ParsedRequirement {
  const text =
    normaliseText(rawText);

  if (
    programme
      .toLowerCase()
      .trim() ===
    "philosophy"
  ) {
    if (type === "jamb") {
      return {
        required: [],
        alternatives: [],
        alternativeCategories:
          [],
        alternativesRequired: 3,
        unrestricted: true,
      };
    }

    return {
      required: [
        "English Language",
      ],
      alternatives: [],
      alternativeCategories: [],
      alternativesRequired: 4,
      unrestricted: true,
    };
  }

  const aliases =
    type === "jamb"
      ? jambAliases
      : oLevelAliases;

  let requiredText = text;
  let alternativeText = "";

  const alternativePatterns = [
    /\band\s+any\s+(?:one\s+)?(?:other\s+)?subject\s+from\b/i,
    /\band\s+any\s+(?:other\s+)?subject\s+from\b/i,
    /\bany\s+(?:one\s+)?(?:other\s+)?subject\s+from\b/i,
    /\bany\s+(?:other\s+)?subject\s+from\b/i,

    /\band\s+(one|two|three|four|five|\d+)\s+(?:other\s+)?subjects?\s+from\b/i,
    /\b(one|two|three|four|five|\d+)\s+(?:other\s+)?subjects?\s+from\b/i,

    /\band\s+any\s+(one|two|three|four|five|\d+)\s+of\b/i,
    /\bany\s+(one|two|three|four|five|\d+)\s+of\b/i,

    /\band\s+one\s+of\b/i,
    /\bone\s+of\b/i,
  ];

  let alternativesRequired =
    0;

  let splitIndex = -1;
  let splitLength = 0;

  for (
    const pattern of
    alternativePatterns
  ) {
    const match =
      pattern.exec(text);

    if (match) {
      splitIndex =
        match.index;

      splitLength =
        match[0].length;

      alternativesRequired =
        match[1]
          ? wordToNumber(
              match[1]
            )
          : 1;

      break;
    }
  }

  if (splitIndex >= 0) {
    requiredText =
      text.slice(
        0,
        splitIndex
      );

    alternativeText =
      text.slice(
        splitIndex +
          splitLength
      );
  }

  let required =
    extractSubjects(
      requiredText,
      aliases
    );

  const alternatives =
    extractSubjects(
      alternativeText,
      aliases
    );

  const alternativeCategories =
    extractRequirementCategories(
      alternativeText
    );

  if (type === "jamb") {
    required =
      required.filter(
        (subject) =>
          subject !==
          "Use of English"
      );
  }

  if (
    type === "olevel" &&
    /\benglish\b/i.test(
      requiredText
    ) &&
    !required.includes(
      "English Language"
    )
  ) {
    required.unshift(
      "English Language"
    );
  }

  if (
    type === "olevel" &&
    /\bmathematics\b/i.test(
      requiredText
    ) &&
    !required.includes(
      "Mathematics"
    )
  ) {
    required.push(
      "Mathematics"
    );
  }

  if (
    alternativeText &&
    alternativesRequired === 0
  ) {
    alternativesRequired = 1;
  }

  return {
    required:
      uniqueValues(required),

    alternatives:
      uniqueValues(
        alternatives
      ),

    alternativeCategories,

    alternativesRequired,

    unrestricted: false,
  };
}

function subjectMatchesJambCategory(
  subject: string,
  category: string
) {
  return (
    jambSubjectCategories[
      category
    ]?.includes(subject) ??
    false
  );
}

function subjectMatchesOLevelCategory(
  subject: string,
  category: string
) {
  return (
    oLevelSubjectCategories[
      category
    ]?.includes(subject) ??
    false
  );
}

function isCredit(
  grade: string
) {
  return (
    (gradePoints[grade] ?? 0) >
    0
  );
}

function getAvailableJambOptions(
  values: string[],
  index: number
) {
  const selectedByOthers =
    values.filter(
      (_, currentIndex) =>
        currentIndex !== index
    );

  return jambSubjects.filter(
    (subject) =>
      !selectedByOthers.includes(
        subject
      ) ||
      values[index] === subject
  );
}

function getAvailableOLevelOptions(
  values: OLevelEntry[],
  index: number
) {
  if (index === 0) {
    return [
      "English Language",
    ];
  }

  const selectedByOthers =
    values
      .filter(
        (_, currentIndex) =>
          currentIndex !==
          index
      )
      .map(
        (entry) =>
          entry.subject
      )
      .filter(Boolean);

  return oLevelSubjects.filter(
    (subject) =>
      subject !==
        "English Language" &&
      (!selectedByOthers.includes(
        subject
      ) ||
        values[index]
          .subject ===
          subject)
  );
}

function getSafeCandidateName(
  name: string
) {
  return (
    name
      .trim()
      .replace(
        /[^a-zA-Z0-9]+/g,
        "_"
      )
      .replace(
        /^_+|_+$/g,
        ""
      ) || "Candidate"
  );
}

function downloadBlob(
  blob: Blob,
  filename: string
) {
  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function loadImage(
  src: string
): Promise<HTMLImageElement> {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.onload = () =>
        resolve(image);

      image.onerror = () =>
        reject(
          new Error(
            `Unable to load ${src}`
          )
        );

      image.src = src;
    }
  );
}

function createCroppedLogo(
  image: HTMLImageElement
) {
  const source =
    document.createElement(
      "canvas"
    );

  source.width =
    image.naturalWidth ||
    image.width;

  source.height =
    image.naturalHeight ||
    image.height;

  const ctx =
    source.getContext("2d");

  if (!ctx) {
    return source;
  }

  ctx.drawImage(
    image,
    0,
    0
  );

  const imageData =
    ctx.getImageData(
      0,
      0,
      source.width,
      source.height
    );

  const data =
    imageData.data;

  let minX =
    source.width;

  let minY =
    source.height;

  let maxX = 0;
  let maxY = 0;

  let found = false;

  for (
    let y = 0;
    y < source.height;
    y += 2
  ) {
    for (
      let x = 0;
      x < source.width;
      x += 2
    ) {
      const index =
        (y * source.width +
          x) *
        4;

      const r =
        data[index];

      const g =
        data[index + 1];

      const b =
        data[index + 2];

      const a =
        data[index + 3];

      const white =
        r > 245 &&
        g > 245 &&
        b > 245;

      if (
        a > 20 &&
        !white
      ) {
        found = true;

        minX =
          Math.min(
            minX,
            x
          );

        minY =
          Math.min(
            minY,
            y
          );

        maxX =
          Math.max(
            maxX,
            x
          );

        maxY =
          Math.max(
            maxY,
            y
          );
      }
    }
  }

  if (!found) {
    return source;
  }

  const padding = 25;

  minX =
    Math.max(
      0,
      minX - padding
    );

  minY =
    Math.max(
      0,
      minY - padding
    );

  maxX =
    Math.min(
      source.width,
      maxX + padding
    );

  maxY =
    Math.min(
      source.height,
      maxY + padding
    );

  const width =
    maxX - minX;

  const height =
    maxY - minY;

  const cropped =
    document.createElement(
      "canvas"
    );

  cropped.width = width;
  cropped.height = height;

  const croppedCtx =
    cropped.getContext(
      "2d"
    );

  if (!croppedCtx) {
    return source;
  }

  croppedCtx.drawImage(
    source,
    minX,
    minY,
    width,
    height,
    0,
    0,
    width,
    height
  );

  return cropped;
}

function roundedBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
  stroke?: string
) {
  ctx.beginPath();

  ctx.roundRect(
    x,
    y,
    width,
    height,
    radius
  );

  ctx.fillStyle = fill;
  ctx.fill();

  if (stroke) {
    ctx.strokeStyle =
      stroke;

    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  font: string,
  color = "#0f172a"
) {
  ctx.font = font;
  ctx.fillStyle = color;

  const words =
    text.split(/\s+/);

  let line = "";
  let currentY = y;

  for (
    const word of words
  ) {
    const test =
      line
        ? `${line} ${word}`
        : word;

    if (
      ctx.measureText(test)
        .width >
        maxWidth &&
      line
    ) {
      ctx.fillText(
        line,
        x,
        currentY
      );

      line = word;

      currentY +=
        lineHeight;
    } else {
      line = test;
    }
  }

  if (line) {
    ctx.fillText(
      line,
      x,
      currentY
    );
  }

  return currentY;
}

function drawSectionHeader(
  ctx: CanvasRenderingContext2D,
  title: string,
  x: number,
  y: number,
  width: number
) {
  const gradient =
    ctx.createLinearGradient(
      x,
      y,
      x + width,
      y
    );

  gradient.addColorStop(
    0,
    "#065f46"
  );

  gradient.addColorStop(
    1,
    "#047857"
  );

  ctx.beginPath();

  ctx.roundRect(
    x,
    y,
    width,
    44,
    8
  );

  ctx.fillStyle =
    gradient;

  ctx.fill();

  ctx.font =
    "700 20px Arial";

  ctx.fillStyle =
    "#ffffff";

  ctx.fillText(
    title,
    x + 18,
    y + 29
  );
}

function drawStatusIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  success: boolean
) {
  ctx.beginPath();

  ctx.arc(
    x,
    y,
    26,
    0,
    Math.PI * 2
  );

  ctx.fillStyle =
    success
      ? "#059669"
      : "#dc2626";

  ctx.fill();

  ctx.strokeStyle =
    "#ffffff";

  ctx.lineWidth = 6;

  ctx.lineCap =
    "round";

  ctx.lineJoin =
    "round";

  if (success) {
    ctx.beginPath();

    ctx.moveTo(
      x - 11,
      y
    );

    ctx.lineTo(
      x - 3,
      y + 9
    );

    ctx.lineTo(
      x + 15,
      y - 12
    );

    ctx.stroke();
  } else {
    ctx.beginPath();

    ctx.moveTo(
      x - 9,
      y - 9
    );

    ctx.lineTo(
      x + 9,
      y + 9
    );

    ctx.moveTo(
      x + 9,
      y - 9
    );

    ctx.lineTo(
      x - 9,
      y + 9
    );

    ctx.stroke();
  }
}

export default function LASUCalculator() {
  const [
    programmes,
    setProgrammes,
  ] = useState<
    Programme[]
  >([]);

  const [
    programmesLoading,
    setProgrammesLoading,
  ] = useState(true);

  const [
    programmesError,
    setProgrammesError,
  ] = useState("");

  const [
    selectedCourseId,
    setSelectedCourseId,
  ] = useState("");

  const [
    selectedCourseName,
    setSelectedCourseName,
  ] = useState("");

  const [
    lasuRequirement,
    setLasuRequirement,
  ] = useState<
    LasuRequirement | null
  >(null);

  const [
    requirementLoading,
    setRequirementLoading,
  ] = useState(false);

  const [
    requirementError,
    setRequirementError,
  ] = useState("");

  const [
    candidateName,
    setCandidateName,
  ] = useState("");

  const [
    jambScore,
    setJambScore,
  ] = useState("");

  const [
    jambElectives,
    setJambElectives,
  ] = useState<string[]>([
    "",
    "",
    "",
  ]);

  const [
    oLevel,
    setOLevel,
  ] = useState<
    OLevelEntry[]
  >([
    {
      subject:
        "English Language",
      grade: "",
    },
    ...Array.from(
      {
        length: 8,
      },
      () => ({
        subject: "",
        grade: "",
      })
    ),
  ]);

  const [
    oLevelSittings,
    setOLevelSittings,
  ] = useState<1 | 2>(1);

  const [
    oLevelSecondSitting,
    setOLevelSecondSitting,
  ] = useState<OLevelEntry[]>([
    ...Array.from(
      { length: 9 },
      () => ({ subject: "", grade: "" })
    ),
  ]);

  const [
    checked,
    setChecked,
  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProgrammes() {
      setProgrammesLoading(
        true
      );

      setProgrammesError(
        ""
      );

      try {
        const response =
          await fetch(
            "/api/lasu/programmes",
            {
              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success ||
          !Array.isArray(
            data.programmes
          )
        ) {
          throw new Error(
            data.error ||
              "Unable to load LASU programmes."
          );
        }

        if (!cancelled) {
          setProgrammes(
            data.programmes
          );
        }
      } catch (error) {
        if (!cancelled) {
          setProgrammesError(
            error instanceof
              Error
              ? error.message
              : "Unable to load LASU programmes."
          );
        }
      } finally {
        if (!cancelled) {
          setProgrammesLoading(
            false
          );
        }
      }
    }

    loadProgrammes();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRequirement() {
      if (
        !selectedCourseId
      ) {
        setLasuRequirement(
          null
        );

        setRequirementError(
          ""
        );

        return;
      }

      setRequirementLoading(
        true
      );

      setRequirementError(
        ""
      );

      setLasuRequirement(
        null
      );

      try {
        const response =
          await fetch(
            "/api/lasu/requirements",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  courseId:
                    selectedCourseId,
                }),
            }
          );

        const data:
          LasuRequirement =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              "Unable to load LASU requirements."
          );
        }

        if (!cancelled) {
          setLasuRequirement(
            data
          );
        }
      } catch (error) {
        if (!cancelled) {
          setRequirementError(
            error instanceof
              Error
              ? error.message
              : "Unable to load LASU requirements."
          );
        }
      } finally {
        if (!cancelled) {
          setRequirementLoading(
            false
          );
        }
      }
    }

    loadRequirement();

    return () => {
      cancelled = true;
    };
  }, [selectedCourseId]);

  const parsedJamb =
    useMemo(
      () =>
        parseRequirement(
          lasuRequirement?.utme ||
            "",
          "jamb",
          selectedCourseName
        ),
      [
        lasuRequirement,
        selectedCourseName,
      ]
    );

  const parsedOLevel =
    useMemo(
      () =>
        parseRequirement(
          lasuRequirement?.oLevel ||
            "",
          "olevel",
          selectedCourseName
        ),
      [
        lasuRequirement,
        selectedCourseName,
      ]
    );

  const firstSittingCompleted = useMemo(
    () => oLevel.filter((entry) => entry.subject && entry.grade),
    [oLevel]
  );

  const secondSittingCompleted = useMemo(
    () =>
      oLevelSittings === 2
        ? oLevelSecondSitting.filter((entry) => entry.subject && entry.grade)
        : [],
    [oLevelSecondSitting, oLevelSittings]
  );

  // For two sittings, combine both results and keep the stronger grade
  // where the same subject appears in both sittings.
  const completedOLevelResults = useMemo(() => {
    const bestBySubject = new Map<string, OLevelEntry>();
    for (const entry of [...firstSittingCompleted, ...secondSittingCompleted]) {
      const current = bestBySubject.get(entry.subject);
      if (!current || (gradePoints[entry.grade] ?? 0) > (gradePoints[current.grade] ?? 0)) {
        bestBySubject.set(entry.subject, entry);
      }
    }
    return Array.from(bestBySubject.values());
  }, [firstSittingCompleted, secondSittingCompleted]);

  const selectedJambSubjects =
    useMemo(
      () =>
        jambElectives.filter(
          Boolean
        ),
      [jambElectives]
    );

  const creditOLevelResults =
    useMemo(
      () =>
        completedOLevelResults.filter(
          (entry) =>
            isCredit(
              entry.grade
            )
        ),
      [
        completedOLevelResults,
      ]
    );

  const bestFive =
    useMemo(() => {
      const credits = [
        ...creditOLevelResults,
      ];

      if (
        selectedCourseName ===
        "Philosophy"
      ) {
        return credits
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
      }

      const categorySubjects =
        parsedOLevel
          .alternativeCategories
          .flatMap(
            (category) =>
              oLevelSubjectCategories[
                category
              ] ?? []
          );

      const relevantPool =
        uniqueValues([
          ...parsedOLevel.required,
          ...parsedOLevel.alternatives,
          ...categorySubjects,
        ]);

      let relevant =
        credits.filter(
          (entry) =>
            relevantPool.length ===
              0 ||
            relevantPool.includes(
              entry.subject
            )
        );

      if (
        relevant.length < 5
      ) {
        const alreadySelected =
          new Set(
            relevant.map(
              (entry) =>
                entry.subject
            )
          );

        const fillers =
          credits.filter(
            (entry) =>
              !alreadySelected.has(
                entry.subject
              )
          );

        relevant = [
          ...relevant,
          ...fillers,
        ];
      }

      return relevant
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
    }, [
      creditOLevelResults,
      parsedOLevel,
      selectedCourseName,
    ]);

  const jambPoints =
    useMemo(() => {
      const score =
        Number(jambScore);

      if (
        jambScore === "" ||
        !Number.isFinite(
          score
        ) ||
        score < 0 ||
        score > 400
      ) {
        return 0;
      }

      return score * 0.15;
    }, [jambScore]);

  const oLevelSittingMultiplier =
    oLevelSittings === 2 ? 0.9 : 1;

  const oLevelPoints =
    useMemo(
      () =>
        bestFive.reduce(
          (
            total,
            entry
          ) =>
            total +
            (gradePoints[
              entry.grade
            ] ?? 0) *
              oLevelSittingMultiplier,
          0
        ),
      [bestFive, oLevelSittingMultiplier]
    );

  const aggregate =
    jambPoints +
    oLevelPoints;

  const validation =
    useMemo(() => {
      const messages: string[] =
        [];

      const score =
        Number(jambScore);

      const jambScoreValid =
        jambScore !== "" &&
        Number.isFinite(
          score
        ) &&
        score >= 0 &&
        score <= 400;

      const jambCutoffValid =
        jambScoreValid &&
        score >=
          LASU_CUTOFF_MARK;

      if (
        !candidateName.trim()
      ) {
        messages.push(
          "Enter the candidate name."
        );
      }

      if (
        !selectedCourseId
      ) {
        messages.push(
          "Select a course."
        );
      }

      if (!jambScoreValid) {
        messages.push(
          "Enter a valid JAMB score between 0 and 400."
        );
      } else if (
        !jambCutoffValid
      ) {
        messages.push(
          `JAMB score is below LASU minimum cut-off mark of ${LASU_CUTOFF_MARK}.`
        );
      }

      const jambUnique =
        uniqueValues(
          selectedJambSubjects
        );

      if (
        selectedJambSubjects.length !==
        3
      ) {
        messages.push(
          "Select exactly 3 JAMB subjects in addition to Use of English."
        );
      }

      if (
        jambUnique.length !==
        selectedJambSubjects.length
      ) {
        messages.push(
          "JAMB subjects must not contain duplicates."
        );
      }

      let jambRequirementValid =
        false;

      if (
        selectedCourseName ===
        "Philosophy"
      ) {
        jambRequirementValid =
          selectedJambSubjects.length ===
            3 &&
          jambUnique.length === 3;
      } else if (
        lasuRequirement?.utme
      ) {
        const compulsoryValid =
          parsedJamb.required.every(
            (subject) =>
              selectedJambSubjects.includes(
                subject
              )
          );

        const alternativeCount =
          selectedJambSubjects.filter(
            (subject) => {
              const explicitMatch =
                parsedJamb
                  .alternatives
                  .includes(
                    subject
                  );

              const categoryMatch =
                parsedJamb
                  .alternativeCategories
                  .some(
                    (
                      category
                    ) =>
                      subjectMatchesJambCategory(
                        subject,
                        category
                      )
                  );

              return (
                explicitMatch ||
                categoryMatch
              );
            }
          ).length;

        const alternativesValid =
          parsedJamb
            .alternativesRequired ===
            0 ||
          alternativeCount >=
            parsedJamb
              .alternativesRequired;

        jambRequirementValid =
          compulsoryValid &&
          alternativesValid &&
          selectedJambSubjects.length ===
            3 &&
          jambUnique.length ===
            3;

        parsedJamb.required.forEach(
          (subject) => {
            if (
              !selectedJambSubjects.includes(
                subject
              )
            ) {
              messages.push(
                `${subject} is required in UTME for ${selectedCourseName}.`
              );
            }
          }
        );

        if (
          !alternativesValid
        ) {
          const allowedDescriptions =
            [
              ...parsedJamb
                .alternativeCategories
                .map(
                  (
                    category
                  ) =>
                    `any ${category} subject`
                ),

              ...parsedJamb.alternatives,
            ];

          if (
            allowedDescriptions.length >
            0
          ) {
            messages.push(
              `Select at least ${
                parsedJamb
                  .alternativesRequired
              } UTME subject(s) from: ${allowedDescriptions.join(
                ", "
              )}.`
            );
          }
        }
      } else {
        messages.push(
          "LASU UTME requirement has not loaded yet."
        );
      }

      if (
        completedOLevelResults.length <
          5 ||
        completedOLevelResults.length >
          9
      ) {
        messages.push(
          "Enter between 5 and 9 completed O-Level results."
        );
      }

      const firstSittingEnglishCredit = firstSittingCompleted.some(
        (entry) => entry.subject === "English Language" && isCredit(entry.grade)
      );

      if (!firstSittingEnglishCredit) {
        messages.push(
          oLevelSittings === 2
            ? "English Language must have a credit pass in the First Sitting."
            : "English Language must have a credit pass."
        );
      }

      let oLevelRequirementValid =
        false;

      if (
        selectedCourseName ===
        "Philosophy"
      ) {
        const englishCredit =
          creditOLevelResults.some(
            (entry) =>
              entry.subject ===
              "English Language"
          );

        const otherCredits =
          creditOLevelResults.filter(
            (entry) =>
              entry.subject !==
              "English Language"
          ).length;

        oLevelRequirementValid =
          englishCredit &&
          firstSittingEnglishCredit &&
          otherCredits >= 4;

        if (!englishCredit) {
          messages.push(
            "English Language requires a credit pass for Philosophy."
          );
        }

        if (
          otherCredits < 4
        ) {
          messages.push(
            "Philosophy requires English Language plus any four other O-Level credit passes."
          );
        }
      } else if (
        lasuRequirement?.oLevel
      ) {
        const requiredValid =
          parsedOLevel.required.every(
            (subject) =>
              creditOLevelResults.some(
                (entry) =>
                  entry.subject ===
                  subject
              )
          );

        parsedOLevel.required.forEach(
          (subject) => {
            const found =
              creditOLevelResults.some(
                (entry) =>
                  entry.subject ===
                  subject
              );

            if (!found) {
              messages.push(
                `${subject} requires a credit pass for ${selectedCourseName}.`
              );
            }
          }
        );

        const alternativeCount =
          creditOLevelResults.filter(
            (entry) => {
              const explicitMatch =
                parsedOLevel
                  .alternatives
                  .includes(
                    entry.subject
                  );

              const categoryMatch =
                parsedOLevel
                  .alternativeCategories
                  .some(
                    (
                      category
                    ) =>
                      subjectMatchesOLevelCategory(
                        entry.subject,
                        category
                      )
                  );

              return (
                explicitMatch ||
                categoryMatch
              );
            }
          ).length;

        const alternativesValid =
          parsedOLevel
            .alternativesRequired ===
            0 ||
          alternativeCount >=
            parsedOLevel
              .alternativesRequired;

        if (
          !alternativesValid
        ) {
          const allowedDescriptions =
            [
              ...parsedOLevel
                .alternativeCategories
                .map(
                  (
                    category
                  ) =>
                    `any ${category} subject`
                ),

              ...parsedOLevel
                .alternatives,
            ];

          if (
            allowedDescriptions.length >
            0
          ) {
            messages.push(
              `Select at least ${
                parsedOLevel
                  .alternativesRequired
              } O-Level credit subject(s) from: ${allowedDescriptions.join(
                ", "
              )}.`
            );
          }
        }

        oLevelRequirementValid =
          firstSittingEnglishCredit &&
          requiredValid &&
          alternativesValid &&
          creditOLevelResults.length >=
            5;
      } else {
        messages.push(
          "LASU O-Level requirement has not loaded yet."
        );
      }

      const requirementLoaded =
        Boolean(
          lasuRequirement?.oLevel &&
            lasuRequirement?.utme
        );

      const eligible =
        Boolean(
          candidateName.trim() &&
            selectedCourseId &&
            requirementLoaded &&
            jambCutoffValid &&
            jambRequirementValid &&
            oLevelRequirementValid &&
            bestFive.length >=
              5
        );

      return {
        messages:
          uniqueValues(
            messages
          ),

        jambScoreValid,

        jambCutoffValid,

        jambRequirementValid,

        oLevelRequirementValid,

        eligible,
      };
    }, [
      candidateName,
      selectedCourseId,
      selectedCourseName,
      jambScore,
      selectedJambSubjects,
      completedOLevelResults,
      creditOLevelResults,
      lasuRequirement,
      parsedJamb,
      parsedOLevel,
      bestFive,
    ]);

  function updateJambSubject(
    index: number,
    subject: string
  ) {
    setJambElectives(
      (current) =>
        current.map(
          (
            item,
            currentIndex
          ) =>
            currentIndex ===
            index
              ? subject
              : item
        )
    );

    setChecked(false);
  }

  function updateOLevelSubject(
    index: number,
    subject: string
  ) {
    if (index === 0) {
      return;
    }

    setOLevel(
      (current) =>
        current.map(
          (
            entry,
            currentIndex
          ) =>
            currentIndex ===
            index
              ? {
                  ...entry,
                  subject,
                }
              : entry
        )
    );

    setChecked(false);
  }

  function updateOLevelGrade(
    index: number,
    grade: string
  ) {
    setOLevel(
      (current) =>
        current.map(
          (
            entry,
            currentIndex
          ) =>
            currentIndex ===
            index
              ? {
                  ...entry,
                  grade,
                }
              : entry
        )
    );

    setChecked(false);
  }

  function handleCourseChange(
    courseId: string
  ) {
    setSelectedCourseId(
      courseId
    );

    const selected =
      programmes.find(
        (programme) =>
          programme.id ===
          courseId
      );

    setSelectedCourseName(
      selected?.name || ""
    );

    setChecked(false);
  }

  function updateSecondOLevelSubject(index: number, subject: string) {
    setOLevelSecondSitting((current) =>
      current.map((entry, currentIndex) =>
        currentIndex === index ? { ...entry, subject } : entry
      )
    );
    setChecked(false);
  }

  function updateSecondOLevelGrade(index: number, grade: string) {
    setOLevelSecondSitting((current) =>
      current.map((entry, currentIndex) =>
        currentIndex === index ? { ...entry, grade } : entry
      )
    );
    setChecked(false);
  }

  function resetCalculator() {
    setCandidateName("");

    setSelectedCourseId(
      ""
    );

    setSelectedCourseName(
      ""
    );

    setLasuRequirement(
      null
    );

    setRequirementError(
      ""
    );

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
        {
          length: 8,
        },
        () => ({
          subject: "",
          grade: "",
        })
      ),
    ]);

    setOLevelSittings(1);
    setOLevelSecondSitting([
      ...Array.from({ length: 9 }, () => ({ subject: "", grade: "" })),
    ]);

    setChecked(false);
  }

  async function buildBrandedReportCanvas() {
    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width = 1240;
    canvas.height = 1754;

    const ctx =
      canvas.getContext(
        "2d"
      );

    if (!ctx) {
      throw new Error(
        "Unable to create report."
      );
    }

    const GREEN =
      "#006837";

    const DARK_GREEN =
      "#064e3b";

    const BRIGHT_GREEN =
      "#16a34a";

    const LIGHT_GREEN =
      "#ecfdf5";

    const RED =
      "#dc2626";

    const DARK =
      "#0f172a";

    const GRAY =
      "#475569";

    const LIGHT_GRAY =
      "#eef2f5";

    const BORDER =
      "#cbd5e1";

    const WHITE =
      "#ffffff";

    ctx.fillStyle = WHITE;

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    /*
     * TOP DECORATION
     */

    ctx.beginPath();

    ctx.moveTo(
      1025,
      0
    );

    ctx.lineTo(
      1240,
      0
    );

    ctx.lineTo(
      1240,
      185
    );

    ctx.closePath();

    ctx.fillStyle =
      "#062f28";

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(
      1075,
      0
    );

    ctx.lineTo(
      1240,
      0
    );

    ctx.lineTo(
      1240,
      135
    );

    ctx.closePath();

    ctx.fillStyle =
      "#00853f";

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(
      1135,
      0
    );

    ctx.lineTo(
      1240,
      0
    );

    ctx.lineTo(
      1240,
      78
    );

    ctx.closePath();

    ctx.fillStyle =
      BRIGHT_GREEN;

    ctx.fill();

    /*
     * BOTTOM DECORATION
     */

    ctx.beginPath();

    ctx.moveTo(
      0,
      1575
    );

    ctx.lineTo(
      0,
      1754
    );

    ctx.lineTo(
      180,
      1754
    );

    ctx.closePath();

    ctx.fillStyle =
      "#062f28";

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(
      0,
      1630
    );

    ctx.lineTo(
      0,
      1754
    );

    ctx.lineTo(
      130,
      1754
    );

    ctx.closePath();

    ctx.fillStyle =
      BRIGHT_GREEN;

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(
      48,
      1685
    );

    ctx.lineTo(
      90,
      1754
    );

    ctx.lineTo(
      190,
      1754
    );

    ctx.closePath();

    ctx.fillStyle = RED;

    ctx.fill();

    /*
     * LOGO
     */

    let logo:
      HTMLCanvasElement |
      null = null;

    try {
      const originalLogo =
        await loadImage(
          "/soh-logo.jpg"
        );

      logo =
        createCroppedLogo(
          originalLogo
        );
    } catch {
      logo = null;
    }

    if (logo) {
      const maxWidth = 320;
      const maxHeight = 140;

      const scale =
        Math.min(
          maxWidth /
            logo.width,
          maxHeight /
            logo.height
        );

      const drawWidth =
        logo.width *
        scale;

      const drawHeight =
        logo.height *
        scale;

      ctx.drawImage(
        logo,
        52,
        28,
        drawWidth,
        drawHeight
      );
    } else {
      ctx.font =
        "800 34px Arial";

      ctx.fillStyle =
        GREEN;

      ctx.fillText(
        "S.O.H CONSULTS",
        55,
        90
      );
    }

    /*
     * TAGLINE
     */

    ctx.strokeStyle =
      "#94a3b8";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
      895,
      52
    );

    ctx.lineTo(
      895,
      126
    );

    ctx.stroke();

    ctx.font =
      "italic 24px Arial";

    ctx.fillStyle =
      DARK;

    ctx.fillText(
      "Your Admission",
      920,
      78
    );

    ctx.fillText(
      "Journey, Our Priority",
      920,
      108
    );

    ctx.fillStyle =
      GREEN;

    ctx.fillRect(
      920,
      132,
      74,
      4
    );

    /*
     * TITLE
     */

    ctx.font =
      "800 47px Arial";

    ctx.fillStyle =
      DARK;

    ctx.fillText(
      "LASU AGGREGATE & ELIGIBILITY REPORT",
      55,
      218
    );

    ctx.font =
      "400 18px Arial";

    ctx.fillStyle =
      "#334155";

    ctx.fillText(
      "F O R   G U I D A N C E   P U R P O S E S   O N L Y",
      57,
      255
    );

    ctx.fillStyle =
      GREEN;

    ctx.fillRect(
      55,
      276,
      1130,
      4
    );

    /*
     * WATERMARK
     */

    if (logo) {
      ctx.save();

      ctx.globalAlpha =
        0.035;

      const maxWidth =
        600;

      const scale =
        maxWidth /
        logo.width;

      ctx.drawImage(
        logo,
        320,
        430,
        maxWidth,
        logo.height *
          scale
      );

      ctx.restore();
    }

    /*
     * CANDIDATE INFORMATION
     */

    const topY = 302;

    roundedBox(
      ctx,
      55,
      topY,
      715,
      215,
      10,
      WHITE,
      BORDER
    );

    drawSectionHeader(
      ctx,
      "CANDIDATE INFORMATION",
      55,
      topY,
      715
    );

    const candidateRows =
      [
        [
          "Candidate Name:",
          candidateName.trim() ||
            "Not provided",
        ],

        [
          "Selected Course:",
          selectedCourseName ||
            "Not selected",
        ],

        [
          "Report Date:",
          new Date().toLocaleString(
            "en-NG",
            {
              dateStyle:
                "medium",

              timeStyle:
                "short",
            }
          ),
        ],

        [
          "Generated By:",
          "S.O.H CONSULTS",
        ],
      ];

    let infoY =
      topY + 82;

    for (
      const [
        label,
        value,
      ] of candidateRows
    ) {
      ctx.font =
        "700 18px Arial";

      ctx.fillStyle =
        DARK;

      ctx.fillText(
        label,
        78,
        infoY
      );

      ctx.font =
        "400 18px Arial";

      ctx.fillText(
        value,
        280,
        infoY
      );

      infoY += 38;
    }

    /*
     * ELIGIBILITY STATUS
     */

    const eligible =
      validation.eligible;

    roundedBox(
      ctx,
      795,
      topY,
      390,
      215,
      10,
      eligible
        ? "#f0fdf4"
        : "#fef2f2",
      eligible
        ? "#bbf7d0"
        : "#fecaca"
    );

    ctx.textAlign =
      "center";

    ctx.font =
      "700 22px Arial";

    ctx.fillStyle =
      eligible
        ? "#15803d"
        : "#b91c1c";

    ctx.fillText(
      "ELIGIBILITY STATUS",
      990,
      topY + 46
    );

    drawStatusIcon(
      ctx,
      860,
      topY + 94,
      eligible
    );

    ctx.font =
      "800 37px Arial";

    ctx.fillText(
      eligible
        ? "ELIGIBLE"
        : "NOT ELIGIBLE",
      1015,
      topY + 101
    );

    ctx.font =
      "700 14px Arial";

    ctx.fillStyle =
      DARK;

    ctx.fillText(
      "BASED ON ENTERED DETAILS",
      990,
      topY + 130
    );

    ctx.strokeStyle =
      BORDER;

    ctx.beginPath();

    ctx.moveTo(
      825,
      topY + 149
    );

    ctx.lineTo(
      1155,
      topY + 149
    );

    ctx.stroke();

    ctx.font =
      "400 18px Arial";

    ctx.fillText(
      "Estimated Aggregate",
      990,
      topY + 176
    );

    ctx.font =
      "800 34px Arial";

    ctx.fillStyle =
      eligible
        ? "#166534"
        : "#b91c1c";

    ctx.fillText(
      `${aggregate.toFixed(
        2
      )} / 100`,
      990,
      topY + 207
    );

    ctx.textAlign =
      "left";

    /*
     * COURSE REQUIREMENTS
     */

    const requirementY =
      542;

    roundedBox(
      ctx,
      55,
      requirementY,
      1130,
      205,
      10,
      WHITE,
      BORDER
    );

    drawSectionHeader(
      ctx,
      "LASU COURSE REQUIREMENTS",
      55,
      requirementY,
      1130
    );

    ctx.fillStyle =
      LIGHT_GRAY;

    ctx.fillRect(
      55,
      requirementY +
        44,
      1130,
      42
    );

    ctx.font =
      "700 17px Arial";

    ctx.fillStyle =
      DARK;

    ctx.fillText(
      "Requirement Type",
      78,
      requirementY +
        71
    );

    ctx.fillText(
      "Requirement Details",
      320,
      requirementY +
        71
    );

    ctx.strokeStyle =
      BORDER;

    ctx.beginPath();

    ctx.moveTo(
      300,
      requirementY +
        44
    );

    ctx.lineTo(
      300,
      requirementY +
        205
    );

    ctx.stroke();

    ctx.font =
      "700 18px Arial";

    ctx.fillText(
      "O-Level",
      78,
      requirementY +
        120
    );

    drawWrappedText(
      ctx,
      lasuRequirement?.oLevel ||
        "Requirement unavailable.",
      320,
      requirementY +
        112,
      830,
      21,
      "400 17px Arial"
    );

    ctx.strokeStyle =
      BORDER;

    ctx.beginPath();

    ctx.moveTo(
      55,
      requirementY +
        150
    );

    ctx.lineTo(
      1185,
      requirementY +
        150
    );

    ctx.stroke();

    ctx.font =
      "700 18px Arial";

    ctx.fillText(
      "UTME",
      78,
      requirementY +
        181
    );

    drawWrappedText(
      ctx,
      lasuRequirement?.utme ||
        "Requirement unavailable.",
      320,
      requirementY +
        181,
      830,
      21,
      "400 17px Arial"
    );

    /*
     * JAMB + OLEVEL
     */

    const middleY = 770;

    roundedBox(
      ctx,
      55,
      middleY,
      548,
      305,
      10,
      WHITE,
      BORDER
    );

    drawSectionHeader(
      ctx,
      "JAMB UTME DETAILS",
      55,
      middleY,
      548
    );

    const jambRows =
      [
        [
          "JAMB Score:",
          jambScore ||
            "Not entered",
        ],

        [
          "LASU Minimum Cut-off:",
          String(
            LASU_CUTOFF_MARK
          ),
        ],

        [
          "UTME Points (60%):",
          `${jambPoints.toFixed(
            2
          )} / 60`,
        ],
      ];

    let jambY =
      middleY + 82;

    for (
      const [
        label,
        value,
      ] of jambRows
    ) {
      ctx.font =
        "700 16px Arial";

      ctx.fillStyle =
        DARK;

      ctx.fillText(
        label,
        78,
        jambY
      );

      ctx.font =
        "400 16px Arial";

      ctx.fillText(
        value,
        290,
        jambY
      );

      ctx.strokeStyle =
        "#e2e8f0";

      ctx.beginPath();

      ctx.moveTo(
        70,
        jambY + 12
      );

      ctx.lineTo(
        585,
        jambY + 12
      );

      ctx.stroke();

      jambY += 42;
    }

    ctx.font =
      "700 16px Arial";

    ctx.fillText(
      "Selected Subjects:",
      78,
      jambY + 3
    );

    const reportJambSubjects =
      [
        "Use of English (Compulsory)",
        ...selectedJambSubjects,
      ];

    let subjectY =
      jambY + 31;

    ctx.font =
      "400 15px Arial";

    for (
      const subject of
      reportJambSubjects
    ) {
      ctx.fillText(
        `• ${subject}`,
        290,
        subjectY
      );

      subjectY += 23;
    }

    /*
     * OLEVEL RESULTS
     */

    roundedBox(
      ctx,
      628,
      middleY,
      557,
      305,
      10,
      WHITE,
      BORDER
    );

    drawSectionHeader(
      ctx,
      "O-LEVEL RESULTS",
      628,
      middleY,
      557
    );

    ctx.fillStyle =
      LIGHT_GRAY;

    ctx.fillRect(
      628,
      middleY + 44,
      557,
      40
    );

    ctx.font =
      "700 16px Arial";

    ctx.fillStyle =
      DARK;

    ctx.textAlign =
      "center";

    ctx.fillText(
      "S/N",
      668,
      middleY + 70
    );

    ctx.textAlign =
      "left";

    ctx.fillText(
      "Subject",
      720,
      middleY + 70
    );

    ctx.textAlign =
      "center";

    ctx.fillText(
      "Grade",
      1037,
      middleY + 70
    );

    ctx.fillText(
      "Point",
      1136,
      middleY + 70
    );

    const visibleResults =
      completedOLevelResults.slice(
        0,
        9
      );

    const oLevelRowStep =
      23;

    let resultY =
      middleY + 108;

    for (
      let index = 0;
      index <
      visibleResults.length;
      index++
    ) {
      const entry =
        visibleResults[
          index
        ];

      ctx.font =
        "400 14px Arial";

      ctx.fillStyle =
        DARK;

      ctx.textAlign =
        "center";

      ctx.fillText(
        String(index + 1),
        668,
        resultY
      );

      ctx.textAlign =
        "left";

      ctx.fillText(
        entry.subject,
        720,
        resultY
      );

      ctx.textAlign =
        "center";

      ctx.fillText(
        entry.grade,
        1037,
        resultY
      );

      ctx.fillText(
        String(
          (
            (gradePoints[
              entry.grade
            ] ?? 0) *
            oLevelSittingMultiplier
          ).toFixed(
            oLevelSittings === 2 ? 1 : 0
          )
        ),
        1136,
        resultY
      );

      ctx.strokeStyle =
        "#e2e8f0";

      ctx.beginPath();

      ctx.moveTo(
        642,
        resultY + 9
      );

      ctx.lineTo(
        1170,
        resultY + 9
      );

      ctx.stroke();

      resultY +=
        oLevelRowStep;
    }

    ctx.textAlign =
      "left";

    /*
     * BEST FIVE
     */

    const lowerY = 1100;

    roundedBox(
      ctx,
      55,
      lowerY,
      548,
      300,
      10,
      WHITE,
      BORDER
    );

    drawSectionHeader(
      ctx,
      "BEST FIVE O-LEVEL RESULTS",
      55,
      lowerY,
      548
    );

    ctx.fillStyle =
      LIGHT_GRAY;

    ctx.fillRect(
      55,
      lowerY + 44,
      548,
      40
    );

    ctx.font =
      "700 16px Arial";

    ctx.fillStyle =
      DARK;

    ctx.fillText(
      "Subject",
      78,
      lowerY + 70
    );

    ctx.textAlign =
      "center";

    ctx.fillText(
      "Grade",
      425,
      lowerY + 70
    );

    ctx.fillText(
      "Point",
      550,
      lowerY + 70
    );

    ctx.textAlign =
      "left";

    let bestY =
      lowerY + 112;

    for (
      const entry of bestFive
    ) {
      ctx.font =
        "400 16px Arial";

      ctx.fillStyle =
        DARK;

      ctx.fillText(
        entry.subject,
        78,
        bestY
      );

      ctx.textAlign =
        "center";

      ctx.fillText(
        entry.grade,
        425,
        bestY
      );

      ctx.fillText(
        String(
          (
            (gradePoints[
              entry.grade
            ] ?? 0) *
            oLevelSittingMultiplier
          ).toFixed(
            oLevelSittings === 2 ? 1 : 0
          )
        ),
        550,
        bestY
      );

      ctx.textAlign =
        "left";

      ctx.strokeStyle =
        "#e2e8f0";

      ctx.beginPath();

      ctx.moveTo(
        70,
        bestY + 12
      );

      ctx.lineTo(
        585,
        bestY + 12
      );

      ctx.stroke();

      bestY += 38;
    }

    /*
     * AGGREGATE
     */

    roundedBox(
      ctx,
      628,
      lowerY,
      557,
      190,
      10,
      WHITE,
      BORDER
    );

    drawSectionHeader(
      ctx,
      "AGGREGATE SUMMARY",
      628,
      lowerY,
      557
    );

    ctx.font =
      "400 17px Arial";

    ctx.fillStyle =
      DARK;

    ctx.fillText(
      "JAMB Points (60%)",
      650,
      lowerY + 82
    );

    ctx.font =
      "700 17px Arial";

    ctx.fillText(
      `${jambPoints.toFixed(
        2
      )} / 60`,
      1010,
      lowerY + 82
    );

    ctx.font =
      "400 17px Arial";

    ctx.fillText(
      "O-Level Points (40%)",
      650,
      lowerY + 119
    );

    ctx.font =
      "700 17px Arial";

    ctx.fillText(
      `${oLevelPoints.toFixed(
        2
      )} / 40`,
      1010,
      lowerY + 119
    );

    ctx.fillStyle =
      "#dcfce7";

    ctx.fillRect(
      628,
      lowerY + 134,
      557,
      56
    );

    ctx.font =
      "700 19px Arial";

    ctx.fillStyle =
      DARK_GREEN;

    ctx.fillText(
      "Estimated Aggregate",
      650,
      lowerY + 170
    );

    ctx.font =
      "800 25px Arial";

    ctx.fillText(
      `${aggregate.toFixed(
        2
      )} / 100`,
      990,
      lowerY + 170
    );

    /*
     * ASSESSMENT
     */

    const assessmentY =
      1310;

    roundedBox(
      ctx,
      628,
      assessmentY,
      557,
      95,
      10,
      WHITE,
      BORDER
    );

    drawSectionHeader(
      ctx,
      "ASSESSMENT",
      628,
      assessmentY,
      557
    );

    drawStatusIcon(
      ctx,
      675,
      assessmentY + 70,
      eligible
    );

    ctx.font =
      "700 17px Arial";

    ctx.fillStyle =
      eligible
        ? "#15803d"
        : "#b91c1c";

    ctx.fillText(
      eligible
        ? "Eligible based on entered details"
        : "Requirements not fully satisfied",
      720,
      assessmentY + 67
    );

    /*
     * NOTES
     */

    const notesY = 1435;

    roundedBox(
      ctx,
      55,
      notesY,
      1130,
      175,
      10,
      "#f8fafc",
      "#e2e8f0"
    );

    ctx.font =
      "800 19px Arial";

    ctx.fillStyle =
      DARK;

    ctx.fillText(
      "ⓘ  IMPORTANT NOTES",
      78,
      notesY + 38
    );

    const notes = [
      "This report is generated by S.O.H CONSULTS for guidance and self-screening purposes only.",
      "It is not an official LASU admission letter, screening result, or guarantee of admission.",
      "Programme and requirement information should be verified before making any final admission decision.",
    ];

    let noteY =
      notesY + 75;

    for (
      const note of notes
    ) {
      drawWrappedText(
        ctx,
        `• ${note}`,
        95,
        noteY,
        1040,
        20,
        "400 15px Arial",
        DARK
      );

      noteY += 35;
    }

    /*
     * FOOTER
     */

    ctx.font =
      "italic 18px Georgia";

    ctx.fillStyle =
      GREEN;

    ctx.fillText(
      "Education  •  Opportunity  •  A Greater You",
      165,
      1686
    );

    ctx.strokeStyle =
      GREEN;

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
      745,
      1655
    );

    ctx.lineTo(
      745,
      1714
    );

    ctx.stroke();

    ctx.font =
      "400 15px Arial";

    ctx.fillStyle =
      DARK;

    ctx.fillText(
      "WhatsApp: 0818 214 1088",
      775,
      1680
    );

    ctx.fillText(
      "Oluyepeadetayo@gmail.com",
      775,
      1706
    );

    ctx.strokeStyle =
      "#94a3b8";

    ctx.beginPath();

    ctx.moveTo(
      1060,
      1655
    );

    ctx.lineTo(
      1060,
      1714
    );

    ctx.stroke();

    ctx.font =
      "400 14px Arial";

    ctx.fillStyle =
      DARK;

    ctx.fillText(
      "Page 1 of 1",
      1090,
      1693
    );

    return canvas;
  }

  async function downloadEligibilityReportJPG() {
    try {
      const canvas =
        await buildBrandedReportCanvas();

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return;
          }

          downloadBlob(
            blob,
            `LASU_Eligibility_Report_${getSafeCandidateName(
              candidateName
            )}.jpg`
          );
        },
        "image/jpeg",
        0.97
      );
    } catch (error) {
      console.error(
        error
      );

      alert(
        "Unable to generate the JPG report."
      );
    }
  }

  async function downloadEligibilityReportPDF() {
    try {
      const canvas =
        await buildBrandedReportCanvas();

      const imageData =
        canvas.toDataURL(
          "image/jpeg",
          0.97
        );

      const pdf =
        new jsPDF({
          orientation:
            "portrait",

          unit: "mm",

          format: "a4",

          compress: true,
        });

      pdf.addImage(
        imageData,
        "JPEG",
        0,
        0,
        210,
        297,
        undefined,
        "FAST"
      );

      pdf.save(
        `LASU_Eligibility_Report_${getSafeCandidateName(
          candidateName
        )}.pdf`
      );
    } catch (error) {
      console.error(
        error
      );

      alert(
        "Unable to generate the PDF report."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-6 text-white shadow-xl sm:p-8">
          <nav className="mb-6 flex flex-wrap items-center gap-2">
            <a
              href="/"
              className="rounded-full bg-white px-4 py-2 text-xs font-black transition hover:bg-green-50"
              style={{ color: "#15803d" }}
            >
              Home
            </a>

            <a
              href="/#updates"
              className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/25"
            >
              Latest Updates
            </a>

            <a
              href="/#opportunities"
              className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/25"
            >
              Opportunities
            </a>

            <a
              href="/lasu-calculator"
              className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/25"
            >
              LASU Calculator
            </a>

            <a
              href="https://wa.me/2348182141088?text=Hello%20S.O.H%20CONSULTS%2C%20I%20need%20admission%20guidance."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/25"
            >
              Get Guidance
            </a>
          </nav>

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
                Enter the candidate&apos;s details before checking eligibility.
              </p>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Candidate Name
                </label>

                <input
                  type="text"
                  placeholder="Enter candidate full name"
                  value={
                    candidateName
                  }
                  onChange={(
                    event
                  ) => {
                    setCandidateName(
                      event.target
                        .value
                    );

                    setChecked(
                      false
                    );
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Course
                </label>

                <select
                  value={
                    selectedCourseId
                  }
                  onChange={(
                    event
                  ) =>
                    handleCourseChange(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    programmesLoading
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100"
                >
                  <option value="">
                    {programmesLoading
                      ? "Loading LASU programmes..."
                      : "Select your course"}
                  </option>

                  {programmes.map(
                    (
                      programme
                    ) => (
                      <option
                        key={
                          programme.id
                        }
                        value={
                          programme.id
                        }
                      >
                        {
                          programme.name
                        }
                      </option>
                    )
                  )}
                </select>

                {programmesError && (
                  <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
                    {
                      programmesError
                    }
                  </div>
                )}

                {!programmesLoading &&
                  !programmesError &&
                  programmes.length >
                    0 && (
                    <p className="mt-2 text-xs font-semibold text-green-700">
                      {
                        programmes.length
                      }{" "}
                      programmes loaded from LASU.
                    </p>
                  )}
              </div>

              {selectedCourseId && (
                <div className="mt-5">
                  {requirementLoading && (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                      Loading current LASU course requirements...
                    </div>
                  )}

                  {requirementError && (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
                      <p className="font-black">
                        Could not load LASU requirements
                      </p>

                      <p className="mt-1">
                        {
                          requirementError
                        }
                      </p>
                    </div>
                  )}

                  {lasuRequirement &&
                    !requirementLoading && (
                      <div className="space-y-3">
                        <div className="rounded-2xl bg-green-50 p-4 ring-1 ring-green-100">
                          <p className="text-xs font-black uppercase tracking-wider text-green-700">
                            Current LASU O-Level Requirement
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {
                              lasuRequirement.oLevel
                            }
                          </p>
                        </div>

                        <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                          <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                            Current LASU UTME Requirement
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {
                              lasuRequirement.utme
                            }
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    JAMB UTME
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter your JAMB score and select your three UTME subjects in addition to compulsory Use of English.
                  </p>
                </div>

                <div className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                  Minimum:{" "}
                  {
                    LASU_CUTOFF_MARK
                  }
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
                  value={
                    jambScore
                  }
                  onChange={(
                    event
                  ) => {
                    setJambScore(
                      event.target
                        .value
                    );

                    setChecked(
                      false
                    );
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                    jambScore !==
                      "" &&
                    Number(
                      jambScore
                    ) <
                      LASU_CUTOFF_MARK
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 bg-white focus:border-green-600 focus:ring-green-100"
                  }`}
                />

                {jambScore !==
                  "" &&
                  Number(
                    jambScore
                  ) <
                    LASU_CUTOFF_MARK && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      JAMB score below{" "}
                      {
                        LASU_CUTOFF_MARK
                      }
                      . Candidate is disqualified for LASU screening.
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
                  (
                    value,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                    >
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        UTME Subject{" "}
                        {index +
                          2}
                      </label>

                      <select
                        value={
                          value
                        }
                        onChange={(
                          event
                        ) =>
                          updateJambSubject(
                            index,
                            event
                              .target
                              .value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      >
                        <option value="">
                          Select subject
                        </option>

                        {getAvailableJambOptions(
                          jambElectives,
                          index
                        ).map(
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
                            >
                              {
                                subject
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )
                )}
              </div>

              {selectedCourseName ===
                "Philosophy" && (
                <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800 ring-1 ring-blue-100">
                  <span className="font-bold">
                    Philosophy:
                  </span>{" "}
                  Use of English is compulsory, while the other three JAMB subjects can be any JAMB subjects.
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
                    Select one or two O-Level sittings, enter your results and select your grades. English Language is compulsory in a single sitting and in the first result when two sittings are used.
                  </p>
                </div>

                <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                  {
                    completedOLevelResults.length
                  }
                  /9
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-4">
                <label className="mb-2 block text-sm font-black text-slate-800">Number of O-Level Sittings</label>
                <select
                  value={oLevelSittings}
                  onChange={(event) => {
                    setOLevelSittings(Number(event.target.value) as 1 | 2);
                    setChecked(false);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:max-w-xs"
                >
                  <option value={1}>1 Sitting</option>
                  <option value={2}>2 Sittings</option>
                </select>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Select 2 Sittings if you want to combine valid O-Level subjects from two results. Where the same subject appears in both sittings, the better grade is used. LASU applies 90% of the normal O-Level grade points when two sittings are used.
                </p>
              </div>

              <h3 className="mt-6 text-sm font-black uppercase tracking-wide text-green-800">
                {oLevelSittings === 2 ? "First Sitting" : "O-Level Result"}
              </h3>

              <div className="mt-3 space-y-3">
                {oLevel.map(
                  (
                    entry,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      className="grid gap-3 sm:grid-cols-[1fr_160px]"
                    >
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-600">
                          Subject{" "}
                          {index +
                            1}
                        </label>

                        <select
                          value={
                            entry.subject
                          }
                          disabled={
                            index ===
                            0
                          }
                          onChange={(
                            event
                          ) =>
                            updateOLevelSubject(
                              index,
                              event
                                .target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100 disabled:font-semibold disabled:text-slate-500"
                        >
                          {index !==
                            0 && (
                            <option value="">
                              Select subject
                            </option>
                          )}

                          {getAvailableOLevelOptions(
                            oLevel,
                            index
                          ).map(
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
                              >
                                {
                                  subject
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-600">
                          Grade
                        </label>

                        <select
                          value={
                            entry.grade
                          }
                          onChange={(
                            event
                          ) =>
                            updateOLevelGrade(
                              index,
                              event
                                .target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                        >
                          <option value="">
                            Select grade
                          </option>

                          {grades.map(
                            (
                              grade
                            ) => (
                              <option
                                key={
                                  grade
                                }
                                value={
                                  grade
                                }
                              >
                                {
                                  grade
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                  )
                )}
              </div>

              {oLevelSittings === 2 && (
                <>
                  <h3 className="mt-7 text-sm font-black uppercase tracking-wide text-green-800">Second Sitting</h3>
                  <div className="mt-3 space-y-3">
                    {oLevelSecondSitting.map((entry, index) => (
                      <div key={index} className="grid gap-3 sm:grid-cols-[1fr_160px]">
                        <div>
                          <label className="mb-2 block text-xs font-bold text-slate-600">Subject {index + 1}</label>
                          <select
                            value={entry.subject}
                            disabled={false}
                            onChange={(event) => updateSecondOLevelSubject(index, event.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100 disabled:font-semibold disabled:text-slate-500"
                          >
                            <option value="">Select subject</option>
                            {getAvailableOLevelOptions(oLevelSecondSitting, index).map((subject) => (
                              <option key={subject} value={subject}>{subject}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold text-slate-600">Grade</label>
                          <select
                            value={entry.grade}
                            onChange={(event) => updateSecondOLevelGrade(index, event.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                          >
                            <option value="">Select grade</option>
                            {grades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedCourseName ===
                "Philosophy" && (
                <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800 ring-1 ring-blue-100">
                  <span className="font-bold">
                    Philosophy O-Level:
                  </span>{" "}
                  English Language plus any four other O-Level credit passes.
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-7">
              <h2 className="text-xl font-black text-slate-900">
                Live Aggregate
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    JAMB
                  </p>

                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {jambPoints.toFixed(
                      2
                    )}
                    /60
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    O-Level
                  </p>

                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {oLevelPoints.toFixed(
                      2
                    )}
                    /40
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-4 ring-1 ring-green-100">
                  <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                    Aggregate
                  </p>

                  <p className="mt-2 text-2xl font-black text-green-800">
                    {aggregate.toFixed(
                      2
                    )}
                    /100
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    setChecked(
                      true
                    )
                  }
                  disabled={
                    requirementLoading
                  }
                  className="flex-1 rounded-xl bg-green-700 px-5 py-3.5 text-sm font-black text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  Check Eligibility
                </button>

                <button
                  type="button"
                  onClick={
                    resetCalculator
                  }
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </div>

            {checked && (
              <div className="mt-8 border-t border-slate-200 pt-7">
                <div
                  className={`rounded-3xl p-5 ring-1 ${
                    validation.eligible
                      ? "bg-green-50 ring-green-200"
                      : "bg-red-50 ring-red-200"
                  }`}
                >
                  <p
                    className={`text-xs font-black uppercase tracking-widest ${
                      validation.eligible
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    Eligibility Result
                  </p>

                  <h2
                    className={`mt-2 text-2xl font-black ${
                      validation.eligible
                        ? "text-green-900"
                        : "text-red-900"
                    }`}
                  >
                    {validation.eligible
                      ? "Eligible based on entered details"
                      : "Requirements not fully satisfied"}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    Estimated aggregate:{" "}
                    <span className="font-black">
                      {aggregate.toFixed(
                        2
                      )}
                      /100
                    </span>
                  </p>

                  {validation.messages.length >
                    0 && (
                    <div className="mt-5">
                      <p className="text-sm font-black text-slate-900">
                        Validation Notes
                      </p>

                      <div className="mt-3 space-y-2">
                        {validation.messages.map(
                          (
                            message,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="rounded-xl bg-white px-4 py-3 text-sm leading-6 text-slate-700 ring-1 ring-slate-200"
                            >
                              {
                                message
                              }
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {bestFive.length >
                    0 && (
                    <div className="mt-5">
                      <p className="text-sm font-black text-slate-900">
                        Best Five O-Level Results
                      </p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {bestFive.map(
                          (
                            entry
                          ) => (
                            <div
                              key={
                                entry.subject
                              }
                              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-slate-200"
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

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={
                        downloadEligibilityReportPDF
                      }
                      className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white transition hover:bg-slate-800"
                    >
                      📄 Download Report (PDF)
                    </button>

                    <button
                      type="button"
                      onClick={
                        downloadEligibilityReportJPG
                      }
                      className="w-full rounded-xl bg-green-700 px-4 py-3.5 text-sm font-black text-white transition hover:bg-green-800"
                    >
                      🖼️ Download Report (JPG)
                    </button>
                  </div>

                  <p className="mt-3 text-center text-xs text-slate-500">
                    Download your complete eligibility report as a PDF or JPG image.
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
                    1. Live LASU course list
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Current LASU programmes are loaded automatically.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    2. JAMB score
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    LASU&apos;s minimum UTME score used by this checker is 195.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    3. Course requirements
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Current O-Level and UTME requirements are retrieved when a course is selected.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    4. Aggregate
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    JAMB contributes up to 60 points and the best five O-Level grades contribute up to 40 points.
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
                Get guidance with LASU admission screening, registration and related admission processes.
              </p>

              <div className="mt-4 space-y-3">
                <a
                  href="https://wa.me/2348182141088?text=Hello%20S.O.H%20CONSULTS%2C%20I%20need%20assistance."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl bg-white/10 px-4 py-3 text-center text-sm font-bold transition hover:bg-white/20"
                >
                  💬 Chat with us on WhatsApp
                </a>

                <a
                  href="https://whatsapp.com/channel/0029VbD6QQp3GJP68dl9TK29"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl bg-white px-4 py-3 text-center text-sm font-black transition hover:bg-green-50"
                  style={{ color: "#15803d" }}
                >
                  📢 Join our WhatsApp Channel
                </a>
              </div>
            </div>
          </aside>
        </div>


        <section
          aria-labelledby="lasu-calculator-guide"
          className="mt-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-widest text-green-700">
              LASU Admission Guide
            </p>

            <h2
              id="lasu-calculator-guide"
              className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl"
            >
              How to calculate your LASU aggregate score
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              The S.O.H CONSULTS LASU Aggregate Calculator &amp; Eligibility
              Checker helps candidates estimate their admission screening
              aggregate and check whether their entered UTME and O&apos;Level
              subjects satisfy the requirements returned for their selected
              Lagos State University programme.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <p className="text-sm font-black text-slate-900">
                1. UTME contribution
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your JAMB score is multiplied by 0.15, giving a maximum of 60
                points from a possible UTME score of 400.
              </p>
            </article>

            <article className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <p className="text-sm font-black text-slate-900">
                2. O&apos;Level contribution
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The checker uses the best five relevant O&apos;Level credit
                grades. The five selected grades can contribute up to 40
                points.
              </p>
            </article>

            <article className="rounded-2xl bg-green-50 p-5 ring-1 ring-green-100">
              <p className="text-sm font-black text-green-900">
                3. Estimated aggregate
              </p>
              <p className="mt-2 text-sm leading-6 text-green-800">
                Your UTME points and O&apos;Level points are added together to
                give an estimated LASU aggregate score out of 100.
              </p>
            </article>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-black text-slate-900">
              LASU Aggregate Calculator FAQ
            </h2>

            <div className="mt-4 space-y-3">
              <details className="group rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <summary className="cursor-pointer list-none text-sm font-black text-slate-900">
                  How is the LASU aggregate score calculated?
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  This checker calculates the UTME component as JAMB score ×
                  0.15, for a maximum of 60 points, then adds the points from
                  the best five relevant O&apos;Level grades, for a maximum of
                  40 points. The result is an estimated aggregate score out of
                  100.
                </p>
              </details>

              <details className="group rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <summary className="cursor-pointer list-none text-sm font-black text-slate-900">
                  What UTME score does this LASU checker use as the minimum?
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The checker currently uses 195 as the minimum UTME score for
                  its eligibility validation.
                </p>
              </details>

              <details className="group rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <summary className="cursor-pointer list-none text-sm font-black text-slate-900">
                  Does the calculator check LASU course requirements?
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Yes. When you select a programme, the checker loads its
                  available UTME and O&apos;Level requirements and compares
                  them with the subjects and grades you enter.
                </p>
              </details>

              <details className="group rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <summary className="cursor-pointer list-none text-sm font-black text-slate-900">
                  Does a high aggregate score guarantee LASU admission?
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  No. The result is for guidance only. Admission still depends
                  on the official LASU and JAMB admission process, programme
                  requirements, available spaces and other applicable
                  conditions.
                </p>
              </details>

              <details className="group rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <summary className="cursor-pointer list-none text-sm font-black text-slate-900">
                  Can I use the checker for any LASU undergraduate programme?
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The programme list is loaded by the checker. Select your
                  intended course to view the available requirements and run
                  the eligibility check using your own results.
                </p>
              </details>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="/updates"
              className="rounded-xl bg-green-700 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-green-800"
            >
              View LASU &amp; Admission Updates
            </a>

            <a
              href="/opportunities"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-black text-slate-900 transition hover:bg-slate-50"
            >
              Explore Admission Opportunities
            </a>
          </div>
        </section>

        <SiteContact />

        <footer className="mt-8 rounded-2xl bg-slate-900 px-5 py-5 text-center text-xs leading-5 text-slate-400">
          S.O.H CONSULTS • LASU Aggregate & Eligibility Checker
          <br />
          For guidance purposes only. This checker does not guarantee admission.
        </footer>
      </div>
    </main>
  );
}