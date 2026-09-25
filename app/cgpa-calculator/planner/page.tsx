"use client";

import { useEffect, useMemo, useState } from "react";

type System = "lasu" | "university-5" | "university-4" | "polytechnic-4" | "nce-5" | "nce-4";
type EntryMode = "utme" | "direct-entry";
type PlannerMode = "target" | "projector" | "retake";
type Course = { id: number; code: string; units: number; grade: string };
type Semester = { id: number; level: string; term: string; courses: Course[] };
type TargetCourse = { id: number; code: string; units: number };

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
const UNIVERSITY_LEVELS = ["100L", "200L", "300L", "400L", "500L", "600L", "700L", "Extra Year 1", "Extra Year 2"];
const POLY_LEVELS = ["ND I", "ND II", "HND I", "HND II", "Extra Year 1", "Extra Year 2"];
const NCE_LEVELS = ["NCE I", "NCE II", "NCE III", "Extra Year 1", "Extra Year 2"];
const TERMS = ["1st Semester", "2nd Semester"];
const newCourse = (): Course => ({ id: Date.now() + Math.random(), code: "", units: 3, grade: "" });
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

function makeSemester(index: number, entryMode: EntryMode, startLevel?: string, levels = UNIVERSITY_LEVELS): Semester {
  const firstLevel = startLevel || (entryMode === "utme" ? levels[0] : levels[Math.min(1, levels.length - 1)]);
  const base = Math.max(0, levels.indexOf(firstLevel));
  const levelIndex = Math.min(levels.length - 1, base + Math.floor(index / 2));
  return { id: Date.now() + index + Math.random(), level: levels[levelIndex], term: index % 2 ? "2nd Semester" : "1st Semester", courses: [newCourse(), newCourse(), newCourse()] };
}

