"use client";

import { useEffect, useMemo, useState } from "react";

type System = "lasu" | "university-5" | "university-4" | "polytechnic-4" | "nce-5" | "nce-4";
type EntryMode = "utme" | "direct-entry";
type Course = { id: number; code: string; units: number; grade: string };
type Semester = { id: number; level: string; term: string; courses: Course[] };

const GRADES_5 = [
  { letter: "A", point: 5, range: "70-100" }, { letter: "B", point: 4, range: "60-69" },
  { letter: "C", point: 3, range: "50-59" }, { letter: "D", point: 2, range: "45-49" },
  { letter: "E", point: 1, range: "40-44" }, { letter: "F", point: 0, range: "0-39" },
];
const GRADES_UNIVERSITY_4 = [
  { letter: "A", point: 4, range: "70-100" }, { letter: "B", point: 3, range: "60-69" },
  { letter: "C", point: 2, range: "50-59" }, { letter: "D", point: 1, range: "45-49" },
  { letter: "F", point: 0, range: "0-44" },
];
const GRADES_POLY_4 = [
  { letter: "A", point: 4, range: "75-100" }, { letter: "AB", point: 3.5, range: "70-74" },
  { letter: "B", point: 3.25, range: "65-69" }, { letter: "BC", point: 3, range: "60-64" },
  { letter: "C", point: 2.75, range: "55-59" }, { letter: "CD", point: 2.5, range: "50-54" },
  { letter: "D", point: 2, range: "45-49" }, { letter: "E", point: 1.5, range: "40-44" },
  { letter: "F", point: 0, range: "0-39" },
];
const GRADES_NCE_4 = [
  { letter: "A", point: 4, range: "70-100" }, { letter: "B", point: 3, range: "60-69" },
  { letter: "C", point: 2, range: "50-59" }, { letter: "D", point: 1, range: "45-49" },
  { letter: "F", point: 0, range: "0-44" },
];
const LEVELS = ["100L", "200L", "300L", "400L", "500L", "600L", "700L", "Extra Year 1", "Extra Year 2"];
const TERMS = ["First Semester", "Second Semester", "Summer Semester"];
const newCourse = (): Course => ({ id: Date.now() + Math.random(), code: "", units: 3, grade: "A" });
function classification(value: number, system: System) {
  if (system === "polytechnic-4") return value >= 3.5 ? "Distinction" : value >= 3 ? "Upper Credit" : value >= 2 ? "Lower Credit" : value >= 1 ? "Pass" : "Fail";
  if (system === "nce-5") return value >= 4.5 ? "Distinction" : value >= 3.5 ? "Credit" : value >= 2.4 ? "Merit" : value >= 1.5 ? "Pass" : value >= 1 ? "Low Pass" : "Fail";
  if (system === "nce-4") return value >= 3.5 ? "Distinction" : value >= 3 ? "Credit" : value >= 2 ? "Merit" : value >= 1 ? "Pass" : "Fail";
  if (system === "university-4") return value >= 3.5 ? "First Class Honours" : value >= 3 ? "Second Class Honours (Upper Division)" : value >= 2 ? "Second Class Honours (Lower Division)" : value >= 1 ? "Third Class Honours" : "Below Degree Requirement";
  return value >= 4.5 ? "First Class" : value >= 3.5 ? "Second Class Upper" : value >= 2.4 ? "Second Class Lower" : value >= 1.5 ? "Third Class" : value >= 1 ? "Pass" : "Below Pass Level";
}
const systemLabel = (system: System) => ({
  lasu: "LASU 5.0 Grading System",
  "university-5": "General University 5.0",
  "university-4": "General University 4.0",
  "polytechnic-4": "Polytechnic 4.0 (ND/HND)",
  "nce-5": "College of Education / NCE 5.0",
  "nce-4": "College of Education / NCE 4.0",
}[system]);

