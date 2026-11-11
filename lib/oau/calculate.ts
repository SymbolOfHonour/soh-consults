export const OAU_SOURCES = {
 notice: 'https://oauife.edu.ng/2026-admission-screening-exercise-for-utme-and-direct-entry-candidates/',
 guidelines: 'https://eportal2.oauife.edu.ng/ug/admission-guidelines',
 checked: '11 November 2026',
};
function numberInRange(raw: string, max: number, integer = false): number | null {
 if (!raw.trim()) return null;
 const value = Number(raw);
 return Number.isFinite(value) && value >= 0 && value <= max && (!integer || Number.isInteger(value)) ? value : null;
}
export function calculateOau(utmeInput: string, oLevelInput: string, postInput: string, targetInput = '') {
 const utme = numberInRange(utmeInput,400,true);
 const oLevel = numberInRange(oLevelInput,10);
 const post = numberInRange(postInput,40);
 const target = numberInRange(targetInput,100);
 const utmePoints = utme === null ? null : utme / 8;
 const complete = utme !== null && oLevel !== null && post !== null;
 const subtotal = (utmePoints ?? 0) + (oLevel ?? 0);
 const combined = oLevel !== null && post !== null ? oLevel + post : null;
 const total = complete ? subtotal + post! : null;
 const minimumPost = oLevel === null ? null : Math.max(0,25-oLevel);
 const targetPost = target !== null && utme !== null && oLevel !== null ? Math.max(0, target-subtotal, 25-oLevel) : null;
 return {utme,oLevel,post,target,utmePoints,complete,subtotal,combined,total,minimumPost,targetPost,
  thresholdsMet: complete && utme! >= 200 && combined! >= 25};
}

export const OAU_GRADE_POINTS: Record<string, number> = { A1:2, B2:1.8, B3:1.6, C4:1.4, C5:1.2, C6:1, D7:0, E8:0, F9:0 };
export function calculateOauGrades(rows: {subject:string;grade:string}[]) {
 const subjects=rows.map(r=>r.subject.trim().toLowerCase());
 const complete=rows.length===5&&subjects.every(Boolean)&&new Set(subjects).size===5&&rows.every(r=>r.grade in OAU_GRADE_POINTS);
 return {complete,points:complete?Math.round(rows.reduce((s,r)=>s+OAU_GRADE_POINTS[r.grade],0)*10)/10:null,credits:rows.filter(r=>OAU_GRADE_POINTS[r.grade]>0).length,duplicate:new Set(subjects.filter(Boolean)).size!==subjects.filter(Boolean).length};
}
export function requiredOauUtme(oLevelInput:string,postInput:string,targetInput:string) {
 const o=numberInRange(oLevelInput,10),p=numberInRange(postInput,40),t=numberInRange(targetInput,100);
 if(o===null||p===null||t===null)return null;
 const score=Math.max(200,Math.ceil((t-o-p)*8-1e-9));
 return {score,possible:score<=400&&o+p>=25,combinedMet:o+p>=25};
}
