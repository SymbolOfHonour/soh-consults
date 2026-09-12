"use client";

import { useMemo, useState } from "react";

const gradePoints: Record<string, number> = {
  A1: 10,
  B2: 9,
  B3: 8,
  C4: 7,
  C5: 6,
  C6: 5,
};

const grades = ["A1", "B2", "B3", "C4", "C5", "C6"];

const oLevelSubjects = [
  "English Language",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Agricultural Science",
  "Economics",
  "Government",
  "Civic Education",
  "Literature in English",
  "Geography",
  "Commerce",
  "Accounting",
  "Marketing",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "History",
  "Further Mathematics",
  "Computer Studies",
  "Data Processing",
  "Technical Drawing",
  "Basic Electricity",
  "Basic Technology",
  "Food and Nutrition",
  "Home Management",
  "Physical Education",
  "Health Education",
  "Yoruba",
  "Igbo",
  "Hausa",
  "French",
  "Visual Arts",
  "Fine Arts",
  "Music",
  "Animal Husbandry",
  "Fisheries",
  "Forestry",
  "Technical Science",
  "Building Construction",
  "Woodwork",
  "Metalwork",
  "Auto Mechanics",
  "Electrical Installation",
  "Clothing and Textiles",
  "Dyeing and Bleaching",
  "Catering Craft Practice",
  "Store Management",
  "Office Practice",
  "Insurance",
  "Typewriting",
  "Shorthand",
  "Salesmanship",
];

const jambSubjects = [
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Agricultural Science",
  "Economics",
  "Government",
  "Literature in English",
  "Geography",
  "Commerce",
  "Accounting",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "History",
  "Further Mathematics",
  "Computer Studies",
  "French",
  "Yoruba",
  "Igbo",
  "Hausa",
];

type CourseRequirement = {
  olevel: string[];
  jamb: string[];
};