function makeSemester(index: number, entryMode: EntryMode, startLevel?: string): Semester {
  const firstLevel = startLevel || (entryMode === "utme" ? "100L" : "200L");
  const base = Math.max(0, LEVELS.indexOf(firstLevel));
  const levelIndex = Math.min(LEVELS.length - 1, base + Math.floor(index / 2));
  return { id: Date.now() + index + Math.random(), level: LEVELS[levelIndex], term: index % 2 ? "Second Semester" : "First Semester", courses: [newCourse(), newCourse(), newCourse()] };
}

export default function CgpaPlannerPage() {
  const [system, setSystem] = useState<System>("lasu");
  const [entryMode, setEntryMode] = useState<EntryMode>("utme");
  const [programmeYears, setProgrammeYears] = useState("4");
  const [studentName, setStudentName] = useState("");
  const [programme, setProgramme] = useState("");
  const [currentCgpa, setCurrentCgpa] = useState("");
  const [ctnup, setCtnup] = useState("");
  const [ctcp, setCtcp] = useState("");
  const [targetCgpa, setTargetCgpa] = useState("4.50");
  const [semesters, setSemesters] = useState<Semester[]>([makeSemester(0, "utme")]);
  const [openSemester, setOpenSemester] = useState<number | null>(semesters[0].id);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("soh-cgpa-planner-v3");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.system) setSystem(data.system); if (data.entryMode) setEntryMode(data.entryMode);
      if (data.programmeYears) setProgrammeYears(data.programmeYears); if (data.studentName) setStudentName(data.studentName);
      if (data.programme) setProgramme(data.programme); if (data.currentCgpa) setCurrentCgpa(data.currentCgpa);
      if (data.ctnup) setCtnup(data.ctnup); if (data.ctcp) setCtcp(data.ctcp); if (data.targetCgpa) setTargetCgpa(data.targetCgpa);
      if (Array.isArray(data.semesters) && data.semesters.length) { setSemesters(data.semesters); setOpenSemester(data.semesters[0].id); }
    } catch { /* Ignore damaged browser storage. */ }
  }, []);

  const activeGrades = system === "polytechnic-4" ? GRADES_POLY_4 : system === "university-4" ? GRADES_UNIVERSITY_4 : system === "nce-4" ? GRADES_NCE_4 : GRADES_5;
  const maxPoint = ["university-4", "polytechnic-4", "nce-4"].includes(system) ? 4 : 5;
  const projection = useMemo(() => {
    const oldUnits = Math.max(0, Number(ctnup) || 0);
    const oldCgpa = Math.min(maxPoint, Math.max(0, Number(currentCgpa) || 0));
    const exact = ctcp.trim() !== "" && Number(ctcp) >= 0;
    let cumulativePoints = exact ? Number(ctcp) : oldCgpa * oldUnits;
    let cumulativeUnits = oldUnits;
    const rows = semesters.map((semester) => {
      const units = semester.courses.reduce((sum, course) => sum + (Number(course.units) || 0), 0);
      const points = semester.courses.reduce((sum, course) => sum + (Number(course.units) || 0) * (activeGrades.find((grade) => grade.letter === course.grade)?.point || 0), 0);
      const gpa = units ? points / units : 0;
      cumulativePoints += points; cumulativeUnits += units;
      return { ...semester, units, points, gpa, cumulativeUnits, cumulativePoints, cgpa: cumulativeUnits ? cumulativePoints / cumulativeUnits : 0 };
    });
    const final = rows.at(-1);
    const projectedCgpa = final?.cgpa ?? oldCgpa;
    const projectedUnits = final?.cumulativeUnits ?? oldUnits;
    const projectedPoints = final?.cumulativePoints ?? cumulativePoints;
    const target = Math.min(maxPoint, Math.max(0, Number(targetCgpa) || 0));
    const futureUnits = rows.reduce((sum, row) => sum + row.units, 0);
    const requiredPoints = target * projectedUnits - (exact ? Number(ctcp) : oldCgpa * oldUnits);
    const requiredAverage = futureUnits ? requiredPoints / futureUnits : 0;
    const maximum = projectedUnits ? ((exact ? Number(ctcp) : oldCgpa * oldUnits) + maxPoint * futureUnits) / projectedUnits : oldCgpa;
    const graduationUnits = Math.max(1, Number(programmeYears) || 4) * 2 * 18;
    const unitsLeftNow = Math.max(0, graduationUnits - oldUnits);
    const unitsLeftAfterProjection = Math.max(0, graduationUnits - projectedUnits);
    return { rows, exact, projectedCgpa, projectedUnits, projectedPoints, futureUnits, requiredPoints, requiredAverage, maximum, target, graduationUnits, unitsLeftNow, unitsLeftAfterProjection };
  }, [semesters, currentCgpa, ctnup, ctcp, targetCgpa, programmeYears, activeGrades, maxPoint]);

  function updateSemester(id: number, patch: Partial<Semester>) { setSemesters((list) => list.map((item) => item.id === id ? { ...item, ...patch } : item)); }
  function updateCourse(semesterId: number, courseId: number, field: keyof Course, value: string | number) {
    setSemesters((list) => list.map((semester) => semester.id === semesterId ? { ...semester, courses: semester.courses.map((course) => course.id === courseId ? { ...course, [field]: value } : course) } : semester));
  }
  function addSemester() {
    if (semesters.length >= 18) return;
    const last = semesters.at(-1); const semester = makeSemester(semesters.length, entryMode, last?.level);
    if (last) { const levelIndex = LEVELS.indexOf(last.level); semester.level = last.term === "First Semester" ? last.level : LEVELS[Math.min(LEVELS.length - 1, levelIndex + 1)]; semester.term = last.term === "First Semester" ? "Second Semester" : "First Semester"; }
    setSemesters((list) => [...list, semester]); setOpenSemester(semester.id);
  }
  function changeEntryMode(mode: EntryMode) {
    setEntryMode(mode);
    setProgrammeYears(mode === "direct-entry" ? "3" : "4");
    if (semesters.length === 1 && semesters[0].courses.every((course) => !course.code)) {
      updateSemester(semesters[0].id, { level: mode === "utme" ? "100L" : "200L" });
    }
  }
  function savePlan() {
    window.localStorage.setItem("soh-cgpa-planner-v3", JSON.stringify({ system, entryMode, programmeYears, studentName, programme, currentCgpa, ctnup, ctcp, targetCgpa, semesters }));
    setSaved(true); window.setTimeout(() => setSaved(false), 1800);
  }
  function resetPlan() { const first = makeSemester(0, entryMode); setSemesters([first]); setOpenSemester(first.id); setCurrentCgpa(""); setCtnup(""); setCtcp(""); setTargetCgpa(maxPoint === 4 ? "3.50" : "4.50"); window.localStorage.removeItem("soh-cgpa-planner-v3"); }

  const reportName = () => `SOH-CGPA-Projection-${(studentName || "Student").trim().replace(/[^a-z0-9]+/gi, "-")}.`;
  const motivation = projection.projectedCgpa >= projection.target
    ? "You are on track to achieve your target. Stay consistent and finish strong!"
    : `Your target is still the goal. Focus on the required ${projection.requiredAverage > 0 && projection.requiredAverage <= maxPoint ? projection.requiredAverage.toFixed(2) : "best possible"} average GPA and keep improving semester by semester.`;

  function loadLogo(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = "/soh-logo.jpg"; });
  }

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    const logo = await loadLogo(); const logoCanvas = document.createElement("canvas"); logoCanvas.width = logo.naturalWidth; logoCanvas.height = logo.naturalHeight; logoCanvas.getContext("2d")?.drawImage(logo, 0, 0);
    const logoData = logoCanvas.toDataURL("image/jpeg", 0.92);
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const width = 210;
    const addHeader = () => {
      pdf.setFillColor(20, 83, 45); pdf.rect(0, 0, width, 38, "F");
      pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(20); pdf.text("S.O.H CONSULTS", 15, 16);
      pdf.setFontSize(11); pdf.text("CGPA ACADEMIC PROJECTION REPORT", 15, 25); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.text("Your Guide. Your Success.", 15, 32);
      pdf.setFillColor(255, 255, 255); pdf.roundedRect(169, 5, 26, 26, 2, 2, "F"); pdf.addImage(logoData, "JPEG", 171, 7, 22, 22);
    };
    addHeader(); let y = 49;
    const line = (label: string, value: string) => { pdf.setTextColor(75, 85, 99); pdf.setFont("helvetica", "bold"); pdf.text(label, 15, y); pdf.setFont("helvetica", "normal"); pdf.setTextColor(17, 24, 39); pdf.text(value, 62, y); y += 7; };
    line("Student", studentName || "Not provided"); line("Programme", programme || "Not provided");
    line("Grading System", systemLabel(system)); line("Entry / Duration", `${entryMode === "utme" ? "UTME" : "Direct Entry"} / ${programmeYears} years`);
    line("Current Record", `${currentCgpa || "0.00"} CGPA | ${ctnup || "0"} CTNUP${ctcp ? ` | ${ctcp} CTCP` : " | estimated points"}`);
    line("Target", Number(targetCgpa || 0).toFixed(2)); line("Final Projection", `${projection.projectedCgpa.toFixed(2)} CGPA | ${classification(projection.projectedCgpa, system)}`);
    line("Graduation Units", `${projection.graduationUnits} planning benchmark | ${projection.unitsLeftAfterProjection} left after this plan`);
    y += 3; pdf.setFillColor(220, 252, 231); pdf.roundedRect(15, y, 180, 22, 3, 3, "F"); pdf.setTextColor(20, 83, 45); pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.text(pdf.splitTextToSize(motivation, 168), 21, y + 8); y += 31;
    pdf.setTextColor(17, 24, 39); pdf.setFontSize(13); pdf.text("Semester-by-semester projection", 15, y); y += 7;
    const columns = [15, 79, 105, 126, 150, 177];
    const tableHeader = () => { pdf.setFillColor(240, 253, 244); pdf.rect(15, y, 180, 8, "F"); pdf.setFontSize(8); pdf.setFont("helvetica", "bold"); ["Stage", "Units", "TCP", "GPA", "Cum. Units", "CGPA"].forEach((text, i) => pdf.text(text, columns[i], y + 5.5)); y += 8; };
    tableHeader(); pdf.setFont("helvetica", "normal");
    projection.rows.forEach((row) => {
      if (y > 274) { pdf.addPage(); addHeader(); y = 48; tableHeader(); }
      pdf.setDrawColor(229, 231, 235); pdf.line(15, y + 8, 195, y + 8); pdf.setFontSize(8);
      const values = [`${row.level} ${row.term}`, String(row.units), String(row.points), row.gpa.toFixed(2), String(row.cumulativeUnits), row.cgpa.toFixed(2)];
      values.forEach((text, i) => pdf.text(i === 0 ? text.slice(0, 34) : text, columns[i], y + 5.5)); y += 9;
    });
    if (y > 260) { pdf.addPage(); addHeader(); y = 49; }
    y += 6; pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(20, 83, 45); pdf.text("Target guidance", 15, y); y += 7;
    pdf.setFont("helvetica", "normal"); pdf.setTextColor(55, 65, 81); pdf.setFontSize(9); pdf.text(pdf.splitTextToSize(targetStatus, 180), 15, y); y += 18;
    pdf.setFontSize(8); pdf.setTextColor(107, 114, 128); pdf.text("This is a projection, not an official institutional result. Confirm grading and classification rules with your institution.", 15, Math.min(288, y + 8));
    pdf.save(`${reportName()}pdf`);
  }

  async function downloadImage() {
    const logo = await loadLogo();
    const canvas = document.createElement("canvas"); const width = 1200; const height = 780 + projection.rows.length * 74;
    canvas.width = width; canvas.height = height; const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#f9fafb"; ctx.fillRect(0, 0, width, height); ctx.fillStyle = "#14532d"; ctx.fillRect(0, 0, width, 190);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 54px Arial"; ctx.fillText("S.O.H CONSULTS", 70, 75); ctx.font = "bold 30px Arial"; ctx.fillText("CGPA ACADEMIC PROJECTION REPORT", 70, 125); ctx.font = "22px Arial"; ctx.fillText("Your Guide. Your Success.", 70, 162);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(1000, 25, 145, 145); ctx.drawImage(logo, 1010, 35, 125, 125);
    let y = 245; ctx.fillStyle = "#111827"; ctx.font = "bold 28px Arial"; ctx.fillText(studentName || "Student Projection", 70, y); y += 42; ctx.font = "21px Arial";
    ctx.fillText(`${programme || "Programme not provided"} | ${entryMode === "utme" ? "UTME" : "Direct Entry"} | ${programmeYears} years`, 70, y); y += 35; ctx.font = "18px Arial"; ctx.fillText(`${projection.graduationUnits}-unit planning benchmark | ${projection.unitsLeftAfterProjection} units left after this projection`, 70, y); y += 35;
    ctx.fillStyle = "#dcfce7"; ctx.fillRect(70, y, 1060, 145); ctx.fillStyle = "#14532d"; ctx.font = "bold 25px Arial"; ctx.fillText(`Current CGPA: ${currentCgpa || "0.00"}`, 100, y + 42); ctx.fillText(`Target CGPA: ${Number(targetCgpa || 0).toFixed(2)}`, 100, y + 82); ctx.font = "bold 34px Arial"; ctx.fillText(`Final Projected CGPA: ${projection.projectedCgpa.toFixed(2)} (${classification(projection.projectedCgpa, system)})`, 470, y + 72); y += 195;
    ctx.fillStyle = "#111827"; ctx.font = "bold 27px Arial"; ctx.fillText("Semester Timeline", 70, y); y += 36;
    projection.rows.forEach((row, index) => { ctx.fillStyle = index % 2 ? "#ffffff" : "#f0fdf4"; ctx.fillRect(70, y, 1060, 58); ctx.fillStyle = "#111827"; ctx.font = "bold 19px Arial"; ctx.fillText(`${row.level} ${row.term}`, 90, y + 36); ctx.font = "18px Arial"; ctx.fillText(`${row.units} units`, 490, y + 36); ctx.fillText(`GPA ${row.gpa.toFixed(2)}`, 650, y + 36); ctx.fillStyle = "#15803d"; ctx.font = "bold 19px Arial"; ctx.fillText(`CGPA ${row.cgpa.toFixed(2)}`, 900, y + 36); y += 64; });
    y += 25; ctx.fillStyle = "#14532d"; ctx.font = "bold 23px Arial"; const words = motivation.split(" "); let line = ""; for (const word of words) { const test = `${line}${word} `; if (ctx.measureText(test).width > 1030) { ctx.fillText(line, 70, y); line = `${word} `; y += 32; } else line = test; } ctx.fillText(line, 70, y);
    ctx.fillStyle = "#6b7280"; ctx.font = "17px Arial"; ctx.fillText("Projection only. This is not an official institutional result.", 70, height - 45);
    const link = document.createElement("a"); link.download = `${reportName()}png`; link.href = canvas.toDataURL("image/png"); link.click();
  }

  const targetStatus = projection.futureUnits === 0 ? "Add courses and units to calculate your target requirement."
    : projection.requiredAverage > maxPoint ? `The target is not reachable within these ${projection.futureUnits} projected units. Even straight maximum-grade results would produce about ${projection.maximum.toFixed(2)}.`
    : projection.requiredAverage <= 0 ? "Your current academic record has already reached this target."
    : `Across the ${projection.futureUnits} projected units, you need at least ${Math.ceil(projection.requiredPoints)} credit points, an average GPA of approximately ${projection.requiredAverage.toFixed(2)}, to finish at ${projection.target.toFixed(2)}.`;

  return <main className="min-h-screen bg-gray-50 text-gray-900">
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><a href="/"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-16 w-auto" /></a><nav className="hidden gap-6 text-sm font-semibold md:flex"><a href="/">Home</a><a href="/updates">Updates</a><a href="/screening-calculator">Screening Calculator</a></nav><a href="https://wa.me/2348182141088" className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white">WhatsApp Us</a></div></header>
    <section className="bg-gradient-to-br from-green-950 via-green-900 to-green-700 py-14 text-white"><div className="mx-auto max-w-5xl px-5 text-center"><p className="font-bold uppercase tracking-widest text-green-300">S.O.H CONSULTS Academic Tool</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">CGPA Academic Planner</h1><p className="mx-auto mt-5 max-w-3xl leading-8 text-green-50">Plan one semester, a full session or an extended academic journey, including 7-year programmes and extra years, and see your CGPA journey before the results arrive.</p></div></section>

    <section className="py-10"><div className="mx-auto max-w-7xl space-y-8 px-5 lg:px-8">
      <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-black uppercase tracking-widest text-green-700">Student profile</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="font-bold">Mode of Entry<select value={entryMode} onChange={(e) => changeEntryMode(e.target.value as EntryMode)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3"><option value="utme">UTME</option><option value="direct-entry">Direct Entry</option></select></label><label className="font-bold">Programme Duration<select value={programmeYears} onChange={(e) => setProgrammeYears(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3">{(entryMode === "direct-entry" ? [3,4,5,6,7] : [4,5,6,7]).map((year) => <option key={year} value={String(year)}>{year} years</option>)}</select></label><label className="font-bold">Student Name (optional)<input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Your name" className="mt-2 w-full rounded-xl border px-4 py-3" /></label><label className="font-bold">Programme (optional)<input value={programme} onChange={(e) => setProgramme(e.target.value)} placeholder="e.g. Marketing" className="mt-2 w-full rounded-xl border px-4 py-3" /></label></div>{system === "lasu" && <><div className="mt-5 grid gap-3 rounded-2xl bg-green-50 p-4 text-green-950 sm:grid-cols-3"><div><p className="text-xs font-bold uppercase">LASU planning benchmark</p><p className="text-xl font-black">{projection.graduationUnits} units</p></div><div><p className="text-xs font-bold uppercase">Units left now</p><p className="text-xl font-black">{projection.unitsLeftNow}</p></div><div><p className="text-xs font-bold uppercase">After this projection</p><p className="text-xl font-black">{projection.unitsLeftAfterProjection} units left</p></div></div><p className="mt-3 text-xs leading-5 text-gray-500">LASU planning estimate based on 18 course units per semester. Confirm your programme&apos;s official graduation requirements.</p></>}</section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-sm font-black uppercase tracking-widest text-green-700">Current record</p><h2 className="mt-1 text-2xl font-black">Where are you starting from?</h2></div><label className="min-w-[280px] font-bold">Select Your Grading System<span className="mt-1 block text-xs font-normal text-gray-500">Choose the grading system used by your institution.</span><select value={system} onChange={(e) => setSystem(e.target.value as System)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-bold"><option value="lasu">LASU 5.0 Grading System</option><option value="university-5">General University 5.0</option><option value="university-4">General University 4.0</option><option value="polytechnic-4">Polytechnic 4.0 (ND/HND)</option><option value="nce-5">College of Education / NCE 5.0</option><option value="nce-4">College of Education / NCE 4.0</option></select></label></div><div className="mt-5 grid gap-4 md:grid-cols-3"><label className="font-bold">Current CGPA<input type="number" min="0" max={maxPoint} step="0.01" value={currentCgpa} onChange={(e) => setCurrentCgpa(e.target.value)} placeholder="e.g. 3.79" className="mt-2 w-full rounded-xl border px-4 py-3" /></label><label className="font-bold">Completed Course Units (CTNUP)<input type="number" min="0" value={ctnup} onChange={(e) => setCtnup(e.target.value)} placeholder="e.g. 121" className="mt-2 w-full rounded-xl border px-4 py-3" /></label><label className="font-bold">Cumulative Credit Points (CTCP)<input type="number" min="0" step="0.01" value={ctcp} onChange={(e) => setCtcp(e.target.value)} placeholder="e.g. 458 (optional)" className="mt-2 w-full rounded-xl border px-4 py-3" /></label></div><div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-900"><p className="font-black">{systemLabel(system)} · Maximum CGPA {maxPoint.toFixed(2)}</p><p className="mt-1">CTNUP is the total number of course units passed. CTCP is the sum of Unit x GP for all completed courses. Entering CTCP gives an exact projection; otherwise the rounded CGPA produces an estimate.</p><p className="mt-2 text-xs">Use the grading profile that matches your institution. Classification rules may vary, especially across NCE and polytechnic institutions.</p></div></section>

      <div className="grid gap-8 xl:grid-cols-[1.45fr_0.75fr]"><div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-black uppercase tracking-widest text-green-700">Projection plan</p><h2 className="mt-1 text-3xl font-black">Projected semesters ({semesters.length}/18)</h2></div><button onClick={addSemester} disabled={semesters.length >= 18} className="rounded-xl bg-green-700 px-5 py-3 font-black text-white disabled:opacity-40">+ Add Semester</button></div>
        {semesters.map((semester, semesterIndex) => { const row = projection.rows[semesterIndex]; const open = openSemester === semester.id; return <section key={semester.id} className="overflow-hidden rounded-3xl border bg-white shadow-sm"><button onClick={() => setOpenSemester(open ? null : semester.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"><div><p className="text-xs font-black uppercase tracking-widest text-green-700">Projection {semesterIndex + 1}</p><h3 className="mt-1 text-xl font-black">{semester.level} - {semester.term}</h3><p className="mt-1 text-sm text-gray-500">{row?.units || 0} units · GPA {row?.gpa.toFixed(2)} · CGPA {row?.cgpa.toFixed(2)}</p></div><span className="text-2xl font-black text-green-700">{open ? "−" : "+"}</span></button>{open && <div className="border-t p-5 sm:p-6"><div className="grid gap-3 sm:grid-cols-2"><label className="font-bold">Level<select value={semester.level} onChange={(e) => updateSemester(semester.id, { level: e.target.value })} className="mt-2 w-full rounded-xl border bg-white px-4 py-3">{LEVELS.map((level) => <option key={level}>{level}</option>)}</select></label><label className="font-bold">Semester<select value={semester.term} onChange={(e) => updateSemester(semester.id, { term: e.target.value })} className="mt-2 w-full rounded-xl border bg-white px-4 py-3">{TERMS.map((term) => <option key={term}>{term}</option>)}</select></label></div><div className="mt-5 space-y-3">{semester.courses.map((course, index) => <div key={course.id} className="grid grid-cols-[1fr_74px_76px_38px] gap-2 rounded-2xl bg-gray-50 p-3 sm:grid-cols-[1fr_112px_110px_44px]"><input value={course.code} onChange={(e) => updateCourse(semester.id, course.id, "code", e.target.value.toUpperCase())} placeholder={`Course ${index + 1}`} className="min-w-0 rounded-xl border px-3 py-3" /><select value={course.units} onChange={(e) => updateCourse(semester.id, course.id, "units", Number(e.target.value))} className="rounded-xl border bg-white px-2 font-bold">{[1,2,3,4,5,6].map((unit) => <option key={unit} value={unit}>{unit} unit{unit > 1 ? "s" : ""}</option>)}</select><select value={course.grade} onChange={(e) => updateCourse(semester.id, course.id, "grade", e.target.value)} className="rounded-xl border bg-white px-2 font-black">{activeGrades.map((grade) => <option key={grade.letter} value={grade.letter}>{system === "lasu" ? grade.point : `${grade.letter} (${grade.point})`}</option>)}</select><button disabled={semester.courses.length === 1} onClick={() => updateSemester(semester.id, { courses: semester.courses.filter((item) => item.id !== course.id) })} className="text-xl font-black text-red-600 disabled:opacity-30">×</button></div>)}</div><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => updateSemester(semester.id, { courses: [...semester.courses, newCourse()] })} className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-black text-white">+ Add Course</button>{semesters.length > 1 && <button onClick={() => setSemesters((list) => list.filter((item) => item.id !== semester.id))} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-black text-red-700">Remove Semester</button>}</div></div>}</section>; })}
      </div>

      <aside className="xl:sticky xl:top-28 xl:self-start"><div className="overflow-hidden rounded-3xl bg-green-950 text-white shadow-xl"><div className="p-7"><p className="text-sm font-black uppercase tracking-widest text-green-300">Final Projection</p><p className="mt-1 text-xs text-green-100">{entryMode === "utme" ? "UTME" : "Direct Entry"} · {programmeYears}</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">{projection.exact || !Number(ctnup) ? "Projected CGPA" : "Estimated CGPA"}</p><p className="mt-1 text-3xl font-black">{projection.projectedCgpa.toFixed(2)}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">Projected Units</p><p className="mt-1 text-3xl font-black">{projection.projectedUnits}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">Future Units</p><p className="mt-1 text-2xl font-black">{projection.futureUnits}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">Projected CTCP</p><p className="mt-1 text-2xl font-black">{projection.projectedPoints.toFixed(0)}</p></div></div><div className="mt-5 rounded-2xl bg-green-300 p-5 text-green-950"><p className="text-xs font-black uppercase">Projected Classification</p><p className="mt-1 text-xl font-black">{classification(projection.projectedCgpa, system)}</p></div></div><div className="border-t border-white/10 p-7"><label className="font-bold">Final Target CGPA<input type="number" min="0" max={maxPoint} step="0.01" value={targetCgpa} onChange={(e) => setTargetCgpa(e.target.value)} className="mt-2 w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-gray-900" /></label><div className={`mt-4 rounded-xl p-4 text-sm font-bold leading-6 ${projection.requiredAverage > maxPoint ? "bg-red-100 text-red-900" : "bg-white/10 text-green-50"}`}>{targetStatus}</div><button onClick={savePlan} className="mt-5 w-full rounded-xl bg-white px-5 py-3 font-black text-green-900">{saved ? "Plan Saved ✓" : "Save on This Device"}</button><div className="mt-3 grid grid-cols-2 gap-3"><button onClick={downloadPdf} className="rounded-xl bg-green-300 px-3 py-3 text-sm font-black text-green-950">Download PDF</button><button onClick={downloadImage} className="rounded-xl bg-green-300 px-3 py-3 text-sm font-black text-green-950">Download Image</button></div><button onClick={resetPlan} className="mt-3 w-full rounded-xl border border-white/20 px-5 py-3 font-black">Reset Planner</button></div></div></aside></div>

      <section className="overflow-hidden rounded-3xl border bg-white shadow-sm"><div className="p-6"><p className="text-sm font-black uppercase tracking-widest text-green-700">Academic timeline</p><h2 className="mt-1 text-2xl font-black">Semester-by-semester projection</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-gray-100 text-xs uppercase text-gray-600"><tr><th className="px-5 py-3">Stage</th><th>Units</th><th>TCP</th><th>GPA</th><th>Cumulative Units</th><th>Projected CGPA</th><th>Progress</th></tr></thead><tbody className="divide-y">{projection.rows.map((row) => <tr key={row.id}><td className="px-5 py-4 font-black">{row.level} {row.term}</td><td>{row.units}</td><td>{row.points}</td><td>{row.gpa.toFixed(2)}</td><td>{row.cumulativeUnits}</td><td className="font-black text-green-700">{row.cgpa.toFixed(2)}</td><td><span className={`rounded-full px-3 py-1 text-xs font-black ${row.cgpa >= projection.target ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{row.cgpa >= projection.target ? "Target achieved" : "Building"}</span></td></tr>)}</tbody></table></div></section>
      <p className="text-center text-sm leading-6 text-gray-500">This planner provides projections only. Grading scales and award classifications can vary by institution. Always confirm with your institution&apos;s official academic regulations.</p>
    </div></section>
  </main>;
}
