import snapshot from "../data/lasu-requirements-snapshot.json";

export type LasuRecord = { courseId: string; programme: string; oLevel: string; utme: string; retrievedAt: string };
const prefix = "S.O.H System:lasu-requirements";
export function validLasuRecord(value: unknown, courseId: string): value is LasuRecord {
  if (!value || typeof value !== "object") return false;
  const row = value as LasuRecord;
  return row.courseId === courseId && [row.programme, row.oLevel, row.utme].every(v => typeof v === "string" && v.trim().length > 0 && v.length < 12000 && !/[<>]/.test(v)) && Number.isFinite(Date.parse(row.retrievedAt));
}
async function storage(query: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("LASU backup storage is not configured");
  const response = await fetch(`${url}/rest/v1/news_queue?${query}`, { ...init, cache: "no-store", signal: AbortSignal.timeout(2000), headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), "Content-Type": "application/json", ...init.headers } });
  if (!response.ok) throw new Error(`LASU backup storage returned ${response.status}`);
  return response;
}
export async function readLasuBackup(courseId: string): Promise<LasuRecord | null> {
  const bundled = snapshot.find(row => validLasuRecord(row, courseId)) || null;
  try {
    const query = new URLSearchParams({ source_name: `eq.${prefix}`, source_url: `eq.system:lasu-requirements:${courseId}`, select: "details", limit: "1" });
    const rows = await (await storage(query.toString())).json() as { details: string }[];
    const saved: unknown = rows[0] ? JSON.parse(rows[0].details) : null;
    if (validLasuRecord(saved, courseId) && (!bundled || saved.retrievedAt > bundled.retrievedAt)) return saved;
  } catch { /* A database outage must not prevent use of the bundled official snapshot. */ }
  return bundled;
}
export async function saveLasuBackup(row: LasuRecord) {
  if (!validLasuRecord(row, row.courseId)) throw new Error("Incomplete LASU response cannot replace backup");
  // Use the existing private system-record convention; never publish these as articles.
  await storage("on_conflict=source_url", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ source_name: prefix, source_url: `system:lasu-requirements:${row.courseId}`, title: `LASU requirements: ${row.programme}`, institution: "LASU", category: "Admin LASU backup", summary: "Last successfully retrieved official course requirements", details: JSON.stringify(row), status: "archived", updated_at: row.retrievedAt }) });
}
