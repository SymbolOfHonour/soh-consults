import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { createStory, deleteStory, listStories, updateStory, type QueueStatus } from "../../../../lib/news-queue";

const allowedStatuses: QueueStatus[] = ["draft", "approved", "published", "rejected", "archived"];

function safeHttpUrl(value: unknown) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch { return null; }
}

function valuesFrom(body: Record<string, unknown>) {
  return {
    title: String(body.title || "").trim(),
    institution: String(body.institution || "To be confirmed").trim(),
    category: String(body.category || "Admission").trim(),
    summary: String(body.summary || "").trim(),
    details: String(body.details || "").trim(),
    deadline: body.deadline ? String(body.deadline).trim() : null,
    deadline_iso: body.deadline_iso ? String(body.deadline_iso) : null,
    image_url: body.image_url ? String(body.image_url) : null,
    document_url: body.document_url ? String(body.document_url) : null,
    document_name: body.document_name ? String(body.document_name) : null,
    official_source_name: body.official_source_name ? String(body.official_source_name).trim() : null,
    official_source_url: safeHttpUrl(body.official_source_url),
    status: allowedStatuses.includes(body.status as QueueStatus) ? body.status as QueueStatus : "draft" as QueueStatus,
  };
}

function validationError(values: ReturnType<typeof valuesFrom>, body: Record<string, unknown>) {
  if (!values.title) return "A title is required.";
  if (body.official_source_url && !values.official_source_url) return "Official source link must be a valid http:// or https:// URL.";
  if (values.status !== "draft" && (!values.summary || !values.details)) return "Summary and details are required before approving or publishing an update.";
  return null;
}

function refreshPublic(id?: string) {
  revalidatePath("/");
  revalidatePath("/updates");
  if (id) revalidatePath(`/updates/imported/${id}`);
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ stories: await listStories() }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load stories." }, { status: 500 }); }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const values = valuesFrom(body);
  const error = validationError(values, body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    const story = await createStory(values);
    refreshPublic(story.id);
    return NextResponse.json({ story }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create story." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body?.id) return NextResponse.json({ error: "Story ID is required." }, { status: 400 });
  const values = valuesFrom(body);
  const error = validationError(values, body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    const story = await updateStory(String(body.id), values);
    if (!story) return NextResponse.json({ error: "Update not found." }, { status: 404 });
    refreshPublic(String(body.id));
    return NextResponse.json({ story });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update story." }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { id?: string; confirm?: string } | null;
  if (!body?.id || body.confirm !== "PERMANENTLY DELETE") return NextResponse.json({ error: "Permanent deletion requires confirmation." }, { status: 400 });
  try {
    const deleted = await deleteStory(body.id);
    if (!deleted) return NextResponse.json({ error: "Update not found." }, { status: 404 });
    refreshPublic(body.id);
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete story." }, { status: 500 }); }
}
