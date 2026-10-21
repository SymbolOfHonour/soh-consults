import { NextResponse } from "next/server";
import { articleBlocksError, hasArticleNarrative, readArticleBlocks, writeArticleBlocks } from "../../../../../lib/article-blocks";
import { editorActor, EditorError, mayReview, teamRequest, type Submission, type WriterSnapshot } from "../../../../../lib/editor-team";
import { writeSmartMeta } from "../../../../../lib/smart-operations";

function result(value: unknown, status = 200) { return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } }); }
function failure(e: unknown) { return result({ error: e instanceof EditorError ? e.message : "Unable to save the submission." }, e instanceof EditorError ? e.status : 500); }
function snapshotFrom(value: unknown): WriterSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new EditorError("Article data is required.");
  if (JSON.stringify(value).length > 500000) throw new EditorError("This draft is too large.");
  const v = value as Record<string, unknown>;
  const text = (key: string, max: number) => typeof v[key] === "string" ? (v[key] as string).slice(0, max) : "";
  if (!Array.isArray(v.blocks) || v.blocks.length > 100) throw new EditorError("Use up to 100 article blocks.");
  // Validate the shape even for drafts; blank media links are allowed while writing.
  const raw = v.blocks as Record<string, unknown>[];
  const placeholder = "https://draft.invalid/placeholder";
  const validation = raw.map(block => block && typeof block === "object" && ["image", "document", "video"].includes(String(block.type)) && block.url === "" ? { ...block, url: placeholder } : block);
  const parsed = readArticleBlocks(`[SOH_BLOCKS:${encodeURIComponent(JSON.stringify(validation))}]`);
  if (!parsed) throw new EditorError("This draft contains an invalid article block.");
  const blocks = parsed.map((block, index) => "url" in block && raw[index].url === "" ? { ...block, url: "" } : block);
  return { title: text("title", 300), institution: text("institution", 200), category: text("category", 100), summary: text("summary", 3000), official_source_name: text("official_source_name", 200), official_source_url: text("official_source_url", 2000), blocks };
}
function submissionError(snapshot: WriterSnapshot) {
  if (!snapshot.title.trim()) return "Enter an article headline.";
  const blocks = readArticleBlocks(writeArticleBlocks("", snapshot.blocks));
  if (!blocks) return "Complete or remove invalid article blocks.";
  if (!hasArticleNarrative(blocks)) return "Add readable article content.";
  if (snapshot.official_source_url && !/^https:\/\//i.test(snapshot.official_source_url)) return "Use an HTTPS official source link.";
  return articleBlocksError(blocks);
}
export async function GET() {
  try {
    const actor = await editorActor();
    const filter = mayReview(actor) ? "" : `&author_id=eq.${actor.member!.id}`;
    const submissions = await teamRequest<Submission[]>(`/rest/v1/editor_submissions?select=*&order=updated_at.desc${filter}`);
    return result({ submissions });
  } catch (e) { return failure(e); }
}
export async function POST(request: Request) {
  try {
    const actor = await editorActor();
    if (actor.owner) throw new EditorError("Use the owner article editor to create articles.");
    const body = await request.json().catch(()=>null);
    if (!body || typeof body !== "object") throw new EditorError("Article data is required.");
    const snapshot = snapshotFrom(body.snapshot);
    const status = body.submit === true ? "submitted" : "draft";
    if (status === "submitted") { const error = submissionError(snapshot); if (error) throw new EditorError(error); }
    const row = { id: crypto.randomUUID(), author_id: actor.member.id, author_name: actor.member.name, snapshot, status };
    const rows = await teamRequest<Submission[]>("/rest/v1/editor_submissions", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(row) });
    return result({ submission: rows[0] }, 201);
  } catch (e) { return failure(e); }
}
export async function PATCH(request: Request) {
  try {
    const actor = await editorActor();
    const body = await request.json().catch(()=>null);
    if (!body || typeof body.id !== "string" || !/^[a-f0-9-]{36}$/i.test(body.id)) throw new EditorError("A valid submission is required.");
    const rows = await teamRequest<Submission[]>(`/rest/v1/editor_submissions?id=eq.${body.id}&select=*`);
    const previous = rows[0];
    if (!previous || (!mayReview(actor) && previous.author_id !== actor.member!.id)) throw new EditorError("Submission not found.", 404);
    if (body.expected_updated_at !== previous.updated_at) throw new EditorError("This draft changed in another session. Reload it before saving.", 409);
    if (previous.status === "imported") throw new EditorError("This submission is already in the owner editor.", 409);
    let patch: Partial<Submission>;
    if (body.action === "request_changes") {
      if (!mayReview(actor) || previous.status !== "submitted") throw new EditorError("Only a reviewer can return a submitted article.", 403);
      const feedback = typeof body.feedback === "string" ? body.feedback.trim().slice(0, 3000) : "";
      if (!feedback) throw new EditorError("Explain the changes needed.");
      patch = { status: "changes_requested", feedback };
    } else if (body.action === "import") {
      if (!actor.owner || previous.status !== "submitted") throw new EditorError("Only the owner can move a submitted article into the publishing editor.", 403);
      const error = submissionError(previous.snapshot); if (error) throw new EditorError(error);
      const s = previous.snapshot;
      const imported = await teamRequest<Submission[]>("/rest/v1/rpc/import_editor_submission", { method: "POST", body: JSON.stringify({ p_id: previous.id, p_expected: previous.updated_at, p_details: writeSmartMeta(writeArticleBlocks("", s.blocks), { publisherName: previous.author_name, publisherId: previous.author_id }) }) });
      return result({ submission: imported[0] });
    } else {
      if (actor.owner || previous.author_id !== actor.member.id || !["draft", "changes_requested"].includes(previous.status)) throw new EditorError("Only the author can edit a draft returned to them.", 403);
      const snapshot = snapshotFrom(body.snapshot);
      const status = body.submit === true ? "submitted" : previous.status;
      if (status === "submitted") { const error = submissionError(snapshot); if (error) throw new EditorError(error); }
      patch = { snapshot, status };
    }
    const updated = await teamRequest<Submission[]>(`/rest/v1/editor_submissions?id=eq.${previous.id}&updated_at=eq.${encodeURIComponent(previous.updated_at)}&status=eq.${previous.status}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }) });
    if (!updated[0]) throw new EditorError("This draft changed. Reload before continuing.", 409);
    return result({ submission: updated[0] });
  } catch (e) { return failure(e); }
}
