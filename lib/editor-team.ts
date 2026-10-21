import { cookies } from "next/headers";
import { isAdmin } from "./admin-auth";

export const WRITER_COOKIE = "soh_writer_session";
export type TeamMember = { id: string; email: string; name: string; role: "writer" | "editor"; active: boolean; created_at: string };
export type WriterSnapshot = { title: string; institution: string; category: string; summary: string; official_source_name: string; official_source_url: string; blocks: import("./article-blocks").ArticleBlock[] };
export type Submission = { id: string; author_id: string; author_name: string; status: "draft" | "submitted" | "changes_requested" | "imported"; snapshot: WriterSnapshot; feedback: string; story_id: string | null; created_at: string; updated_at: string };
export class EditorError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
function config() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new EditorError("Writer workspace is not configured.", 503);
  return { url, key };
}
export async function teamRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}${path}`, { ...init, cache: "no-store", signal: AbortSignal.timeout(15000), headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), "Content-Type": "application/json", ...init.headers } });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new EditorError("Your writer session is no longer valid. Sign in again.", 401);
    // Do not expose provider responses or credentials to the browser.
    throw new EditorError(path.startsWith("/rest/") ? "Team storage is unavailable. The private editor team database migration must be installed." : "Unable to complete account request. Check the details or request a fresh invitation.", 503);
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") return undefined as T;
  const body = await response.text();
  if (!body) return undefined as T;
  return JSON.parse(body) as T;
}
export async function currentWriter(): Promise<TeamMember | null> {
  const token = (await cookies()).get(WRITER_COOKIE)?.value;
  if (!token) return null;
  let user: { id: string };
  try { user = await teamRequest("/auth/v1/user", { headers: { Authorization: `Bearer ${token}` } }); }
  catch (error) { if (error instanceof EditorError && error.status === 401) return null; throw error; }
  const rows = await teamRequest<TeamMember[]>(`/rest/v1/editor_team?id=eq.${encodeURIComponent(user.id)}&active=eq.true&select=*`);
  return rows[0] || null;
}
export async function editorActor() {
  if (await isAdmin()) return { owner: true as const, member: null };
  const member = await currentWriter();
  if (!member) throw new EditorError("Sign in to the writer workspace.", 401);
  return { owner: false as const, member };
}
export const memberFields = "id,email,name,role,active,created_at";
export function mayReview(actor: Awaited<ReturnType<typeof editorActor>>) { return actor.owner || actor.member.role === "editor"; }
export function writerCookieOptions(maxAge = 3600) { return { httpOnly: true, sameSite: "strict" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge }; }
