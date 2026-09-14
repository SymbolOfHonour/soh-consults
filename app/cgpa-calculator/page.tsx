"use client";

import { useEffect, useMemo, useState } from "react";

type Course = { id: number; code: string; units: number; grade: string };
type System = "lasu" | "general";

const GRADES = [
  { letter: "A", point: 5, range: "70–100" },
  { letter: "B", point: 4, range: "60–69" },
  { letter: "C", point: 3, range: "50–59" },
  { letter: "D", point: 2, range: "45–49" },
  { letter: "E", point: 1, range: "40–44" },
  { letter: "F", point: 0, range: "0–39" },
];

const classification = (cgpa: number) => {
  if (cgpa >= 4.5) return "First Class";
  if (cgpa >= 3.5) return "Second Class Upper";
  if (cgpa >= 2.4) return "Second Class Lower";
  if (cgpa >= 1.5) return "Third Class";
  if (cgpa >= 1) return "Pass";
  return "Below Pass Level";
};

const initialCourses: Course[] = [
  { id: 1, code: "MKT 301", units: 3, grade: "A" },
  { id: 2, code: "MKT 303", units: 3, grade: "B" },
  { id: 3, code: "", units: 2, grade: "C" },
];

export default function CgpaCalculatorPage() {
  const [system, setSystem] = useState<System>("lasu");
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [previousCgpa, setPreviousCgpa] = useState("");
  const [previousUnits, setPreviousUnits] = useState("");
  const [targetCgpa, setTargetCgpa] = useState("4.50");
  const [futureUnits, setFutureUnits] = useState("24");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("soh-cgpa-calculator");
    if (!stored) return;
    try {
      const data = JSON.parse(stored);
      if (data.system === "lasu" || data.system === "general") setSystem(data.system);
      if (Array.isArray(data.courses) && data.courses.length) setCourses(data.courses);
      setPreviousCgpa(data.previousCgpa || "");
      setPreviousUnits(data.previousUnits || "");
      setTargetCgpa(data.targetCgpa || "4.50");
      setFutureUnits(data.futureUnits || "24");
    } catch { /* Ignore invalid saved browser data. */ }
  }, []);

  const result = useMemo(() => {
    const totalUnits = courses.reduce((sum, course) => sum + Math.max(0, Number(course.units) || 0), 0);
    const qualityPoints = courses.reduce((sum, course) => {
      const point = GRADES.find((grade) => grade.letter === course.grade)?.point || 0;
      return sum + point * Math.max(0, Number(course.units) || 0);
    }, 0);
    const semesterGpa = totalUnits ? qualityPoints / totalUnits : 0;
    const oldCgpa = Math.min(5, Math.max(0, Number(previousCgpa) || 0));
    const oldUnits = Math.max(0, Number(previousUnits) || 0);
    const cumulativeUnits = oldUnits + totalUnits;
    const cumulativeCgpa = cumulativeUnits ? (oldCgpa * oldUnits + qualityPoints) / cumulativeUnits : semesterGpa;
    const target = Math.min(5, Math.max(0, Number(targetCgpa) || 0));
    const plannedUnits = Math.max(0, Number(futureUnits) || 0);
    const requiredGpa = plannedUnits ? (target * (cumulativeUnits + plannedUnits) - cumulativeCgpa * cumulativeUnits) / plannedUnits : 0;
    const maximumCgpa = cumulativeUnits + plannedUnits ? (cumulativeCgpa * cumulativeUnits + 5 * plannedUnits) / (cumulativeUnits + plannedUnits) : cumulativeCgpa;
    return { totalUnits, qualityPoints, semesterGpa, cumulativeUnits, cumulativeCgpa, requiredGpa, maximumCgpa, target, plannedUnits };
  }, [courses, previousCgpa, previousUnits, targetCgpa, futureUnits]);

  function updateCourse(id: number, field: keyof Course, value: string | number) {
    setCourses((current) => current.map((course) => course.id === id ? { ...course, [field]: value } : course));
  }

  function addCourse() {
    setCourses((current) => [...current, { id: Date.now(), code: "", units: 3, grade: "A" }]);
  }

  function saveProgress() {
    window.localStorage.setItem("soh-cgpa-calculator", JSON.stringify({ system, courses, previousCgpa, previousUnits, targetCgpa, futureUnits }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function resetCalculator() {
    setCourses(initialCourses); setPreviousCgpa(""); setPreviousUnits(""); setTargetCgpa("4.50"); setFutureUnits("24");
    window.localStorage.removeItem("soh-cgpa-calculator");
  }

  const targetMessage = result.plannedUnits === 0
    ? "Enter your planned future units to run the simulation."
    : result.requiredGpa > 5
      ? `The target is not reachable within ${result.plannedUnits} units. Even straight As would produce about ${result.maximumCgpa.toFixed(2)}.`
      : result.requiredGpa <= 0
        ? "You have already reached this target CGPA. Keep protecting your result."
        : `You need an average GPA of ${result.requiredGpa.toFixed(2)} across the next ${result.plannedUnits} units.`;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><a href="/"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-16 w-auto" /></a><nav className="hidden gap-6 text-sm font-semibold md:flex"><a href="/">Home</a><a href="/updates">Updates</a><a href="/opportunities">Opportunities</a><a href="/lasu-calculator">LASU Calculator</a></nav><a href="https://wa.me/2348182141088" className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white">WhatsApp Us</a></div></header>

      <section className="bg-gradient-to-br from-green-950 via-green-900 to-green-700 py-14 text-white"><div className="mx-auto max-w-5xl px-5 text-center"><p className="font-bold uppercase tracking-widest text-green-300">S.O.H CONSULTS Academic Tool</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">CGPA Calculator & Simulator</h1><p className="mx-auto mt-5 max-w-3xl leading-8 text-green-50">Calculate your semester GPA, combine it with your previous result and discover what you need to reach your target CGPA.</p></div></section>

      <section className="py-12"><div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-black uppercase tracking-widest text-green-700">Grading system</p><h2 className="mt-1 text-2xl font-black">Choose your institution type</h2></div><select value={system} onChange={(event) => setSystem(event.target.value as System)} className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-bold outline-none focus:border-green-600"><option value="lasu">LASU 5.0 System</option><option value="general">General Nigerian 5.0 System</option></select></div>
          <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-900">{system === "lasu" ? "LASU is selected. Confirm the applicable grading rules in your faculty or official handbook where necessary." : "This uses the widely adopted Nigerian 5-point A–F scale. Confirm your institution’s exact grade ranges and classification rules."}</p>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">{GRADES.map((grade) => <div key={grade.letter} className="rounded-xl border border-gray-200 p-3 text-center"><p className="text-xl font-black text-green-700">{grade.letter}</p><p className="text-xs font-semibold text-gray-500">{grade.range}</p><p className="text-xs">{grade.point} point{grade.point === 1 ? "" : "s"}</p></div>)}</div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_0.75fr]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-widest text-green-700">Step 1</p><h2 className="mt-1 text-2xl font-black">Enter this semester’s courses</h2></div><button onClick={addCourse} className="rounded-xl bg-green-700 px-4 py-3 text-sm font-black text-white">+ Add Course</button></div>
              <div className="mt-6 space-y-3">{courses.map((course, index) => <div key={course.id} className="grid grid-cols-[1fr_76px_82px_42px] gap-2 rounded-2xl bg-gray-50 p-3 sm:grid-cols-[1fr_110px_120px_48px]"><input aria-label={`Course ${index + 1} code`} value={course.code} onChange={(event) => updateCourse(course.id, "code", event.target.value.toUpperCase())} placeholder={`Course ${index + 1}`} className="min-w-0 rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-green-600" /><select aria-label="Course units" value={course.units} onChange={(event) => updateCourse(course.id, "units", Number(event.target.value))} className="rounded-xl border border-gray-300 bg-white px-2 py-3 font-bold">{[1,2,3,4,5,6].map((unit) => <option key={unit} value={unit}>{unit} unit{unit > 1 ? "s" : ""}</option>)}</select><select aria-label="Grade" value={course.grade} onChange={(event) => updateCourse(course.id, "grade", event.target.value)} className="rounded-xl border border-gray-300 bg-white px-2 py-3 font-black">{GRADES.map((grade) => <option key={grade.letter}>{grade.letter}</option>)}</select><button aria-label="Remove course" disabled={courses.length === 1} onClick={() => setCourses((current) => current.filter((item) => item.id !== course.id))} className="rounded-xl text-xl font-black text-red-600 disabled:opacity-30">×</button></div>)}</div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"><p className="text-sm font-black uppercase tracking-widest text-green-700">Step 2</p><h2 className="mt-1 text-2xl font-black">Add your previous academic record</h2><p className="mt-2 text-sm text-gray-600">Leave both fields blank if this is your first semester.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="font-bold">Previous CGPA<input type="number" min="0" max="5" step="0.01" value={previousCgpa} onChange={(event) => setPreviousCgpa(event.target.value)} placeholder="e.g. 3.72" className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600" /></label><label className="font-bold">Previously completed units<input type="number" min="0" value={previousUnits} onChange={(event) => setPreviousUnits(event.target.value)} placeholder="e.g. 84" className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600" /></label></div></section>

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"><p className="text-sm font-black uppercase tracking-widest text-green-700">Step 3</p><h2 className="mt-1 text-2xl font-black">Simulate your target</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="font-bold">Target CGPA<input type="number" min="0" max="5" step="0.01" value={targetCgpa} onChange={(event) => setTargetCgpa(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600" /></label><label className="font-bold">Planned future units<input type="number" min="1" value={futureUnits} onChange={(event) => setFutureUnits(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600" /></label></div><div className={`mt-5 rounded-2xl p-5 font-bold leading-7 ${result.requiredGpa > 5 ? "bg-red-50 text-red-900" : "bg-green-50 text-green-900"}`}>{targetMessage}</div></section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start"><div className="overflow-hidden rounded-3xl bg-green-950 text-white shadow-xl"><div className="p-7"><p className="text-sm font-black uppercase tracking-widest text-green-300">Your Result</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">Semester GPA</p><p className="mt-1 text-3xl font-black">{result.semesterGpa.toFixed(2)}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">Current CGPA</p><p className="mt-1 text-3xl font-black">{result.cumulativeCgpa.toFixed(2)}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">Semester Units</p><p className="mt-1 text-2xl font-black">{result.totalUnits}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">Total Units</p><p className="mt-1 text-2xl font-black">{result.cumulativeUnits}</p></div></div><div className="mt-5 rounded-2xl bg-green-300 p-5 text-green-950"><p className="text-xs font-black uppercase tracking-wide">Classification</p><p className="mt-1 text-xl font-black">{classification(result.cumulativeCgpa)}</p></div></div>
            <div className="border-t border-white/10 p-7"><button onClick={saveProgress} className="w-full rounded-xl bg-white px-5 py-3 font-black text-green-900">{saved ? "Saved ✓" : "Save on This Device"}</button><button onClick={resetCalculator} className="mt-3 w-full rounded-xl border border-white/20 px-5 py-3 font-black text-white">Reset Calculator</button><p className="mt-4 text-xs leading-5 text-green-100">This calculator is for guidance. Always confirm your official result and institution’s regulations.</p></div></div></aside>
        </div>
      </div></section>
    </main>
  );
}
