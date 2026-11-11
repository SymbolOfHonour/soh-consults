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
