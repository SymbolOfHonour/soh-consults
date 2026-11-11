import records from './programmes.json';
export const programmes = records;
export const FUSTECH_SITTING_NOTICE = 'FUSTECH accepts only one O’Level sitting. All five relevant credit passes, including English Language and Mathematics, must be obtained in the same sitting.';
export type Programme = (typeof programmes)[number];
export type Result = { subject: string; grade: string; sitting: 1 | 2 };
export const gradePoints: Record<string, number> = { A1: 6, B2: 5, B3: 4, C4: 3, C5: 2, C6: 1, D7: 0, E8: 0, F9: 0 };
export const jambSubjects: Record<string, string> = { ENG: 'Use of English', MAT: 'Mathematics', PHY: 'Physics', CHE: 'Chemistry', BIO: 'Biology', AGR: 'Agricultural Science', GEO: 'Geography', ECO: 'Economics', GOV: 'Government', COM: 'Commerce', ACC: 'Principles of Accounts', CSC: 'Computer Studies', LIT: 'Literature in English', CRS: 'Christian Religious Studies', IRS: 'Islamic Studies', HIS: 'History' };
export const subjects = [...new Set(programmes.flatMap(p => p.oLevelSlots.flat()))].sort();
export const sources = { requirements: 'https://admissions.fustech.edu.ng/programme-requirements', guidelines: 'https://admissions.fustech.edu.ng/applicant/guidelines', announcement: 'https://fustech.edu.ng/news/20262027-academic-session-online-undergraduate-admission-screening-exercise', checked: '11 November 2026' };

// Assign distinct subjects to all five slots. Search alternatives rather than
// greedily consuming a subject needed by a later compulsory slot.
export function bestFive(programme: Programme, results: Result[]) {
  const best = new Map<string, Result>();
  for (const row of results) {
    if (row.sitting !== 1 || !(gradePoints[row.grade] > 0)) continue;
    if (!best.has(row.subject) || gradePoints[row.grade] > gradePoints[best.get(row.subject)!.grade]) best.set(row.subject, row);
  }
  let winner: Result[] = [];
  let highest = -1;
  function visit(slot: number, chosen: Result[], used: Set<string>, score: number) {
    if (slot === 5) {
      if (score > highest) { highest = score; winner = [...chosen]; }
      return;
    }
    for (const subject of programme.oLevelSlots[slot]) {
      const row = best.get(subject);
      if (!row || used.has(subject)) continue;
      used.add(subject); chosen.push(row);
      visit(slot + 1, chosen, used, score + gradePoints[row.grade]);
      chosen.pop(); used.delete(subject);
    }
  }
  visit(0, [], new Set(), 0);
  return winner;
}
export function validUtme(programme: Programme, electives: string[]) {
  if (electives.length !== 3 || electives.some(code => !jambSubjects[code] || code === 'ENG') || new Set(electives).size !== 3) return false;
  const codes = ['ENG', ...electives];
  const { compulsory, groups } = programme.utmeRules;
  if (!compulsory.every(code => codes.includes(code))) return false;
  const remaining = codes.filter(code => !compulsory.includes(code));
  function assign(index: number, available: string[]): boolean {
    if (index === groups.length) return available.length === 0;
    const group = groups[index];
    function choose(start: number, chosen: string[]): boolean {
      if (chosen.length === group.count) return assign(index + 1, available.filter(code => !chosen.includes(code)));
      for (let i = start; i < available.length; i++) {
        if (group.subjects.includes(available[i]) && choose(i + 1, [...chosen, available[i]])) return true;
      }
      return false;
    }
    return choose(0, []);
  }
  return assign(0, remaining);
}
export function calculate(programme: Programme, score: string, results: Result[], electives: string[]) {
  const numeric = Number(score);
  const scoreValid = score.trim() !== '' && Number.isFinite(numeric) && Number.isInteger(numeric) && numeric >= 0 && numeric <= 400;
  const selected = bestFive(programme, results);
  const utme = scoreValid ? numeric * 70 / 400 : 0;
  const oLevel = selected.reduce((total, row) => total + gradePoints[row.grade], 0);
  return { selected, utme, oLevel, total: utme + oLevel, scoreValid, minimumMet: scoreValid && numeric >= 185, subjectsMet: validUtme(programme, electives), creditsMet: selected.length === 5 };
}
