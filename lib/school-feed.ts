import type { DiscoveryItem } from "./algorithm-phase2";
import { contentTopics, deadlineDate, institutionKeys, normaliseText } from "./discovery-text";
import { rankContent } from "./ranking-engine";

export const SCHOOL_PREFERENCES_KEY = "soh:my-school:v1";
export const feedTopics = ["admission", "scholarship", "results", "cgpa", "career"] as const;
export type SchoolPreferences = { schools: string[]; topics: string[] };
export const emptyPreferences: SchoolPreferences = { schools: [], topics: [] };
const generalNames = new Set(["nigeria", "national", "nationwide", "all", "general", "other", "n a", ""]);
const schoolText = (item: DiscoveryItem) => `${item.institution || ""} ${item.title}`;
export function schoolOptions(items: DiscoveryItem[]) {
  return [...new Set(items.flatMap(item => institutionKeys(schoolText(item)).length ? institutionKeys(schoolText(item)).map(key => key.toUpperCase()) : generalNames.has(normaliseText(item.institution)) ? [] : [item.institution!.trim()]))].sort();
}
export function parseSchoolPreferences(value: unknown, schools: string[]): SchoolPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { schools: [], topics: [] };
  const input = value as Record<string, unknown>;
  const valid = (raw: unknown, allowed: readonly string[], limit: number) => Array.isArray(raw) ? [...new Set(raw.filter((v): v is string => typeof v === "string" && allowed.includes(v)))].slice(0, limit) : [];
  return { schools: valid(input.schools, schools, 5), topics: valid(input.topics, feedTopics, 5) };
}
export function schoolFeed(items: DiscoveryItem[], preferences: SchoolPreferences, now = new Date()) {
  if (!preferences.schools.length && !preferences.topics.length) return [];
  const selected = preferences.schools.map(normaliseText);
  const candidates = items.filter(item => {
    const deadline = deadlineDate(item.deadline);
    if (item.status === "CLOSED" || item.status === "COMING SOON" || (deadline && +deadline < +now)) return false;
    const keys = institutionKeys(schoolText(item));
    const namedSchool = !generalNames.has(normaliseText(item.institution));
    const match = keys.some(key => selected.includes(key)) || (namedSchool && selected.includes(normaliseText(item.institution)));
    // National guidance can accompany a selected school; a different school's content cannot.
    if (selected.length && (keys.length || namedSchool) && !match) return false;
    const topics = contentTopics(`${item.title} ${item.summary || ""} ${item.category || ""} ${(item.keywords || []).join(" ")}`);
    const requestedTopics = preferences.topics.includes("admission") ? [...preferences.topics, "screening", "caps"] : preferences.topics;
    if (requestedTopics.length && !topics.some(topic => requestedTopics.includes(topic))) return false;
    return match || topics.length > 0;
  });
  const seen = new Set<string>();
  return rankContent(candidates, { now }).filter(({ item }) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href); return true;
  });
}
