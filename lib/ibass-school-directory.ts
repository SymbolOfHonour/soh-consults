/** JAMB IBASS directory: isolated from the content/news pipeline.
 * Official endpoints have not been independently certified. Never claim complete coverage
 * unless every upstream category and page passes validation.
 */
export type SchoolDirectory = { names: string[]; available: boolean; complete: boolean; source: string; categoryCount: number; warnings: string[] };
const API = "https://ibass-api.jamb.gov.ng/api";
const SOURCE = "https://ibass.jamb.gov.ng/brochure-by-institution";
type Row = Record<string, unknown>;
const isRow = (v: unknown): v is Row => Boolean(v && typeof v === "object" && !Array.isArray(v));
export function directoryRows(v: unknown): Row[] {
  if (!Array.isArray(v) || !v.every(isRow)) throw new Error("Invalid IBASS records");
  return v;
}
export function directoryName(row: Row): string {
  for (const key of ["name", "title", "institution_name", "inst_name"]) {
    if (typeof row[key] === "string" && row[key].trim()) return row[key].trim();
  }
  throw new Error("Institution has no name");
}
export function directoryPage(value: unknown, expectedPage: number) {
  if (!isRow(value) || value.status !== true || !isRow(value.data)) throw new Error("Invalid IBASS envelope");
  const data = value.data;
  const page = Number(data.current_page), last = Number(data.last_page), total = Number(data.total);
  if (page !== expectedPage || !Number.isSafeInteger(last) || last < page || last > 500 ||
      !Number.isSafeInteger(total) || total < 0) throw new Error("Invalid IBASS pagination");
  return { records: directoryRows(data.data), page, last, total };
}
async function request(path: string, body?: object): Promise<unknown> {
  const response = await fetch(API + path, {
    method: body ? "POST" : "GET",
    headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error("IBASS HTTP " + response.status);
  return response.json();
}
async function category(id: string | number): Promise<Row[]> {
  const body = { inst_type: id, inst_category: null, inst_search: "" };
  const first = directoryPage(await request("/ibass/institutions?page=1", body), 1);
  const result = [...first.records];
  for (let p = 2; p <= first.last; p++) {
    const next = directoryPage(await request("/ibass/institutions?page=" + p, body), p);
    if (next.last !== first.last || next.total !== first.total) throw new Error("Pagination changed during retrieval");
    result.push(...next.records);
  }
  if (result.length !== first.total) throw new Error("IBASS category total mismatch");
  return result;
}
export async function ibassSchoolDirectory(): Promise<SchoolDirectory> {
  const warnings: string[] = [];
  let types: Row[] = [];
  try {
    const response = await request("/inst-type");
    if (!isRow(response) || response.status !== true) throw new Error("Invalid category envelope");
    types = directoryRows(response.data);
    if (!types.length) throw new Error("No institution types");
  } catch {
    return { names: [], available: false, complete: false, source: SOURCE, categoryCount: 0, warnings: ["Official directory could not be reached."] };
  }
  const settled = await Promise.allSettled(types.map(async type => {
    if (typeof type.id !== "string" && typeof type.id !== "number") throw new Error("Invalid institution type");
    return category(type.id);
  }));
  const names = new Map<string, string>();
  let categoryCount = 0;
  for (const [index, outcome] of settled.entries()) {
    if (outcome.status === "rejected") { warnings.push("Institution type " + String(types[index].id ?? index) + " is unavailable."); continue; }
    categoryCount++;
    try {
      for (const row of outcome.value) {
        const name = directoryName(row);
        if (typeof row.id !== "string" && typeof row.id !== "number") throw new Error("Missing institution identifier");
        const key = name.normalize("NFKC").trim().replace(/\\s+/g, " ").toLocaleLowerCase("en");
        if (!names.has(key)) names.set(key, name);
      }
    } catch { warnings.push("An institution type returned invalid records."); }
  }
  const complete = warnings.length === 0 && categoryCount === types.length;
  return { names: [...names.values()].sort((a, b) => a.localeCompare(b)), available: names.size > 0, complete, source: SOURCE, categoryCount, warnings };
}