export default function CgpaPlannerPage() {
  const [system, setSystem] = useState<System>("lasu");
  const [plannerMode, setPlannerMode] = useState<PlannerMode | null>(null);
  const [entryMode, setEntryMode] = useState<EntryMode>("utme");
  const [programmeYears, setProgrammeYears] = useState("4");
  const [studentName, setStudentName] = useState("");
  const [programme, setProgramme] = useState("");
  const [currentCgpa, setCurrentCgpa] = useState("");
  const [ctnup, setCtnup] = useState("");
  const [ctcp, setCtcp] = useState("");
  const [targetCgpa, setTargetCgpa] = useState("4.50");
  const [targetPeriod, setTargetPeriod] = useState<"semester" | "session">("semester");
  const [targetCoursesFirst, setTargetCoursesFirst] = useState<TargetCourse[]>([{ id: Date.now()+101, code: "", units: 3 }]);
  const [targetCoursesSecond, setTargetCoursesSecond] = useState<TargetCourse[]>([{ id: Date.now()+202, code: "", units: 3 }]);
  const [semesters, setSemesters] = useState<Semester[]>([makeSemester(0, "utme")]);
  const [openSemester, setOpenSemester] = useState<number | null>(semesters[0].id);
  const [saved, setSaved] = useState(false);
  const [startStage, setStartStage] = useState("100L");
  const [startTerm, setStartTerm] = useState("1st Semester");
  const [retakeUnits, setRetakeUnits] = useState("3");
  const retakeOldGrade = "F";
  const [retakeNewGrade, setRetakeNewGrade] = useState("B");
  const [retakeRule, setRetakeRule] = useState<"replace" | "both">("replace");
  const [failedUnitsIncluded, setFailedUnitsIncluded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const grading = params.get("grading");
    const tool = params.get("tool");
    if (tool === "target" || tool === "projector" || tool === "retake") setPlannerMode(tool);
    if (grading === "lasu") changeSystem("lasu");
    if (grading === "university-5") changeSystem("university-5");
    if (grading === "university-4") changeSystem("university-4");
    if (grading === "polytechnic-4") changeSystem("polytechnic-4");
    if (grading === "nce-5") changeSystem("nce-5");
    if (grading === "nce-4") changeSystem("nce-4");
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem("soh-cgpa-planner-v3");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.system) setSystem(data.system); if (data.entryMode) setEntryMode(data.entryMode);
      if (data.programmeYears) setProgrammeYears(data.programmeYears); if (data.studentName) setStudentName(data.studentName);
      if (data.programme) setProgramme(data.programme); if (data.currentCgpa) setCurrentCgpa(data.currentCgpa);
      if (data.ctnup) setCtnup(data.ctnup); if (data.ctcp) setCtcp(data.ctcp); if (data.targetCgpa) setTargetCgpa(data.targetCgpa);
      if (Array.isArray(data.semesters) && data.semesters.length) {
        const migrated = data.semesters.map((semester: Semester) => ({ ...semester, term: semester.term === "First Semester" ? "1st Semester" : semester.term === "Second Semester" ? "2nd Semester" : semester.term }));
        setSemesters(migrated); setOpenSemester(migrated[0].id);
      }
    } catch { /* Ignore damaged browser storage. */ }
  }, []);

  const stageLevels = system === "polytechnic-4" ? POLY_LEVELS : system === "nce-5" || system === "nce-4" ? NCE_LEVELS : UNIVERSITY_LEVELS;
  const activeGrades = system === "polytechnic-4" ? GRADES_POLY_4 : system === "university-4" ? GRADES_UNIVERSITY_4 : system === "nce-4" ? GRADES_NCE_4 : GRADES_5;
  const maxPoint = ["university-4", "polytechnic-4", "nce-4"].includes(system) ? 4 : 5;
  const classificationLabel = system === "polytechnic-4" ? "ND/HND Classification" : system === "nce-5" || system === "nce-4" ? "NCE Classification" : "Class of Degree";
  const gradeScale = activeGrades.map((grade) => `${grade.letter}=${grade.point}`).join(" · ");
  const currentStanding = currentCgpa.trim() ? classification(Math.min(maxPoint, Math.max(0, Number(currentCgpa) || 0)), system) : "Not entered";
  const extraYears = useMemo(() => Array.from(new Set(semesters.map((semester) => semester.level).filter((level) => level.startsWith("Extra Year")))).length, [semesters]);
  const retakeImpact = useMemo(() => {
    const units = Math.max(0, Number(retakeUnits) || 0);
    const oldUnits = Math.max(0, Number(ctnup) || 0);
    const oldCgpa = Math.min(maxPoint, Math.max(0, Number(currentCgpa) || 0));
    const basePoints = ctcp.trim() !== "" && Number(ctcp) >= 0 ? Number(ctcp) : oldCgpa * oldUnits;
    const oldPoint = activeGrades.find((grade) => grade.letter === retakeOldGrade)?.point ?? 0;
    const newPoint = activeGrades.find((grade) => grade.letter === retakeNewGrade)?.point ?? 0;
    if (!units || !oldUnits) return { cgpa: oldCgpa, change: 0 };
    const oldAttemptPoints = oldPoint * units;
    let newPoints = basePoints;
    let newUnits = oldUnits;
    if (retakeRule === "replace") {
      newPoints = basePoints - (failedUnitsIncluded ? oldAttemptPoints : 0) + newPoint * units;
      newUnits = failedUnitsIncluded ? oldUnits : oldUnits + units;
    } else {
      newPoints = basePoints + newPoint * units;
      newUnits = oldUnits + units;
    }
    const cgpa = newUnits ? newPoints / newUnits : oldCgpa;
    return { cgpa, change: cgpa - oldCgpa, units: newUnits, points: newPoints };
  }, [retakeUnits, retakeOldGrade, retakeNewGrade, retakeRule, failedUnitsIncluded, ctnup, currentCgpa, ctcp, activeGrades, maxPoint]);

  const sessionSummaries = useMemo(() => {
    const groups = new Map<string, { level: string; units: number; points: number }>();
    semesters.forEach((semester) => {
      const entered = semester.courses.filter((course) => course.code.trim() && course.grade);
      const units = entered.reduce((sum, course) => sum + (Number(course.units) || 0), 0);
      const points = entered.reduce((sum, course) => sum + (Number(course.units) || 0) * (activeGrades.find((grade) => grade.letter === course.grade)?.point || 0), 0);
      const current = groups.get(semester.level) || { level: semester.level, units: 0, points: 0 };
      groups.set(semester.level, { level: semester.level, units: current.units + units, points: current.points + points });
    });
    return Array.from(groups.values()).map((item) => ({ ...item, gpa: item.units ? item.points / item.units : 0 }));
  }, [semesters, activeGrades]);

  const projection = useMemo(() => {
    const oldUnits = Math.max(0, Number(ctnup) || 0);
    const oldCgpa = Math.min(maxPoint, Math.max(0, Number(currentCgpa) || 0));
    const enteredCtcp = Number(ctcp);
    const exact = ctcp.trim() !== "" && oldUnits > 0 && enteredCtcp >= 0 && enteredCtcp <= maxPoint * oldUnits;
    let cumulativePoints = exact ? enteredCtcp : oldCgpa * oldUnits;
    let cumulativeUnits = oldUnits;
    const rows = semesters.map((semester) => {
      const enteredCourses = semester.courses.filter((course) => course.code.trim() && course.grade);
      const units = enteredCourses.reduce((sum, course) => sum + (Number(course.units) || 0), 0);
      const points = enteredCourses.reduce((sum, course) => sum + (Number(course.units) || 0) * (activeGrades.find((grade) => grade.letter === course.grade)?.point || 0), 0);
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
    const requiredPoints = target * projectedUnits - (exact ? enteredCtcp : oldCgpa * oldUnits);
    const requiredAverage = futureUnits ? requiredPoints / futureUnits : 0;
    const maximum = projectedUnits ? ((exact ? enteredCtcp : oldCgpa * oldUnits) + maxPoint * futureUnits) / projectedUnits : oldCgpa;
    const graduationUnits = Math.max(1, Number(programmeYears) || 4) * 2 * 18;
    const unitsLeftNow = Math.max(0, graduationUnits - oldUnits);
    const unitsLeftAfterProjection = Math.max(0, graduationUnits - projectedUnits);
    return { rows, exact, projectedCgpa, projectedUnits, projectedPoints, futureUnits, requiredPoints, requiredAverage, maximum, target, graduationUnits, unitsLeftNow, unitsLeftAfterProjection };
  }, [semesters, currentCgpa, ctnup, ctcp, targetCgpa, programmeYears, activeGrades, maxPoint]);

  const targetSemesterPlan = useMemo(() => {
    const oldUnits = Math.max(0, Number(ctnup) || 0);
    const oldCgpa = Math.min(maxPoint, Math.max(0, Number(currentCgpa) || 0));
    const firstUnits = targetCoursesFirst.filter((course) => course.code.trim()).reduce((sum, course) => sum + Math.max(0, Number(course.units) || 0), 0);
    const secondUnits = targetCoursesSecond.filter((course) => course.code.trim()).reduce((sum, course) => sum + Math.max(0, Number(course.units) || 0), 0);
    const units = targetPeriod === "session" ? firstUnits + secondUnits : firstUnits;
    const target = Math.min(maxPoint, Math.max(0, Number(targetCgpa) || 0));
    const enteredCtcp = Number(ctcp);
    const exact = ctcp.trim() !== "" && oldUnits > 0 && enteredCtcp >= 0 && enteredCtcp <= maxPoint * oldUnits;
    const currentPoints = exact ? enteredCtcp : oldCgpa * oldUnits;
    const requiredPoints = target * (oldUnits + units) - currentPoints;
    const requiredGpa = units ? requiredPoints / units : 0;
    const maximumCgpa = oldUnits + units ? (currentPoints + maxPoint * units) / (oldUnits + units) : oldCgpa;
    const minimumCgpa = oldUnits + units ? currentPoints / (oldUnits + units) : oldCgpa;
    const achievable = units > 0 && requiredGpa <= maxPoint;
    return { oldUnits, oldCgpa, units, target, exact, currentPoints, requiredPoints, requiredGpa, maximumCgpa, minimumCgpa, achievable };
  }, [ctnup, currentCgpa, targetCoursesFirst, targetCoursesSecond, targetPeriod, targetCgpa, ctcp, maxPoint]);

  const targetGradeSuggestion = useMemo(() => {
    const first = targetCoursesFirst.filter((course) => course.code.trim()).map((course) => ({ ...course, period: "1st Semester" }));
    const second = targetPeriod === "session" ? targetCoursesSecond.filter((course) => course.code.trim()).map((course) => ({ ...course, period: "2nd Semester" })) : [];
    const courses = [...first, ...second];
    if (!courses.length || targetSemesterPlan.requiredGpa > maxPoint || targetSemesterPlan.requiredGpa <= 0) return { rows: [], points: 0, gpa: 0 };
    // A target guide must never recommend failing a course. Start every course at
    // the lowest passing grade, then raise grades until the required credit points are met.
    const passingGrades = [...activeGrades].filter((grade) => grade.point > 0 && grade.letter !== "F").sort((a,b) => a.point - b.point);
    const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);
    const needed = Math.max(0, Math.ceil(targetSemesterPlan.requiredPoints - 1e-9));
    const minimumPass = passingGrades[0];
    let rows = courses.map((course) => ({ ...course, grade: minimumPass.letter, point: minimumPass.point, credit: minimumPass.point * course.units }));
    let points = rows.reduce((sum,row)=>sum+row.credit,0);
    while (points < needed) {
      let bestIndex=-1, bestNext=-1, bestGain=Infinity;
      rows.forEach((row,index)=>{ const gi=passingGrades.findIndex((g)=>g.letter===row.grade); const next=passingGrades[gi+1]; if(!next)return; const gain=(next.point-row.point)*row.units; if(gain>0&&gain<bestGain){bestGain=gain;bestIndex=index;bestNext=gi+1;} });
      if(bestIndex<0) break;
      const current=rows[bestIndex], next=passingGrades[bestNext]; points+=(next.point-current.point)*current.units;
      rows=rows.map((row,index)=>index===bestIndex?{...row,grade:next.letter,point:next.point,credit:next.point*row.units}:row);
    }
    return { rows, points, gpa: totalUnits ? points/totalUnits : 0 };
  }, [targetCoursesFirst, targetCoursesSecond, targetPeriod, targetSemesterPlan, activeGrades, maxPoint]);

  const ctcpInvalid = ctcp.trim() !== "" && !targetSemesterPlan.exact;

  function updateSemester(id: number, patch: Partial<Semester>) { setSemesters((list) => list.map((item) => item.id === id ? { ...item, ...patch } : item)); }
  function updateCourse(semesterId: number, courseId: number, field: keyof Course, value: string | number) {
    setSemesters((list) => list.map((semester) => semester.id === semesterId ? { ...semester, courses: semester.courses.map((course) => course.id === courseId ? { ...course, [field]: value } : course) } : semester));
  }
  function addSemester() {
    if (semesters.length >= 18) return;
    const last = semesters.at(-1); const semester = makeSemester(semesters.length, entryMode, last?.level, stageLevels);
    if (last) { const levelIndex = stageLevels.indexOf(last.level); semester.level = last.term === "1st Semester" ? last.level : stageLevels[Math.min(stageLevels.length - 1, Math.max(0, levelIndex) + 1)]; semester.term = last.term === "1st Semester" ? "2nd Semester" : "1st Semester"; }
    setSemesters((list) => [...list, semester]); setOpenSemester(semester.id);
  }
  function changeSystem(next: System) {
    if (next === system) return;
    const hasPlan = currentCgpa.trim() !== "" || semesters.some((semester) => semester.courses.some((course) => course.code.trim()));
    if (hasPlan && !window.confirm("Changing the grading system will recalculate this plan using the new grade points and classification rules. Continue?")) return;
    setSystem(next);
    const nextMax = ["university-4", "polytechnic-4", "nce-4"].includes(next) ? 4 : 5;
    if (Number(targetCgpa) > nextMax) setTargetCgpa(nextMax === 4 ? "3.50" : "4.50");
    setSemesters((list) => list.map((semester) => ({ ...semester, courses: semester.courses.map((course) => ({ ...course, grade: "" })) })));
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
  function resetPlan() { const first = makeSemester(0, entryMode, startStage, stageLevels); first.term = startTerm; setSemesters([first]); setOpenSemester(first.id); setCurrentCgpa(""); setCtnup(""); setCtcp(""); setTargetCgpa(maxPoint === 4 ? "3.50" : "4.50"); window.localStorage.removeItem("soh-cgpa-planner-v3"); }

  const reportName = () => `SOH-CGPA-Projection-${(studentName || "Student").trim().replace(/[^a-z0-9]+/gi, "-")}.`;
  const motivation = projection.projectedCgpa >= projection.target
    ? "You are on track to achieve your target. Stay consistent and finish strong!"
    : `Your target is still the goal. Focus on the required ${projection.requiredAverage > 0 && projection.requiredAverage <= maxPoint ? projection.requiredAverage.toFixed(2) : "best possible"} average GPA and keep improving semester by semester.`;

  function loadLogo(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = "/soh-logo.jpg"; });
  }

  async function buildBrandedCgpaReportCanvas() {
    const logo = await loadLogo();
    const canvas = document.createElement("canvas");
    canvas.width = 1240; canvas.height = 1754;
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Unable to create report.");
    const GREEN="#006837", DARK_GREEN="#064e3b", BRIGHT_GREEN="#16a34a", RED="#dc2626", DARK="#0f172a", LIGHT="#eef2f5", BORDER="#cbd5e1", WHITE="#ffffff";
    ctx.fillStyle=WHITE; ctx.fillRect(0,0,1240,1754);
    ctx.beginPath(); ctx.moveTo(1025,0); ctx.lineTo(1240,0); ctx.lineTo(1240,185); ctx.closePath(); ctx.fillStyle="#062f28"; ctx.fill();
    ctx.beginPath(); ctx.moveTo(1075,0); ctx.lineTo(1240,0); ctx.lineTo(1240,135); ctx.closePath(); ctx.fillStyle="#00853f"; ctx.fill();
    ctx.beginPath(); ctx.moveTo(1135,0); ctx.lineTo(1240,0); ctx.lineTo(1240,78); ctx.closePath(); ctx.fillStyle=BRIGHT_GREEN; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,1575); ctx.lineTo(0,1754); ctx.lineTo(180,1754); ctx.closePath(); ctx.fillStyle="#062f28"; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0,1630); ctx.lineTo(0,1754); ctx.lineTo(130,1754); ctx.closePath(); ctx.fillStyle=BRIGHT_GREEN; ctx.fill();
    ctx.beginPath(); ctx.moveTo(48,1685); ctx.lineTo(90,1754); ctx.lineTo(190,1754); ctx.closePath(); ctx.fillStyle=RED; ctx.fill();
    ctx.fillStyle=WHITE; ctx.fillRect(78,55,150,150); ctx.drawImage(logo,88,65,130,130);
    ctx.fillStyle=GREEN; ctx.font="700 42px Arial"; ctx.fillText("S.O.H CONSULTS",270,90);
    ctx.fillStyle=DARK; ctx.font="700 27px Arial"; ctx.fillText(plannerMode === "target" ? "TARGET CGPA ACTION REPORT" : "CGPA ACADEMIC PROJECTION REPORT",270,132);
    ctx.font="400 20px Arial"; ctx.fillStyle="#475569"; ctx.fillText("Your Guide. Your Success.",270,168);
    ctx.fillStyle=LIGHT; ctx.fillRect(70,245,1100,155); ctx.fillStyle=DARK; ctx.font="700 23px Arial";
    ctx.fillText(studentName || "Student Projection",100,290); ctx.font="400 18px Arial";
    ctx.fillText(programme || "Programme not provided",100,325); ctx.fillText(systemLabel(system),100,358);
    ctx.font="700 18px Arial"; ctx.fillText("CURRENT CGPA",690,285); ctx.fillText("TARGET",900,285);
    ctx.fillStyle=GREEN; ctx.font="700 38px Arial"; ctx.fillText(currentCgpa || "0.00",690,330); ctx.fillText(Number(targetCgpa||0).toFixed(2),900,330);
    ctx.fillStyle=DARK_GREEN; ctx.fillRect(70,435,1100,130); ctx.fillStyle=WHITE; ctx.font="700 22px Arial"; ctx.fillText(plannerMode === "target" ? "SEMESTER GPA REQUIRED" : "PROJECTED RESULT",100,478);
    const reportResult = plannerMode === "target" ? (targetSemesterPlan.requiredGpa > maxPoint ? "NOT POSSIBLE" : Math.max(0,targetSemesterPlan.requiredGpa).toFixed(2)) : Math.min(maxPoint, Math.max(0, projection.projectedCgpa)).toFixed(2);
    ctx.font="700 42px Arial"; ctx.fillText(reportResult,100,530); ctx.font="700 24px Arial";
    if (plannerMode === "target") ctx.fillText(`Target CGPA ${targetSemesterPlan.target.toFixed(2)} after ${targetSemesterPlan.units} units`,360,526);
    else ctx.fillText(classification(Math.min(maxPoint, Math.max(0, projection.projectedCgpa)),system),250,526);
    let y=625; ctx.fillStyle=DARK; ctx.font="700 25px Arial"; ctx.fillText("ACADEMIC PROJECTION",70,y); y+=35;
    ctx.fillStyle=GREEN; ctx.fillRect(70,y,1100,52); ctx.fillStyle=WHITE; ctx.font="700 16px Arial";
    ["Stage","Units","TCP","GPA","Cumulative Units","CGPA"].forEach((t,i)=>ctx.fillText(t,[90,480,600,710,815,1040][i],y+33)); y+=52;
    ctx.font="400 16px Arial";
    (plannerMode === "target" ? [] : projection.rows.slice(0,8)).forEach((row,index)=>{ctx.fillStyle=index%2?WHITE:"#f8fafc";ctx.fillRect(70,y,1100,55);ctx.fillStyle=DARK;ctx.fillText(`${row.level} ${row.term}`,90,y+34);ctx.fillText(String(row.units),490,y+34);ctx.fillText(String(row.points),605,y+34);ctx.fillText(row.gpa.toFixed(2),715,y+34);ctx.fillText(String(row.cumulativeUnits),850,y+34);ctx.font="700 16px Arial";ctx.fillStyle=GREEN;ctx.fillText(row.cgpa.toFixed(2),1050,y+34);ctx.font="400 16px Arial";y+=55;});
    if (plannerMode === "target") {
      ctx.fillStyle="#f8fafc"; ctx.fillRect(70,y,1100,70); ctx.fillStyle=DARK; ctx.font="400 17px Arial";
      ctx.fillText(`${startStage} ${startTerm}`,90,y+42); ctx.fillText(String(targetSemesterPlan.units),490,y+42);
      ctx.fillText(targetSemesterPlan.requiredGpa > maxPoint ? "-" : Math.ceil(Math.max(0,targetSemesterPlan.requiredPoints)).toString(),605,y+42);
      ctx.fillText(targetSemesterPlan.requiredGpa > maxPoint ? "-" : Math.max(0,targetSemesterPlan.requiredGpa).toFixed(2),715,y+42);
      ctx.fillText(String(targetSemesterPlan.oldUnits + targetSemesterPlan.units),850,y+42); ctx.fillStyle=GREEN; ctx.font="700 16px Arial"; ctx.fillText(targetSemesterPlan.target.toFixed(2),1050,y+42); y+=70;
      if (targetGradeSuggestion.rows.length) {
        y+=22; ctx.fillStyle=DARK; ctx.font="700 22px Arial"; ctx.fillText("SUGGESTED GRADE COMBINATION",70,y); y+=22;
        ctx.fillStyle=GREEN; ctx.fillRect(70,y,1100,44); ctx.fillStyle=WHITE; ctx.font="700 14px Arial";
        ["Course","Units","Grade","GP","Credit Point"].forEach((t,i)=>ctx.fillText(t,[90,560,700,830,970][i],y+28)); y+=44;
        targetGradeSuggestion.rows.slice(0,9).forEach((row,index)=>{ctx.fillStyle=index%2?WHITE:"#f8fafc";ctx.fillRect(70,y,1100,42);ctx.fillStyle=DARK;ctx.font="400 14px Arial";ctx.fillText(row.code,90,y+27);ctx.fillText(String(row.units),570,y+27);ctx.font="700 14px Arial";ctx.fillStyle=GREEN;ctx.fillText(row.grade,710,y+27);ctx.fillStyle=DARK;ctx.fillText(row.point.toFixed(1),835,y+27);ctx.fillText(row.credit.toFixed(1),980,y+27);y+=42;});
        y+=10; ctx.fillStyle=DARK_GREEN; ctx.font="700 16px Arial"; ctx.fillText(`Required GPA ${targetSemesterPlan.requiredGpa.toFixed(2)} | Suggested GPA ${targetGradeSuggestion.gpa.toFixed(2)} | Suggested CP ${targetGradeSuggestion.points.toFixed(1)}`,90,y); y+=20;
      }
    }
    y+=35; ctx.fillStyle="#dcfce7"; ctx.fillRect(70,y,1100,150); ctx.fillStyle=DARK_GREEN; ctx.font="700 21px Arial"; ctx.fillText("TARGET GUIDANCE",100,y+38);
    ctx.font="400 17px Arial"; const words=targetStatus.split(" "); let line=""; let ly=y+72; for(const word of words){const test=line+word+" ";if(ctx.measureText(test).width>1020){ctx.fillText(line,100,ly);line=word+" ";ly+=25;}else line=test;}ctx.fillText(line,100,ly);
    ctx.strokeStyle=BORDER; ctx.beginPath(); ctx.moveTo(70,1640); ctx.lineTo(1170,1640); ctx.stroke();
    ctx.fillStyle=DARK; ctx.font="700 17px Arial"; ctx.fillText("S.O.H CONSULTS",70,1680); ctx.font="400 15px Arial"; ctx.fillText("WhatsApp: 0818 214 1088",775,1680); ctx.fillText("Oluyepeadetayo@gmail.com",775,1706);
    ctx.fillStyle="#64748b"; ctx.font="400 13px Arial"; ctx.fillText("Projection only. Confirm your institution's official grading and retake rules.",70,1720);
    return canvas;
  }

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf"); const canvas=await buildBrandedCgpaReportCanvas();
    const pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4",compress:true});
    pdf.addImage(canvas.toDataURL("image/jpeg",0.97),"JPEG",0,0,210,297,undefined,"FAST"); pdf.save(`${reportName()}pdf`);
  }

  async function downloadImage() {
    const canvas=await buildBrandedCgpaReportCanvas(); const link=document.createElement("a");
    link.download=`${reportName()}jpg`; link.href=canvas.toDataURL("image/jpeg",0.97); link.click();
  }

  const targetStatus = !targetSemesterPlan.oldUnits || !currentCgpa.trim() ? "Enter your current CGPA and completed course units first."
    : !targetSemesterPlan.units ? "Add your course codes and course units for the target period."
    : targetSemesterPlan.requiredGpa > maxPoint ? `To move from ${targetSemesterPlan.oldCgpa.toFixed(2)} to ${targetSemesterPlan.target.toFixed(2)} in this semester, you would need a GPA of ${targetSemesterPlan.requiredGpa.toFixed(2)} / ${maxPoint.toFixed(2)}, which is above the grading scale. Even a perfect ${maxPoint.toFixed(2)} GPA across these courses would put your CGPA at about ${targetSemesterPlan.maximumCgpa.toFixed(2)}.`
    : targetSemesterPlan.requiredGpa <= 0 ? `Your current record already meets or exceeds the ${targetSemesterPlan.target.toFixed(2)} target. Keep your semester GPA as strong as possible to protect or improve it.`
    : `To move from ${targetSemesterPlan.oldCgpa.toFixed(2)} to ${targetSemesterPlan.target.toFixed(2)} after ${targetPeriod === "session" ? "this session" : "this semester"}, you need approximately ${targetSemesterPlan.requiredGpa.toFixed(2)} / ${maxPoint.toFixed(2)} average GPA across ${targetSemesterPlan.units} course units. That is about ${Math.ceil(targetSemesterPlan.requiredPoints)} credit points across the target period.`;

  return <main className="min-h-screen bg-gray-50 text-gray-900">
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><a href="/"><img src="/soh-logo.jpg" alt="S.O.H CONSULTS" className="h-16 w-auto" /></a><nav className="hidden gap-6 text-sm font-semibold md:flex"><a href="/">Home</a><a href="/updates">Updates</a><a href="/screening-calculator">Screening Calculator</a></nav><a href="https://wa.me/2348182141088" className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white">WhatsApp Us</a></div></header>
    <section className="bg-gradient-to-br from-green-950 via-green-900 to-green-700 py-14 text-white"><div className="mx-auto max-w-5xl px-5 text-center"><p className="font-bold uppercase tracking-widest text-green-300">S.O.H CONSULTS Academic Tool</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">CGPA Academic Planner</h1><p className="mx-auto mt-5 max-w-3xl leading-8 text-green-50">Plan one semester, a full session or an extended academic journey, including 7-year programmes and extra years, and see your CGPA journey before the results arrive.</p></div></section>

    {!plannerMode && <section className="py-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-widest text-green-700">CGPA Simulator / Planner</p>
          <p className="mt-2 text-sm font-bold text-green-800">Using: {systemLabel(system)}</p>
          <h2 className="mt-2 text-3xl font-black">What do you want to calculate?</h2>
          <p className="mt-2 text-gray-600">Choose one tool to continue.</p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {([{ id: "target", icon: "🎯", title: "Target CGPA Planner", text: "What do I need to do to reach the CGPA I want?" }, { id: "projector", icon: "📊", title: "CGPA Projector", text: "What will my CGPA become if I get these grades?" }, { id: "retake", icon: "🔄", title: "Retake Impact", text: "If I improve a failed course, how could my CGPA change?" }] as const).map((tool) => (
              <a key={tool.id} href={`/cgpa-calculator/planner?grading=${system}&tool=${tool.id}`} className={`rounded-2xl border p-5 text-left transition ${plannerMode === tool.id ? "border-green-700 bg-green-50 ring-2 ring-green-200" : "hover:border-green-400"}`}><span className="text-2xl">{tool.icon}</span><h3 className="mt-3 text-xl font-black">{tool.title}</h3><p className="mt-2 text-sm text-gray-600">{tool.text}</p><p className="mt-4 font-black text-green-700">Open Tool →</p></a>
            ))}
          </div>
          <div className="mt-6"><a href="/cgpa-calculator" className="text-sm font-black text-green-700">← Change grading system</a></div>
        </div>
      </div>
    </section>}

    {plannerMode && <div className="mx-auto max-w-7xl px-5 pt-8 lg:px-8"><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4"><div><p className="text-xs font-black uppercase tracking-widest text-green-700">CGPA Simulator / Planner</p><p className="font-black">{plannerMode === "target" ? "🎯 Target CGPA Planner" : plannerMode === "projector" ? "📊 CGPA Projector" : "🔄 Retake Impact"} · {systemLabel(system)}</p></div><a href={`/cgpa-calculator/planner?grading=${system}`} className="rounded-xl border px-4 py-2 text-sm font-black text-green-700">← Choose another tool</a></div></div>}

    {plannerMode && <section className="py-10"><div className="mx-auto max-w-7xl space-y-8 px-5 lg:px-8">
      <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-black uppercase tracking-widest text-green-700">Student profile</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><label className="font-bold">Mode of Entry<select value={entryMode} onChange={(e) => changeEntryMode(e.target.value as EntryMode)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3"><option value="utme">UTME</option><option value="direct-entry">Direct Entry</option></select></label><label className="font-bold">Programme Duration<select value={programmeYears} onChange={(e) => setProgrammeYears(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3">{(entryMode === "direct-entry" ? [3,4,5,6,7] : [4,5,6,7]).map((year) => <option key={year} value={String(year)}>{year} years</option>)}</select></label><label className="font-bold">Student Name (optional)<input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Your name" className="mt-2 w-full rounded-xl border px-4 py-3" /></label><label className="font-bold">Programme (optional)<input value={programme} onChange={(e) => setProgramme(e.target.value)} placeholder="e.g. Marketing" className="mt-2 w-full rounded-xl border px-4 py-3" /></label></div>{system === "lasu" && <><div className="mt-5 grid gap-3 rounded-2xl bg-green-50 p-4 text-green-950 sm:grid-cols-3"><div><p className="text-xs font-bold uppercase">LASU planning benchmark</p><p className="text-xl font-black">{projection.graduationUnits} units</p></div><div><p className="text-xs font-bold uppercase">Units left now</p><p className="text-xl font-black">{projection.unitsLeftNow}</p></div><div><p className="text-xs font-bold uppercase">After this projection</p><p className="text-xl font-black">{projection.unitsLeftAfterProjection} units left</p></div></div><p className="mt-3 text-xs leading-5 text-gray-500">LASU planning estimate based on 18 course units per semester. Confirm your programme&apos;s official graduation requirements.</p></>}</section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-sm font-black uppercase tracking-widest text-green-700">Current record</p><h2 className="mt-1 text-2xl font-black">Where are you starting from?</h2></div><label className="min-w-[280px] font-bold">Select Your Grading System<span className="mt-1 block text-xs font-normal text-gray-500">Choose the grading system used by your institution.</span><select value={system} onChange={(e) => changeSystem(e.target.value as System)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-bold"><option value="lasu">LASU 5.0 Grading System</option><option value="university-5">General University 5.0</option><option value="university-4">General University 4.0</option><option value="polytechnic-4">Polytechnic 4.0 (ND/HND)</option><option value="nce-5">College of Education / NCE 5.0</option><option value="nce-4">College of Education / NCE 4.0</option></select></label></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="font-bold">Start Projection From<select value={startStage} onChange={(e) => { const level=e.target.value; setStartStage(level); if (semesters.length === 1) updateSemester(semesters[0].id,{level}); }} className="mt-2 w-full rounded-xl border bg-white px-4 py-3">{stageLevels.map((level)=><option key={level}>{level}</option>)}</select></label><label className="font-bold">Starting Semester<select value={startTerm} onChange={(e) => { const term=e.target.value; setStartTerm(term); if (semesters.length === 1) updateSemester(semesters[0].id,{term}); }} className="mt-2 w-full rounded-xl border bg-white px-4 py-3"><option>1st Semester</option><option>2nd Semester</option></select></label><div className="sm:col-span-2 rounded-xl bg-green-50 p-4 text-sm text-green-900"><p className="font-black">Previous academic years do not need to be entered one by one.</p><p className="mt-1">Enter your cumulative CGPA and completed units up to the semester before this starting point, then project forward from here.</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-3"><label className="font-bold">Current CGPA<input type="number" min="0" max={maxPoint} step="0.01" value={currentCgpa} onChange={(e) => setCurrentCgpa(e.target.value)} placeholder="e.g. 3.20" className="mt-2 w-full rounded-xl border px-4 py-3" /></label><label className="font-bold">Completed Course Units (CTNUP)<input type="number" min="0" value={ctnup} onChange={(e) => setCtnup(e.target.value)} placeholder="e.g. 121" className="mt-2 w-full rounded-xl border px-4 py-3" /></label><label className="font-bold">Cumulative Credit Points (CTCP)<input type="number" min="0" step="0.01" value={ctcp} onChange={(e) => setCtcp(e.target.value)} placeholder="e.g. 458 (optional)" className="mt-2 w-full rounded-xl border px-4 py-3" /></label></div><div className="mt-4 grid gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 sm:grid-cols-[1fr_220px] sm:items-center"><div><p className="font-black text-green-950">Set your personal CGPA target</p><p className="mt-1 text-sm text-green-800">Your goal can be any valid CGPA on your grading scale. The planner will calculate what you need to reach it.</p></div><input aria-label="Personal target CGPA" type="number" min="0" max={maxPoint} step="0.01" value={targetCgpa} onChange={(e) => setTargetCgpa(e.target.value)} placeholder={`0.00 - ${maxPoint.toFixed(2)}`} className="w-full rounded-xl border bg-white px-4 py-3 font-black text-green-950" /></div><div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-900"><p className="font-black">{systemLabel(system)} · Maximum CGPA {maxPoint.toFixed(2)}</p><p className="mt-1">CTNUP is the total number of course units passed. CTCP is the sum of Unit x GP for all completed courses. Entering CTCP gives an exact projection; otherwise the rounded CGPA produces an estimate.</p><p className="mt-2 text-xs">Use the grading profile that matches your institution. Classification rules may vary, especially across NCE and polytechnic institutions.</p><p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs font-bold">Grade points: {gradeScale}</p></div></section>

      {plannerMode !== "target" &&       <div className="grid gap-8 xl:grid-cols-[1.45fr_0.75fr]"><div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-black uppercase tracking-widest text-green-700">Projection plan</p><h2 className="mt-1 text-3xl font-black">Projected Semesters: {semesters.length}</h2></div><button onClick={addSemester} disabled={semesters.length >= 18} className="rounded-xl bg-green-700 px-5 py-3 font-black text-white disabled:opacity-40">+ Add Semester</button></div>
        {semesters.map((semester, semesterIndex) => { const row = projection.rows[semesterIndex]; const open = openSemester === semester.id; return <section key={semester.id} className="overflow-hidden rounded-3xl border bg-white shadow-sm"><button onClick={() => setOpenSemester(open ? null : semester.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"><div><p className="text-xs font-black uppercase tracking-widest text-green-700">Projection {semesterIndex + 1}</p><h3 className="mt-1 text-xl font-black">{semester.level} - {semester.term}</h3><p className="mt-1 text-sm text-gray-500">{row?.units || 0} units · GPA {row?.gpa.toFixed(2)} · CGPA {row?.cgpa.toFixed(2)}</p><p className="mt-1 text-xs font-semibold text-green-700">{systemLabel(system)} · Max {maxPoint.toFixed(2)}</p>{semester.term === "2nd Semester" && (() => { const session = sessionSummaries.find((item) => item.level === semester.level); return session ? <p className="mt-1 text-xs font-black text-green-800">Session: {session.units} units · GPA {session.gpa.toFixed(2)}</p> : null; })()}</div><span className="text-2xl font-black text-green-700">{open ? "−" : "+"}</span></button>{open && <div className="border-t p-5 sm:p-6"><div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-900">Projection period: {semester.level} · {semester.term}</div><div className="mt-5 hidden grid-cols-[1fr_112px_150px_44px] gap-2 px-3 text-xs font-black uppercase tracking-wide text-gray-500 sm:grid"><span>Course Code</span><span>Course Units</span><span>Expected Grade</span><span></span></div><div className="mt-2 space-y-3">{semester.courses.map((course, index) => <div key={course.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_112px_150px_44px] rounded-2xl bg-gray-50 p-3 sm:grid-cols-[1fr_112px_110px_44px]"><input value={course.code} onChange={(e) => updateCourse(semester.id, course.id, "code", e.target.value.toUpperCase())} placeholder={`Course ${index + 1}`} className="min-w-0 rounded-xl border px-3 py-3" /><select value={course.units} onChange={(e) => updateCourse(semester.id, course.id, "units", Number(e.target.value))} className="rounded-xl border bg-white px-2 font-bold">{[1,2,3,4,5,6].map((unit) => <option key={unit} value={unit}>{unit} unit{unit > 1 ? "s" : ""}</option>)}</select><select value={course.grade} onChange={(e) => updateCourse(semester.id, course.id, "grade", e.target.value)} className="rounded-xl border bg-white px-2 py-3 font-black"><option value="">Expected Grade</option>{activeGrades.map((grade) => <option key={grade.letter} value={grade.letter}>{`${grade.letter} (${grade.point.toFixed(1)})`}</option>)}</select><button disabled={semester.courses.length === 1} onClick={() => updateSemester(semester.id, { courses: semester.courses.filter((item) => item.id !== course.id) })} className="text-xl font-black text-red-600 disabled:opacity-30">×</button></div>)}</div><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => updateSemester(semester.id, { courses: [...semester.courses, newCourse()] })} className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-black text-white">+ Add Course</button>{semesters.length > 1 && <button onClick={() => setSemesters((list) => list.filter((item) => item.id !== semester.id))} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-black text-red-700">Remove Semester</button>}</div></div>}</section>; })}
      </div>

      <aside className="xl:sticky xl:top-28 xl:self-start"><div className="overflow-hidden rounded-3xl bg-green-950 text-white shadow-xl"><div className="p-7"><p className="text-sm font-black uppercase tracking-widest text-green-300">Final Projection</p><p className="mt-1 text-xs text-green-100">{entryMode === "utme" ? "UTME" : "Direct Entry"} · {programmeYears}</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">{projection.exact || !Number(ctnup) ? "Projected CGPA" : "Estimated CGPA"}</p><p className="mt-1 text-3xl font-black">{projection.projectedCgpa.toFixed(2)}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">Projected Units</p><p className="mt-1 text-3xl font-black">{projection.projectedUnits}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">Future Units</p><p className="mt-1 text-2xl font-black">{projection.futureUnits}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">Projected CTCP</p><p className="mt-1 text-2xl font-black">{projection.projectedPoints.toFixed(0)}</p></div></div><div className="mt-5 rounded-2xl bg-green-300 p-5 text-green-950"><p className="text-xs font-black uppercase">{classificationLabel}</p><p className="mt-1 text-xl font-black">{classification(projection.projectedCgpa, system)}</p><p className="mt-2 text-xs font-bold">Current: {currentStanding} → Projected: {classification(projection.projectedCgpa, system)}</p></div></div><div className="border-t border-white/10 p-7"><label className="font-bold">Your Target CGPA<input type="number" min="0" max={maxPoint} step="0.01" value={targetCgpa} onChange={(e) => setTargetCgpa(e.target.value)} placeholder={`Choose any target from 0.00 to ${maxPoint.toFixed(2)}`} className="mt-2 w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-gray-900" /><span className="mt-2 block text-xs font-normal text-green-100">Enter the CGPA you personally want to reach. It does not have to be First Class or the maximum CGPA.</span></label><div className={`mt-4 rounded-xl p-4 text-sm font-bold leading-6 ${projection.requiredAverage > maxPoint ? "bg-red-100 text-red-900" : "bg-white/10 text-green-50"}`}>{targetStatus}</div><button onClick={savePlan} className="mt-5 w-full rounded-xl bg-white px-5 py-3 font-black text-green-900">{saved ? "Plan Saved ✓" : "Save on This Device"}</button><div className="mt-3 grid grid-cols-2 gap-3"><button onClick={downloadPdf} className="rounded-xl bg-green-300 px-3 py-3 text-sm font-black text-green-950">Download PDF</button><button onClick={downloadImage} className="rounded-xl bg-green-300 px-3 py-3 text-sm font-black text-green-950">Download Image</button></div><button onClick={resetPlan} className="mt-3 w-full rounded-xl border border-white/20 px-5 py-3 font-black">Reset Planner</button></div></div></aside></div>}

      {plannerMode === "target" && <section className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm sm:p-8">
        <p className="text-sm font-black uppercase tracking-widest text-green-700">Target CGPA Planner</p>
        <h2 className="mt-1 text-3xl font-black">What do I need to reach my target?</h2>
        <p className="mt-2 text-sm text-green-900">Your current record above is the starting point. Add the actual courses you will take and the course unit for each one.</p>
        <label className="mt-6 block max-w-sm font-bold">Target Period<select value={targetPeriod} onChange={(e) => setTargetPeriod(e.target.value as "semester" | "session")} className="mt-2 w-full rounded-xl border bg-white px-4 py-3"><option value="semester">This Semester</option><option value="session">This Session</option></select></label>

        {[{title: targetPeriod === "session" ? "1st Semester Courses" : "Courses This Semester", list: targetCoursesFirst, setList: setTargetCoursesFirst}, ...(targetPeriod === "session" ? [{title:"2nd Semester Courses", list:targetCoursesSecond, setList:setTargetCoursesSecond}] : [])].map((group) => <div key={group.title} className="mt-6 rounded-2xl bg-white p-5">
          <div className="flex items-center justify-between gap-3"><div><h3 className="text-xl font-black">{group.title}</h3><p className="text-sm text-gray-500">Enter each course code and its actual course unit.</p></div><span className="rounded-full bg-green-100 px-3 py-1 text-sm font-black text-green-800">{group.list.filter((course) => course.code.trim()).reduce((sum,course)=>sum+(Number(course.units)||0),0)} units</span></div>
          <div className="mt-4 hidden grid-cols-[1fr_130px_44px] gap-2 px-2 text-xs font-black uppercase text-gray-500 sm:grid"><span>Course Code</span><span>Course Units</span><span></span></div>
          <div className="mt-2 space-y-3">{group.list.map((course,index)=><div key={course.id} className="grid grid-cols-[1fr_100px_38px] gap-2 rounded-xl bg-gray-50 p-2 sm:grid-cols-[1fr_130px_44px]"><input value={course.code} onChange={(e)=>group.setList((list)=>list.map((item)=>item.id===course.id?{...item,code:e.target.value.toUpperCase()}:item))} placeholder={`Course ${index+1} code`} className="min-w-0 rounded-xl border px-3 py-3"/><select value={course.units} onChange={(e)=>group.setList((list)=>list.map((item)=>item.id===course.id?{...item,units:Number(e.target.value)}:item))} className="rounded-xl border bg-white px-2 font-bold">{[1,2,3,4,5,6].map((unit)=><option key={unit} value={unit}>{unit} unit{unit>1?"s":""}</option>)}</select><button disabled={group.list.length===1} onClick={()=>group.setList((list)=>list.filter((item)=>item.id!==course.id))} className="text-xl font-black text-red-600 disabled:opacity-30">×</button></div>)}</div>
          <button onClick={()=>group.setList((list)=>[...list,{id:Date.now()+Math.random(),code:"",units:3}])} className="mt-4 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-black text-white">+ Add Course</button>
        </div>)}

        {targetGradeSuggestion.rows.length > 0 && <div className="mt-6 overflow-hidden rounded-2xl border border-green-200 bg-white"><div className="p-5"><p className="text-sm font-black uppercase tracking-widest text-green-700">Suggested Grade Combination</p><h3 className="mt-1 text-2xl font-black">A practical way to meet your required GPA</h3><p className="mt-2 text-sm text-gray-600">This is one suggested combination, not the only possible combination. Every suggested course grade is a pass. Aim for these grades or better.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-green-950 text-white"><tr><th className="px-5 py-3">Course</th>{targetPeriod==="session"&&<th className="px-5 py-3">Semester</th>}<th className="px-5 py-3">Units</th><th className="px-5 py-3">Suggested Grade</th><th className="px-5 py-3">Grade Point</th><th className="px-5 py-3">Credit Point</th></tr></thead><tbody className="divide-y">{targetGradeSuggestion.rows.map((row)=><tr key={row.id}><td className="px-5 py-3 font-black">{row.code}</td>{targetPeriod==="session"&&<td className="px-5 py-3">{row.period}</td>}<td className="px-5 py-3">{row.units}</td><td className="px-5 py-3 font-black text-green-700">{row.grade}</td><td className="px-5 py-3">{row.point.toFixed(1)}</td><td className="px-5 py-3">{row.credit.toFixed(1)}</td></tr>)}</tbody></table></div><div className="grid gap-3 bg-green-50 p-5 sm:grid-cols-3"><div><p className="text-xs font-bold uppercase text-gray-500">Required GPA</p><p className="text-xl font-black">{targetSemesterPlan.requiredGpa.toFixed(2)}</p></div><div><p className="text-xs font-bold uppercase text-gray-500">Suggested Combination GPA</p><p className="text-xl font-black text-green-700">{targetGradeSuggestion.gpa.toFixed(2)}</p></div><div><p className="text-xs font-bold uppercase text-gray-500">Suggested Credit Points</p><p className="text-xl font-black">{targetGradeSuggestion.points.toFixed(1)} <span className="text-sm font-normal">/ {Math.ceil(targetSemesterPlan.requiredPoints)} needed</span></p></div></div></div>}
        {ctcpInvalid && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">The CTCP entered is impossible for {ctnup || 0} completed units on a {maxPoint.toFixed(1)} scale, so it has been ignored. The planner is using Current CGPA × Completed Units instead.</p>}
        <div className="mt-6 rounded-3xl bg-green-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-widest text-green-300">What You Need</p><p className="mt-3 text-lg font-bold leading-8">{targetStatus}</p>
        {targetSemesterPlan.oldUnits > 0 && targetSemesterPlan.units > 0 && <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">Current CGPA</p><p className="mt-1 text-2xl font-black">{targetSemesterPlan.oldCgpa.toFixed(2)}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">Target CGPA</p><p className="mt-1 text-2xl font-black">{targetSemesterPlan.target.toFixed(2)}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">{targetPeriod==="session"?"Average GPA Needed":"Semester GPA Needed"}</p><p className="mt-1 text-2xl font-black">{targetSemesterPlan.requiredGpa>maxPoint?"Not possible":Math.max(0,targetSemesterPlan.requiredGpa).toFixed(2)}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-100">{targetPeriod==="session"?"Session Units":"Semester Units"}</p><p className="mt-1 text-2xl font-black">{targetSemesterPlan.units}</p></div></div>}</div>
        {targetSemesterPlan.requiredGpa > maxPoint && targetSemesterPlan.units > 0 && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Even a perfect {maxPoint.toFixed(2)} GPA across these courses would give an estimated CGPA of {targetSemesterPlan.maximumCgpa.toFixed(2)}. The selected target cannot be reached within this course load.</p>}
        <p className="mt-4 text-xs leading-5 text-gray-600">{targetSemesterPlan.exact ? "Using your valid CTCP, this calculation uses exact cumulative credit points." : "CTCP is not being used, so cumulative credit points are estimated from Current CGPA × Completed Units. Because CGPA is usually rounded, the answer is an estimate."}</p>
        <div className="mt-6 flex flex-wrap gap-3"><button onClick={downloadImage} className="rounded-xl bg-green-700 px-5 py-3 font-black text-white">Download Shareable Summary</button><button onClick={downloadPdf} className="rounded-xl border border-green-700 bg-white px-5 py-3 font-black text-green-700">Download PDF Report</button></div>
      </section>}

      {plannerMode === "retake" && <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-black uppercase tracking-widest text-green-700">Carryover / Retake Impact</p><h2 className="mt-1 text-2xl font-black">See what a better retake grade could do</h2><p className="mt-2 text-sm text-gray-600">This uses your current CGPA, completed units and selected grading system. This tool is only for a course you previously failed and are retaking. Choose the rule that matches your institution.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="font-bold">Course Units<input type="number" min="1" max="12" value={retakeUnits} onChange={(e) => setRetakeUnits(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label><label className="font-bold">Failed Grade<input value={`F (${activeGrades.find((grade) => grade.letter === "F")?.point ?? 0})`} disabled className="mt-2 w-full rounded-xl border bg-gray-100 px-4 py-3 text-gray-600" /></label><label className="font-bold">Expected Retake Grade<select value={retakeNewGrade} onChange={(e) => setRetakeNewGrade(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3">{activeGrades.map((grade) => <option key={grade.letter} value={grade.letter}>{grade.letter} ({grade.point})</option>)}</select></label><label className="font-bold">Are failed course units already included in your completed units?<select value={failedUnitsIncluded ? "yes" : "no"} onChange={(e) => setFailedUnitsIncluded(e.target.value === "yes")} className="mt-2 w-full rounded-xl border bg-white px-4 py-3"><option value="no">No / I entered passed units only</option><option value="yes">Yes / failed attempts are included</option></select></label><label className="font-bold">How does your school treat a retake?<select value={retakeRule} onChange={(e) => setRetakeRule(e.target.value as "replace" | "both")} className="mt-2 w-full rounded-xl border bg-white px-4 py-3"><option value="replace">Replace old grade/points</option><option value="both">Keep old attempt + add retake</option></select></label></div><div className="mt-5 grid gap-3 rounded-2xl bg-green-50 p-5 sm:grid-cols-3"><div><p className="text-xs font-bold uppercase text-green-700">Current CGPA</p><p className="text-2xl font-black">{(Number(currentCgpa) || 0).toFixed(2)}</p></div><div><p className="text-xs font-bold uppercase text-green-700">After Retake</p><p className="text-2xl font-black">{retakeImpact.cgpa.toFixed(2)}</p></div><div><p className="text-xs font-bold uppercase text-green-700">Estimated Impact</p><p className="text-2xl font-black">{retakeImpact.change >= 0 ? "+" : ""}{retakeImpact.change.toFixed(2)}</p></div></div><p className="mt-3 text-xs text-gray-500">Retake policies differ by institution. Confirm whether your school replaces the old attempt or counts both attempts before relying on this estimate.</p></section>}

      {plannerMode !== "target" && <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-black uppercase tracking-widest text-green-700">Shareable Summary</p><h2 className="mt-1 text-2xl font-black">Create a clean CGPA projection card</h2><p className="mt-2 text-sm text-gray-600">Use the existing image report as a shareable summary. Your name appears only when you enter it in Student Name.</p></div><button onClick={downloadImage} className="rounded-xl bg-green-700 px-5 py-3 font-black text-white">Download Shareable Summary</button><button onClick={downloadPdf} className="rounded-xl border border-green-700 px-5 py-3 font-black text-green-700">Download PDF Report</button></div></section>}

      {plannerMode === "projector" && <section className="overflow-hidden rounded-3xl border bg-white shadow-sm"><div className="p-6"><p className="text-sm font-black uppercase tracking-widest text-green-700">Academic timeline</p><h2 className="mt-1 text-2xl font-black">Semester-by-semester projection</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-gray-100 text-xs uppercase text-gray-600"><tr><th className="px-5 py-3">Stage</th><th>Units</th><th>TCP</th><th>GPA</th><th>Cumulative Units</th><th>Projected CGPA</th><th>Progress</th></tr></thead><tbody className="divide-y">{projection.rows.map((row) => <tr key={row.id}><td className="px-5 py-4 font-black">{row.level} {row.term}</td><td>{row.units}</td><td>{row.points}</td><td>{row.gpa.toFixed(2)}</td><td>{row.cumulativeUnits}</td><td className="font-black text-green-700">{row.cgpa.toFixed(2)}</td><td><span className={`rounded-full px-3 py-1 text-xs font-black ${row.cgpa >= projection.target ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{row.cgpa >= projection.target ? "Target achieved" : "Building"}</span></td></tr>)}</tbody></table></div></section>}
      <p className="text-center text-sm leading-6 text-gray-500">This planner provides projections only. Grading scales and award classifications can vary by institution. Always confirm with your institution&apos;s official academic regulations.</p>
    </div></section>}
  </main>;
}
