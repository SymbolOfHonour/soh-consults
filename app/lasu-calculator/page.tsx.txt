"use client";

import { useMemo, useState } from "react";

const WHATSAPP_NUMBER = "2348182141088";

const gradePoints: Record<string, number> = {
  A1: 8,
  B2: 7,
  B3: 6,
  C4: 5,
  C5: 4,
  C6: 3,
};

const subjects = [
  "English Language",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Government",
  "Literature in English",
  "Geography",
  "Commerce",
  "Accounting",
  "CRS",
  "IRS",
  "Agricultural Science",
  "Computer Studies",
  "Further Mathematics",
  "Technical Drawing",
  "Civic Education",
  "Data Processing",
];

const courses = [
  "Accounting",
  "Business Administration",
  "Economics",
  "Marketing",
  "Mass Communication",
  "Political Science",
  "Psychology",
  "Sociology",
  "Computer Science",
  "Biochemistry",
  "Microbiology",
  "Botany",
  "Zoology",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Medicine and Surgery",
  "Dentistry",
  "Nursing",
  "Pharmacy",
  "Law",
  "English Language",
  "History and International Studies",
];

type OLevelEntry = {
  subject: string;
  grade: string;
};

export default function LASUAggregateCalculator() {
  const [course, setCourse] = useState("");
  const [jambScore, setJambScore] = useState("");
  const [candidateName, setCandidateName] = useState("");

  const [olevel, setOlevel] = useState<OLevelEntry[]>(
    Array.from({ length: 9 }, () => ({
      subject: "",
      grade: "",
    }))
  );

  const [calculated, setCalculated] = useState(false);

  const updateOlevel = (
    index: number,
    field: keyof OLevelEntry,
    value: string
  ) => {
    setOlevel((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const result = useMemo(() => {
    const validEntries = olevel.filter(
      (item) => item.subject && item.grade
    );

    const ranked = [...validEntries]
      .filter((item) => gradePoints[item.grade] !== undefined)
      .sort(
        (a, b) =>
          gradePoints[b.grade] - gradePoints[a.grade]
      );

    const relevantFive = ranked.slice(0, 5);

    const olevelPoints = relevantFive.reduce(
      (total, item) => total + gradePoints[item.grade],
      0
    );

    const jamb = Number(jambScore) || 0;
    const jambPoints = jamb * 0.15;

    return {
      relevantFive,
      olevelPoints,
      jambPoints,
      aggregate: jambPoints + olevelPoints,
    };
  }, [olevel, jambScore]);

  const calculate = () => {
    if (!candidateName.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!course) {
      alert("Please select your intended course.");
      return;
    }

    if (
      !jambScore ||
      Number(jambScore) < 0 ||
      Number(jambScore) > 400
    ) {
      alert("Please enter a valid JAMB score between 0 and 400.");
      return;
    }

    const completedSubjects = olevel.filter(
      (item) => item.subject && item.grade
    );

    if (completedSubjects.length < 5) {
      alert("Please enter at least 5 O-Level subjects and grades.");
      return;
    }

    setCalculated(true);
  };

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hello S.O.H CONSULTS, I need help checking my LASU aggregate score for ${course}.`
  )}`;

  const downloadReport = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* HEADER */}
      <header className="bg-green-700 px-4 py-4 text-white shadow-md sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">

          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="S.O.H CONSULTS"
              className="h-12 w-12 rounded-full bg-white object-contain p-1"
            />

            <div>
              <h1 className="text-lg font-bold">
                S.O.H CONSULTS
              </h1>

              <p className="text-xs text-green-100">
                Your Guide. Your Success.
              </p>
            </div>
          </a>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-green-700"
          >
            WhatsApp Us
          </a>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-green-700 px-4 pb-12 text-white sm:px-6">
        <div className="mx-auto max-w-5xl">

          <p className="text-sm font-bold uppercase tracking-wide text-green-200">
            S.O.H CONSULTS
          </p>

          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            LASU Aggregate Score Calculator
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-green-50">
            Calculate your estimated LASU admission aggregate using
            your JAMB score and O-Level results.
          </p>

        </div>
      </section>

      {/* CALCULATOR */}
      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">

            {/* CANDIDATE DETAILS */}
            <div>
              <h3 className="text-xl font-bold">
                Candidate Information
              </h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <input
                  type="text"
                  placeholder="Full name"
                  value={candidateName}
                  onChange={(e) =>
                    setCandidateName(e.target.value)
                  }
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

                <select
                  value={course}
                  onChange={(e) =>
                    setCourse(e.target.value)
                  }
                  className="rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  <option value="">
                    Select intended LASU course
                  </option>

                  {courses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

              </div>
            </div>

            {/* JAMB */}
            <div className="mt-10">

              <h3 className="text-xl font-bold">
                JAMB Score
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Enter your UTME score out of 400.
              </p>

              <input
                type="number"
                min="0"
                max="400"
                placeholder="e.g. 280"
                value={jambScore}
                onChange={(e) =>
                  setJambScore(e.target.value)
                }
                className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

            </div>

            {/* O LEVEL */}
            <div className="mt-10">

              <h3 className="text-xl font-bold">
                O-Level Results
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Enter up to 9 subjects. The calculator will
                identify the five highest-scoring entries for
                this first version.
              </p>

              <div className="mt-5 space-y-3">

                {olevel.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-3 sm:grid-cols-[1fr_160px]"
                  >

                    <select
                      value={item.subject}
                      onChange={(e) =>
                        updateOlevel(
                          index,
                          "subject",
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600"
                    >
                      <option value="">
                        Select subject {index + 1}
                      </option>

                      {subjects.map((subject) => (
                        <option
                          key={subject}
                          value={subject}
                        >
                          {subject}
                        </option>
                      ))}
                    </select>

                    <select
                      value={item.grade}
                      onChange={(e) =>
                        updateOlevel(
                          index,
                          "grade",
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600"
                    >
                      <option value="">
                        Select grade
                      </option>

                      {Object.keys(gradePoints).map(
                        (grade) => (
                          <option
                            key={grade}
                            value={grade}
                          >
                            {grade} = {gradePoints[grade]} points
                          </option>
                        )
                      )}
                    </select>

                  </div>
                ))}

              </div>

            </div>

            {/* CALCULATE */}
            <button
              type="button"
              onClick={calculate}
              className="mt-8 w-full rounded-xl bg-green-700 px-6 py-4 text-sm font-bold text-white hover:bg-green-800"
            >
              Calculate Aggregate Score
            </button>

          </div>

          {/* RESULT */}
          {calculated && (
            <div
              id="screening-report"
              className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8"
            >

              <div className="text-center">

                <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                  S.O.H CONSULTS
                </p>

                <h3 className="mt-2 text-3xl font-extrabold">
                  LASU Screening Report
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Estimated aggregate calculation
                </p>

              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-xs font-bold uppercase text-gray-500">
                    Candidate
                  </p>
                  <p className="mt-1 font-bold">
                    {candidateName}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-xs font-bold uppercase text-gray-500">
                    Course
                  </p>
                  <p className="mt-1 font-bold">
                    {course}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-xs font-bold uppercase text-gray-500">
                    JAMB Score
                  </p>
                  <p className="mt-1 font-bold">
                    {jambScore}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-xs font-bold uppercase text-gray-500">
                    JAMB Points
                  </p>
                  <p className="mt-1 font-bold">
                    {result.jambPoints.toFixed(2)}
                  </p>
                </div>

              </div>

              {/* RELEVANT SUBJECTS */}
              <div className="mt-8">

                <h4 className="text-xl font-bold">
                  Current Top 5 O-Level Subjects
                </h4>

                <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-gray-200">

                  {result.relevantFive.map(
                    (item, index) => (
                      <div
                        key={`${item.subject}-${index}`}
                        className="flex items-center justify-between border-b border-gray-200 px-5 py-4 last:border-0"
                      >

                        <div>
                          <p className="font-semibold">
                            {item.subject}
                          </p>

                          <p className="text-xs text-gray-500">
                            Grade: {item.grade}
                          </p>
                        </div>

                        <span className="font-bold text-green-700">
                          {gradePoints[item.grade]} pts
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* TOTAL */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl bg-green-50 p-6">
                  <p className="text-sm font-bold text-green-700">
                    O-Level Points
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-green-800">
                    {result.olevelPoints}
                  </p>
                </div>

                <div className="rounded-2xl bg-green-700 p-6 text-white">
                  <p className="text-sm font-bold text-green-100">
                    Estimated Aggregate
                  </p>

                  <p className="mt-2 text-4xl font-extrabold">
                    {result.aggregate.toFixed(2)}%
                  </p>
                </div>

              </div>

              {/* ACTIONS */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={downloadReport}
                  className="rounded-xl bg-green-700 px-6 py-3 text-center text-sm font-bold text-white hover:bg-green-800"
                >
                  Download Screening Report
                </button>

                <a
                  href="https://services.lidc.lasu.edu.ng/admissionscreening/courserequirement/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border-2 border-green-700 px-6 py-3 text-center text-sm font-bold text-green-700 hover:bg-green-50"
                >
                  Check Official Course Requirements
                </a>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border-2 border-green-700 px-6 py-3 text-center text-sm font-bold text-green-700 hover:bg-green-50"
                >
                  Get Guidance
                </a>

              </div>

              <p className="mt-8 text-center text-xs leading-5 text-gray-500">
                This calculator is provided for guidance purposes only.
                It does not represent an official LASU admission decision.
                Candidates should verify course requirements and screening
                information through the official LASU portal.
              </p>

            </div>
          )}

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-900 px-4 py-8 text-center text-sm text-green-100">

        <p className="font-semibold text-white">
          S.O.H CONSULTS
        </p>

        <p className="mt-1">
          Your Guide. Your Success.
        </p>

        <p className="mt-4">
          WhatsApp: 0818 214 1088
        </p>

        <p className="mt-1">
          Email: Oluyepeadetayo@gmail.com
        </p>

        <p className="mt-4">
          © {new Date().getFullYear()} S.O.H CONSULTS. All rights reserved.
        </p>

      </footer>

    </main>
  );
}