const courseRequirements: Record<string, CourseRequirement> = {
  Accounting: {
    olevel: [
      "English Language",
      "Mathematics",
      "Economics",
      "Accounting",
      "Commerce",
    ],
    jamb: [
      "Use of English",
      "Mathematics",
      "Economics",
    ],
  },

  "Business Administration": {
    olevel: [
      "English Language",
      "Mathematics",
      "Economics",
      "Accounting",
      "Commerce",
    ],
    jamb: [
      "Use of English",
      "Mathematics",
      "Economics",
    ],
  },

  Economics: {
    olevel: [
      "English Language",
      "Mathematics",
      "Economics",
      "Government",
      "Commerce",
    ],
    jamb: [
      "Use of English",
      "Mathematics",
      "Economics",
    ],
  },

  Marketing: {
    olevel: [
      "English Language",
      "Mathematics",
      "Economics",
      "Commerce",
      "Accounting",
    ],
    jamb: [
      "Use of English",
      "Mathematics",
      "Economics",
    ],
  },

  "Mass Communication": {
    olevel: [
      "English Language",
      "Literature in English",
      "Government",
      "Economics",
      "Civic Education",
    ],
    jamb: [
      "Use of English",
      "Literature in English",
      "Government",
    ],
  },

  "Political Science": {
    olevel: [
      "English Language",
      "Government",
      "Mathematics",
      "Economics",
      "Civic Education",
    ],
    jamb: [
      "Use of English",
      "Government",
      "History",
    ],
  },

  Psychology: {
    olevel: [
      "English Language",
      "Mathematics",
      "Biology",
      "Economics",
      "Government",
    ],
    jamb: [
      "Use of English",
      "Biology",
    ],
  },

  Sociology: {
    olevel: [
      "English Language",
      "Mathematics",
      "Government",
      "Economics",
      "Biology",
    ],
    jamb: [
      "Use of English",
      "Mathematics",
    ],
  },

  "Computer Science": {
    olevel: [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Further Mathematics",
    ],
    jamb: [
      "Use of English",
      "Mathematics",
      "Physics",
    ],
  },

  Biochemistry: {
    olevel: [
      "English Language",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    jamb: [
      "Use of English",
      "Physics",
      "Chemistry",
      "Biology",
    ],
  },

  Microbiology: {
    olevel: [
      "English Language",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    jamb: [
      "Use of English",
      "Physics",
      "Chemistry",
      "Biology",
    ],
  },

  Botany: {
    olevel: [
      "English Language",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    jamb: [
      "Use of English",
      "Biology",
      "Chemistry",
      "Physics",
    ],
  },

  Zoology: {
    olevel: [
      "English Language",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
    ],
    jamb: [
      "Use of English",
      "Biology",
      "Chemistry",
      "Physics",
    ],
  },

  Physics: {
    olevel: [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Further Mathematics",
    ],
    jamb: [
      "Use of English",
      "Physics",
      "Mathematics",
      "Chemistry",
    ],
  },

  Chemistry: {
    olevel: [
      "English Language",
      "Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
    ],
    jamb: [
      "Use of English",
      "Chemistry",
      "Physics",
      "Mathematics",
    ],
  },

  Mathematics: {
    olevel: [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Further Mathematics",
    ],
    jamb: [
      "Use of English",
      "Mathematics",
      "Physics",
      "Chemistry",
    ],
  },

  "Medicine and Surgery": {
    olevel: [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
    ],
    jamb: [
      "Use of English",
      "Physics",
      "Chemistry",
      "Biology",
    ],
  },

  Dentistry: {
    olevel: [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
    ],
    jamb: [
      "Use of English",
      "Physics",
      "Chemistry",
      "Biology",
    ],
  },

  Nursing: {
    olevel: [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
    ],
    jamb: [
      "Use of English",
      "Physics",
      "Chemistry",
      "Biology",
    ],
  },

  Pharmacy: {
    olevel: [
      "English Language",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
    ],
    jamb: [
      "Use of English",
      "Physics",
      "Chemistry",
      "Biology",
    ],
  },

  Law: {
    olevel: [
      "English Language",
      "Mathematics",
      "Literature in English",
      "Government",
      "Civic Education",
    ],
    jamb: [
      "Use of English",
      "Literature in English",
      "Government",
    ],
  },

  "English Language": {
    olevel: [
      "English Language",
      "Literature in English",
      "Government",
      "History",
      "Civic Education",
    ],
    jamb: [
      "Use of English",
      "Literature in English",
      "Government",
    ],
  },

  "History and International Studies": {
    olevel: [
      "English Language",
      "History",
      "Government",
      "Economics",
      "Geography",
    ],
    jamb: [
      "Use of English",
      "History",
      "Government",
      "Economics",
    ],
  },
};

const courses = Object.keys(courseRequirements);

type OLevelEntry = {
  subject: string;
  grade: string;
};

export default function CalculatorPage() {
  const [candidateName, setCandidateName] = useState("");
  const [course, setCourse] = useState("");
  const [jambScore, setJambScore] = useState("");

  /*
    Use of English is permanently fixed.
    Candidate only selects the other three subjects.
  */
  const [jambTaken, setJambTaken] = useState<string[]>([
    "Use of English",
    "",
    "",
    "",
  ]);

  const [olevel, setOlevel] = useState<OLevelEntry[]>(
    Array.from({ length: 9 }, () => ({
      subject: "",
      grade: "",
    }))
  );

  const [calculated, setCalculated] = useState(false);

  const currentRequirement = course
    ? courseRequirements[course]
    : undefined;

  /*
    JAMB ELIGIBILITY
  */
  const jambEligibility = useMemo(() => {
    if (!course || !currentRequirement) {
      return null;
    }

    const selectedOtherSubjects = jambTaken
      .slice(1)
      .filter(Boolean);

    if (selectedOtherSubjects.length < 3) {
      return null;
    }

    const selectedSubjects = [
      "Use of English",
      ...selectedOtherSubjects,
    ];

    const uniqueSubjects = new Set(selectedSubjects);

    if (uniqueSubjects.size !== 4) {
      return {
        eligible: false,
        message:
          "Each JAMB subject must be different.",
        missing: [],
      };
    }

    const requiredSubjects = currentRequirement.jamb;

    const missing = requiredSubjects.filter(
      (subject) => !selectedSubjects.includes(subject)
    );

    return {
      eligible: missing.length === 0,
      message:
        missing.length === 0
          ? "Your selected JAMB subject combination satisfies the configured requirement for this course."
          : "Your selected JAMB subject combination does not satisfy the configured requirement for this course.",
      missing,
    };
  }, [course, jambTaken, currentRequirement]);

  /*
    RELEVANT O-LEVEL SUBJECTS
  */
  const relevantOlevel = useMemo(() => {
    if (!course || !currentRequirement) {
      return [];
    }

    return olevel
      .filter(
        (entry) =>
          entry.subject &&
          entry.grade &&
          currentRequirement.olevel.includes(entry.subject)
      )
      .sort(
        (a, b) =>
          (gradePoints[b.grade] || 0) -
          (gradePoints[a.grade] || 0)
      )
      .slice(0, 5);
  }, [course, olevel, currentRequirement]);

  const olevelPoints = relevantOlevel.reduce(
    (total, entry) =>
      total + (gradePoints[entry.grade] || 0),
    0
  );

  /*
    LASU UTME POINT:
    UTME SCORE / 8
  */
  const jambPoints = jambScore
    ? Number(jambScore) / 8
    : 0;

  /*
    FINAL AGGREGATE
  */
  const aggregate = jambPoints + olevelPoints;

  /*
    O-LEVEL ELIGIBILITY
  */
  const olevelEligible =
    relevantOlevel.length >= 5 &&
    relevantOlevel.every(
      (entry) =>
        (gradePoints[entry.grade] || 0) >= 5
    );

  const updateJambSubject = (
    index: number,
    value: string
  ) => {
    setJambTaken((previous) =>
      previous.map((subject, i) =>
        i === index ? value : subject
      )
    );

    setCalculated(false);
  };

  const updateOlevel = (
    index: number,
    field: "subject" | "grade",
    value: string
  ) => {
    setOlevel((previous) =>
      previous.map((entry, i) =>
        i === index
          ? {
              ...entry,
              [field]: value,
            }
          : entry
      )
    );

    setCalculated(false);
  };

  const resetForm = () => {
    setCandidateName("");
    setCourse("");
    setJambScore("");

    setJambTaken([
      "Use of English",
      "",
      "",
      "",
    ]);

    setOlevel(
      Array.from({ length: 9 }, () => ({
        subject: "",
        grade: "",
      }))
    );

    setCalculated(false);
  };

  const validJambScore =
    jambScore !== "" &&
    Number(jambScore) >= 0 &&
    Number(jambScore) <= 400;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">

          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="S.O.H CONSULTS"
              className="h-12 w-12 object-contain"
            />

            <div>
              <h1 className="text-lg font-extrabold text-green-800">
                S.O.H CONSULTS
              </h1>

              <p className="text-xs text-gray-500">
                Your Guide. Your Success.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/2348182141088"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
          >
            WhatsApp
          </a>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-green-800 px-4 py-12 text-white">
        <div className="mx-auto max-w-5xl text-center">

          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-green-200">
            2026/2027 Admission Screening
          </p>

          <h2 className="text-3xl font-extrabold md:text-5xl">
            LASU Aggregate & Eligibility Checker
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-green-100">
            Check your JAMB subject combination,
            O-Level requirements and estimated
            aggregate score before proceeding with
            your course.
          </p>

        </div>
      </section>

      {/* MAIN */}
      <section className="mx-auto max-w-5xl px-4 py-8">

        <div className="space-y-6">

          {/* CANDIDATE */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

            <h3 className="text-xl font-extrabold">
              Candidate Information
            </h3>

            <div className="mt-5">

              <label className="mb-2 block text-sm font-semibold">
                Candidate Name
              </label>

              <input
                type="text"
                value={candidateName}
                onChange={(e) => {
                  setCandidateName(e.target.value);
                  setCalculated(false);
                }}
                placeholder="Enter candidate name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

            </div>

          </div>

          {/* COURSE */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

            <h3 className="text-xl font-extrabold">
              Course Selection
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Select the course you intend to study.
            </p>

            <select
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);

                setJambTaken([
                  "Use of English",
                  "",
                  "",
                  "",
                ]);

                setCalculated(false);
              }}
              className="mt-5 w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >

              <option value="">
                Select your course
              </option>

              {courses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}

            </select>

          </div>

          {/* =======================================================
              JAMB SUBJECT SECTION
          ======================================================= */}
          {course && (
            <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-6 shadow-sm">

              <div className="mb-6">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-700 font-bold text-white">
                    1
                  </div>

                  <div>

                    <h3 className="text-xl font-extrabold text-green-900">
                      JAMB SUBJECT COMBINATION
                    </h3>

                    <p className="mt-1 text-sm text-green-800">
                      Enter the four JAMB subjects you actually
                      took. Use of English is compulsory.
                    </p>

                  </div>

                </div>

              </div>

              {/* FIXED ENGLISH */}
              <div className="mb-5">

                <label className="mb-2 block text-sm font-bold text-gray-700">
                  JAMB Subject 1
                </label>

                <div className="flex items-center justify-between rounded-xl border-2 border-green-300 bg-white px-4 py-4">

                  <div>
                    <p className="font-extrabold text-gray-900">
                      Use of English
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Automatically included
                    </p>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-700">
                    COMPULSORY
                  </span>

                </div>

              </div>

              {/* JAMB SUBJECT 2 */}
              <div className="mb-5">

                <label className="mb-2 block text-sm font-bold text-gray-700">
                  JAMB Subject 2
                </label>

                <select
                  value={jambTaken[1]}
                  onChange={(e) =>
                    updateJambSubject(
                      1,
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >

                  <option value="">
                    Select your JAMB subject
                  </option>

                  {jambSubjects
                    .filter(
                      (subject) =>
                        subject !== jambTaken[2] &&
                        subject !== jambTaken[3]
                    )
                    .map((subject) => (
                      <option
                        key={`subject-2-${subject}`}
                        value={subject}
                      >
                        {subject}
                      </option>
                    ))}

                </select>

              </div>

              {/* JAMB SUBJECT 3 */}
              <div className="mb-5">

                <label className="mb-2 block text-sm font-bold text-gray-700">
                  JAMB Subject 3
                </label>

                <select
                  value={jambTaken[2]}
                  onChange={(e) =>
                    updateJambSubject(
                      2,
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >

                  <option value="">
                    Select your JAMB subject
                  </option>

                  {jambSubjects
                    .filter(
                      (subject) =>
                        subject !== jambTaken[1] &&
                        subject !== jambTaken[3]
                    )
                    .map((subject) => (
                      <option
                        key={`subject-3-${subject}`}
                        value={subject}
                      >
                        {subject}
                      </option>
                    ))}

                </select>

              </div>

              {/* JAMB SUBJECT 4 */}
              <div className="mb-6">

                <label className="mb-2 block text-sm font-bold text-gray-700">
                  JAMB Subject 4
                </label>

                <select
                  value={jambTaken[3]}
                  onChange={(e) =>
                    updateJambSubject(
                      3,
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >

                  <option value="">
                    Select your JAMB subject
                  </option>

                  {jambSubjects
                    .filter(
                      (subject) =>
                        subject !== jambTaken[1] &&
                        subject !== jambTaken[2]
                    )
                    .map((subject) => (
                      <option
                        key={`subject-4-${subject}`}
                        value={subject}
                      >
                        {subject}
                      </option>
                    ))}

                </select>

              </div>

              {/* REQUIRED COMBINATION */}
              <div className="rounded-xl bg-white p-5 ring-1 ring-green-200">

                <h4 className="font-extrabold text-gray-900">
                  Required JAMB Combination for {course}
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  Your selected subjects will be checked against
                  the configured requirement for this course.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  {currentRequirement?.jamb.map(
                    (subject) => (
                      <span
                        key={subject}
                        className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800"
                      >
                        {subject}
                      </span>
                    )
                  )}

                </div>

              </div>

              {/* JAMB STATUS */}
              {jambTaken[1] &&
                jambTaken[2] &&
                jambTaken[3] &&
                jambEligibility && (
                  <div
                    className={`mt-5 rounded-xl border-2 p-5 ${
                      jambEligibility.eligible
                        ? "border-green-400 bg-green-100"
                        : "border-red-400 bg-red-50"
                    }`}
                  >

                    <h4
                      className={`text-lg font-extrabold ${
                        jambEligibility.eligible
                          ? "text-green-900"
                          : "text-red-900"
                      }`}
                    >
                      {jambEligibility.eligible
                        ? "✅ JAMB SUBJECT COMBINATION: QUALIFIED"
                        : "❌ JAMB SUBJECT COMBINATION: NOT QUALIFIED"}
                    </h4>

                    <p
                      className={`mt-2 text-sm ${
                        jambEligibility.eligible
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {jambEligibility.message}
                    </p>

                    {!jambEligibility.eligible &&
                      jambEligibility.missing.length > 0 && (
                        <div className="mt-3 rounded-lg bg-white p-3 text-sm font-semibold text-red-800">

                          Required subject missing:{" "}

                          {jambEligibility.missing.join(
                            ", "
                          )}

                        </div>
                      )}

                  </div>
                )}

            </div>
          )}

          {/* JAMB SCORE */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

            <h3 className="text-xl font-extrabold">
              JAMB Score
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Enter your UTME score out of 400.
            </p>

            <input
              type="number"
              min="0"
              max="400"
              value={jambScore}
              onChange={(e) => {
                setJambScore(e.target.value);
                setCalculated(false);
              }}
              placeholder="e.g. 285"
              className="mt-5 w-full rounded-xl border-2 border-gray-300 px-4 py-4 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            {jambScore &&
              !validJambScore && (
                <p className="mt-2 text-sm font-bold text-red-600">
                  JAMB score must be between 0 and 400.
                </p>
              )}

          </div>

          {/* O LEVEL */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

            <h3 className="text-xl font-extrabold">
              O-Level Results
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Enter the subjects and grades exactly as they
              appear on your SSCE result.
            </p>

            {course && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">

                <p className="text-sm font-extrabold text-green-900">
                  Relevant O-Level subjects considered for {course}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  {currentRequirement?.olevel.map(
                    (subject) => (
                      <span
                        key={subject}
                        className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-green-800 ring-1 ring-green-200"
                      >
                        {subject}
                      </span>
                    )
                  )}

                </div>

              </div>
            )}

            <div className="mt-6 space-y-3">

              {olevel.map((entry, index) => (

                <div
                  key={`olevel-${index}`}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]"
                >

                  <select
                    value={entry.subject}
                    onChange={(e) =>
                      updateOlevel(
                        index,
                        "subject",
                        e.target.value
                      )
                    }
                    className="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  >

                    <option value="">
                      Select O-Level subject
                    </option>

                    {oLevelSubjects.map(
                      (subject) => (
                        <option
                          key={`${index}-${subject}`}
                          value={subject}
                        >
                          {subject}
                        </option>
                      )
                    )}

                  </select>

                  <select
                    value={entry.grade}
                    onChange={(e) =>
                      updateOlevel(
                        index,
                        "grade",
                        e.target.value
                      )
                    }
                    className="rounded-xl border-2 border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  >

                    <option value="">
                      Select grade
                    </option>

                    {grades.map((grade) => (
                      <option
                        key={grade}
                        value={grade}
                      >
                        {grade}
                      </option>
                    ))}

                  </select>

                </div>

              ))}

            </div>

            <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">

              <strong>Grade points:</strong>{" "}
              A1 = 10, B2 = 9, B3 = 8, C4 = 7,
              C5 = 6, C6 = 5.

            </div>

          </div>

          {/* CALCULATE */}
          <button
            type="button"
            onClick={() => setCalculated(true)}
            disabled={
              !course ||
              !validJambScore ||
              !jambTaken[1] ||
              !jambTaken[2] ||
              !jambTaken[3]
            }
            className="w-full rounded-2xl bg-green-700 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Calculate Eligibility & Aggregate
          </button>

          {/* RESULT */}
          {calculated && (
            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200">

              <div className="text-center">

                <h3 className="text-2xl font-extrabold text-green-800">
                  Admission Eligibility Report
                </h3>

                {candidateName && (
                  <p className="mt-2 text-gray-600">
                    Candidate:{" "}
                    <span className="font-bold">
                      {candidateName}
                    </span>
                  </p>
                )}

                <p className="text-gray-600">
                  Course:{" "}
                  <span className="font-bold">
                    {course}
                  </span>
                </p>

              </div>

              {/* JAMB RESULT */}
              <div
                className={`mt-6 rounded-xl p-5 ${
                  jambEligibility?.eligible
                    ? "bg-green-50 ring-1 ring-green-200"
                    : "bg-red-50 ring-1 ring-red-200"
                }`}
              >

                <h4 className="font-extrabold">
                  {jambEligibility?.eligible
                    ? "🟢 JAMB Subject Combination: QUALIFIED"
                    : "🔴 JAMB Subject Combination: NOT QUALIFIED"}
                </h4>

                <p className="mt-2 text-sm">
                  {jambEligibility?.message ||
                    "Complete your three additional JAMB subject selections."}
                </p>

                {!jambEligibility?.eligible &&
                  jambEligibility?.missing &&
                  jambEligibility.missing.length > 0 && (
                    <p className="mt-3 text-sm font-bold text-red-700">
                      Missing required subject(s):{" "}
                      {jambEligibility.missing.join(", ")}
                    </p>
                  )}

              </div>

              {/* O LEVEL RESULT */}
              <div
                className={`mt-4 rounded-xl p-5 ${
                  olevelEligible
                    ? "bg-green-50 ring-1 ring-green-200"
                    : "bg-red-50 ring-1 ring-red-200"
                }`}
              >

                <h4 className="font-extrabold">
                  {olevelEligible
                    ? "🟢 O-Level Requirement: QUALIFIED"
                    : "🔴 O-Level Requirement: NOT QUALIFIED"}
                </h4>

                <p className="mt-2 text-sm">
                  {olevelEligible
                    ? "Five relevant O-Level subjects with acceptable grades were found."
                    : `Only ${relevantOlevel.length} relevant subject(s) were found.`}
                </p>

              </div>

              {/* SCORE CARDS */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">

                <div className="rounded-xl bg-gray-50 p-5 text-center">

                  <p className="text-sm text-gray-500">
                    JAMB Score
                  </p>

                  <p className="mt-1 text-2xl font-extrabold">
                    {jambScore}
                  </p>

                </div>

                <div className="rounded-xl bg-gray-50 p-5 text-center">

                  <p className="text-sm text-gray-500">
                    JAMB Points
                  </p>

                  <p className="mt-1 text-2xl font-extrabold">
                    {jambPoints.toFixed(2)}
                  </p>

                </div>

                <div className="rounded-xl bg-gray-50 p-5 text-center">

                  <p className="text-sm text-gray-500">
                    O-Level Points
                  </p>

                  <p className="mt-1 text-2xl font-extrabold">
                    {olevelPoints.toFixed(2)}
                  </p>

                </div>

              </div>

              {/* O LEVEL SUBJECTS USED */}
              <div className="mt-6 rounded-xl border border-gray-200 p-5">

                <h4 className="font-extrabold">
                  Best Relevant O-Level Subjects Used
                </h4>

                {relevantOlevel.length > 0 ? (
                  <div className="mt-3 space-y-2">

                    {relevantOlevel.map(
                      (entry, index) => (

                        <div
                          key={`${entry.subject}-${index}`}
                          className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                        >

                          <span>
                            {index + 1}.{" "}
                            {entry.subject}
                          </span>

                          <span className="font-bold text-green-700">
                            {entry.grade}{" "}
                            (
                            {
                              gradePoints[
                                entry.grade
                              ]
                            }{" "}
                            pts)
                          </span>

                        </div>

                      )
                    )}

                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">
                    No relevant O-Level subjects found yet.
                  </p>
                )}

              </div>

              {/* AGGREGATE */}
              <div className="mt-6 rounded-2xl bg-green-800 p-6 text-center text-white">

                <p className="text-sm font-bold text-green-100">
                  ESTIMATED AGGREGATE SCORE
                </p>

                <p className="mt-2 text-5xl font-black">
                  {aggregate.toFixed(2)}%
                </p>

                <p className="mt-2 text-xs text-green-200">
                  JAMB Points + O-Level Points
                </p>

              </div>

              {/* FINAL ELIGIBILITY */}
              <div className="mt-6">

                {jambEligibility?.eligible &&
                olevelEligible ? (

                  <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-6 text-center">

                    <h4 className="text-xl font-extrabold text-green-900">
                      🎉 You can proceed
                    </h4>

                    <p className="mt-2 text-sm text-green-800">
                      Your selected JAMB subject combination
                      and the O-Level requirements configured
                      for this course have been satisfied.
                    </p>

                  </div>

                ) : (

                  <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-6 text-center">

                    <h4 className="text-xl font-extrabold text-red-900">
                      ⚠️ Do not proceed yet
                    </h4>

                    <p className="mt-2 text-sm text-red-800">
                      One or more admission requirements have
                      not been satisfied. Review the requirements
                      above before proceeding.
                    </p>

                  </div>

                )}

              </div>

              {/* ACTIONS */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">

                <button
                  type="button"
                  onClick={() =>
                    window.print()
                  }
                  className="rounded-xl bg-gray-900 px-4 py-3 font-bold text-white hover:bg-gray-800"
                >
                  Print / Save Report
                </button>

                <a
                  href="https://services.lidc.lasu.edu.ng/admissionscreening/courserequirement/index.php"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-green-100 px-4 py-3 text-center font-bold text-green-800 hover:bg-green-200"
                >
                  Official Requirements
                </a>

                <a
                  href="https://wa.me/2348182141088"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-green-700 px-4 py-3 text-center font-bold text-white hover:bg-green-800"
                >
                  Get Guidance
                </a>

              </div>

            </div>
          )}

          {/* RESET */}
          <button
            type="button"
            onClick={resetForm}
            className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 font-bold text-gray-700 hover:bg-gray-50"
          >
            Start Again
          </button>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t bg-white px-4 py-8">

        <div className="mx-auto max-w-5xl text-center">

          <p className="font-extrabold text-green-800">
            S.O.H CONSULTS
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Your Guide. Your Success.
          </p>

          <p className="mt-3 text-sm text-gray-500">
            WhatsApp: 0818 214 1088 ·{" "}
            Oluyepeadetayo@gmail.com
          </p>

          <p className="mt-3 text-xs text-gray-400">
            This calculator is an estimation and should be
            cross-checked with the official LASU/JAMB
            requirements before application.
          </p>

        </div>

      </footer>

    </main>
  );
}