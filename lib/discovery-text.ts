// Fold Unicode headlines and punctuation without changing the displayed copy.
export const normaliseText = (value = "") => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const stopWords = new Set(["the", "a", "an", "and", "or", "for", "of", "to", "in", "on", "how", "with", "your", "my"]);
const aliases: Record<string, string[]> = {
  lasu: ["lagos state university"], unilag: ["university of lagos"],
  fuoye: ["federal university oye ekiti"], lasustech: ["lagos state university of science and technology"],
  uniosun: ["osun state university"], oou: ["olabisi onabanjo university"],
  waec: ["wassce", "west african examinations council"], neco: ["national examinations council"],
  cgpa: ["cumulative grade point average"], utme: ["post utme", "postutme"],
};
export function searchTokens(query: string) {
  return [...new Set(normaliseText(query).split(" ").filter(token => token && !stopWords.has(token)))];
}
export function searchableText(value: string) {
  let text = normaliseText(value);
  for (const [short, names] of Object.entries(aliases)) {
    if (names.some(name => text.includes(name))) text += ` ${short}`;
    if (new RegExp(`\\b${short}\\b`).test(text)) text += ` ${names.join(" ")}`;
  }
  return text;
}
export function matchesQuery(value: string, query: string) {
  const terms = searchTokens(query), text = searchableText(value);
  return terms.length > 0 && terms.every(term => text.split(" ").some(word => word.startsWith(term)));
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
