/** Official JAMB IBASS institution directory, independent of published news.
 * Upstream availability is not guaranteed; return a clearly marked unavailable state.
 */
export type SchoolDirectory = { names: string[]; available: boolean; source: string };
const API = "https://ibass-api.jamb.gov.ng/api";
const SOURCE = "https://ibass.jamb.gov.ng/brochure-by-institution";
type Row = Record<string, unknown>;
async function get(path: string, body?: object): Promise<Row> {
  const response = await fetch(API + path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error("IBASS returned " + response.status);
  const json: unknown = await response.json();
  if (!json || typeof json !== "object" || (json as Row).status !== true) throw new Error("IBASS response unavailable");
  return json as Row;
}
function rows(data: unknown): Row[] {
  return Array.isArray(data) ? data.filter((x): x is Row => !!x && typeof x === "object") : [];
}
function label(item: Row): string {
  for (const field of ["name", "title", "institution_name", "inst_name"]) {
    const value = item[field];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}
async function allPages(typeId: string | number): Promise<Row[]> {
  const body = { inst_type: typeId, inst_category: null, inst_search: "" };
  const first = await get("/ibass/institutions?page=1", body);
  const data = first.data as Row | undefined;
  if (!data || !Array.isArray(data.data)) throw new Error("Unexpected IBASS pagination");
  const count = Number(data.last_page);
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error("Unexpected IBASS page count");
  const all = rows(data.data);
  for (let page = 2; page <= count; page++) {
    const result = await get("/ibass/institutions?page=" + page, body);
    const chunk = result.data as Row | undefined;
    if (!chunk || Number(chunk.current_page) !== page || !Array.isArray(chunk.data)) throw new Error("IBASS pagination changed");
    all.push(...rows(chunk.data));
  }
  if (Number(data.total) !== all.length) throw new Error("IBASS institution count changed");
  return all;
}
export async function ibassSchoolDirectory(): Promise<SchoolDirectory> {
  try {
    const types = rows((await get("/inst-type")).data);
    if (!types.length) throw new Error("No IBASS institution categories");
    const groups = await Promise.all(types.map(async type => {
      const id = type.id;
      if (typeof id !== "number" && typeof id !== "string") throw new Error("Invalid IBASS category");
      return allPages(id);
    }));
    const byId = new Map<string, string>();
    for (const row of groups.flat()) {
      const name = label(row);
      if (!name || (typeof row.id !== "number" && typeof row.id !== "string")) throw new Error("Incomplete IBASS institution");
      const id = String(row.id);
      if (byId.has(id) && byId.get(id) !== name) throw new Error("Conflicting IBASS institution IDs");
      byId.set(id, name);
    }
    return { names: [...new Set(byId.values())].sort((a,b) => a.localeCompare(b)), available: true, source: SOURCE };
  } catch {
    return { names: [], available: false, source: SOURCE };
  }
}
