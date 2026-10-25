import { INSTITUTIONS, InstitutionRecord, isOfficialInstitutionUrl, resolveInstitution } from './institution-registry';

// Clarify a likely typo; never silently substitute an institution in an admission answer.
export function institutionClarification(question: string) {
  if (resolveInstitution(question)) return null;
  if (!/admission|utme|cut.?off|requirements?|subjects?|university|college|polytechnic/i.test(question)) return null;
  const tokens = question.toLowerCase().match(/[a-z]{5,}/g) || [];
  const candidates = INSTITUTIONS.filter(institution => tokens.some(token => {
    const alias = institution.key;
    if (Math.abs(token.length - alias.length) > 1) return false;
    let previous = Array.from({ length: alias.length + 1 }, (_, index) => index);
    for (let i = 0; i < token.length; i++) {
      const current = [i + 1];
      for (let j = 0; j < alias.length; j++) current.push(Math.min(current[j] + 1, previous[j + 1] + 1, previous[j] + Number(token[i] !== alias[j])));
      previous = current;
    }
    return previous[alias.length] === 1;
  }));
  return candidates.length === 1 ? `Did you mean ${candidates[0].name} (${candidates[0].key.toUpperCase()})? Please confirm the institution so I can check the correct admission information.` : null;
}

export function officialPortalAnswer(question: string, institution: InstitutionRecord | null) {
  if (!institution || !/official|link|url|website/i.test(question) || !/portal/i.test(question)) return null;
  // A portal lookup must not intercept a factual/status question containing "portal".
  if (/deadline|closing|still open|is.{0,15}open|requirements?|fees?|cost|score|cut.?off/i.test(question)) return null;
  if (!/admission|screening|post.?utme/i.test(question)) return null;
  const url = institution.sourceUrls?.find(value => isOfficialInstitutionUrl(value, institution.key) && /admissionscreening|admissions\.|admission\.|putme\./i.test(value));
  return url ? { url, answer: `The official ${institution.name} admission screening portal is ${url}. This link does not confirm that applications are currently open.` } : null;
}
