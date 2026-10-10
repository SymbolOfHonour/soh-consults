// Fold Unicode headlines and punctuation without changing the displayed copy.
export const normaliseText = (value = "") => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const stopWords = new Set(["the", "a", "an", "and", "or", "for", "of", "to", "in", "on", "how", "with", "your", "my"]);
const institutions: Record<string, string[]> = {
  lasu: ["lagos state university"], unilag: ["university of lagos"],
  fuoye: ["federal university oye ekiti"], lasustech: ["lagos state university of science and technology"],
  uniosun: ["osun state university"], oou: ["olabisi onabanjo university"],
  lasued: ["lagos state university of education"], yabatech: ["yaba college of technology"],
  fuadsi: ["federal university of agriculture and development studies iragbiji"],
};
const aliases: Record<string, string[]> = {
  ...institutions,
  waec: ["wassce", "west african examinations council"], neco: ["national examinations council"],
  cgpa: ["cumulative grade point average"], gpa: ["grade point average"],
};
// Resolve longer names first so LASUED and LASUSTECH never become LASU.
const aliasPhrases = Object.entries(aliases).flatMap(([short, names]) => names.map(name => ({short, name}))).sort((a,b) => b.name.length-a.name.length);
function canonicalSearchText(value: string) {
  let text = normaliseText(value);
  for (const {short, name} of aliasPhrases) text = text.replace(new RegExp(`\\b${name}\\b`, "g"), short);
  return text.replace(/\bo\s+level\b|\bolevels?\b/g, "olevel")
    .replace(/\bcut\s+off\b|\bcutoffs\b/g, "cutoff")
    .replace(/\bpostutme\b/g, "post utme")
    .replace(/\bscholarships\b/g, "scholarship")
    .replace(/\bcalculators\b/g, "calculator");
}
export function institutionKeys(value: string) {
  const words = new Set(canonicalSearchText(value).split(" "));
  return Object.keys(institutions).filter(short => words.has(short));
}
export function searchTokens(query: string) {
  return [...new Set(canonicalSearchText(query).split(" ").filter(token => token && !stopWords.has(token)))];
}
export function searchableText(value: string) {
  const canonical = canonicalSearchText(value);
  let text = `${normaliseText(value)} ${canonical}`;
  for (const [short, names] of Object.entries(aliases)) {
    if (canonical.split(" ").includes(short)) text += ` ${names.join(" ")}`;
  }
  return text;
}
export function matchesSearchToken(words: string[], token: string) {
  // Acronyms and numbers identify a specific institution, body or session.
  if (token in aliases || /^\d+$/.test(token)) return words.includes(token);
  return words.some(word => word.startsWith(token));
}
export function matchesQuery(value: string, query: string) {
  const terms = searchTokens(query), text = searchableText(value);
  const words = text.split(" ");
  return terms.length > 0 && terms.every(term => matchesSearchToken(words, term));
}
const topicRules: Record<string, RegExp> = {
  caps: /\bcaps\b|admission status|accept.*admission/,
  screening: /screening|post utme|aggregate|eligibility/,
  admission: /admission|direct entry|jupeb|application|registration/,
  scholarship: /scholarship|bursary|funding|nelfund/,
  results: /waec|neco|nabteb|o level|olevel|certificate/,
  cgpa: /cgpa|gpa|grade|semester|course unit/,
  career: /internship|job|career|graduate|employment/,
};
export function contentTopics(value: string) {
  const text = normaliseText(value);
  return Object.entries(topicRules).filter(([, pattern]) => pattern.test(text)).map(([topic]) => topic);
}
// Date-only deadlines expire at the end of the Nigerian calendar day (UTC+1).
// Vague text such as "check portal" never becomes a manufactured deadline.
export function deadlineDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const clean = value.trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(clean)) {
    const parsed = new Date(clean); return Number.isNaN(+parsed) ? null : parsed;
  }
  const dates = clean.match(/\b20\d{2}-\d{2}-\d{2}\b|\b\d{1,2}\s+[a-z]+\s+20\d{2}\b|\b[a-z]+\s+\d{1,2},?\s+20\d{2}\b/gi);
  if (!dates || new Set(dates).size !== 1) return null;
  const parsed = new Date(`${dates[0]} UTC`);
  if (Number.isNaN(+parsed)) return null;
  parsed.setUTCHours(22, 59, 59, 999);
  return parsed;
}
