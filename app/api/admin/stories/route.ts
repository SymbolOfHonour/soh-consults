import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { createStory, deleteStory, listStories, updateStory, type QueueStatus } from "../../../../lib/news-queue";

const allowedStatuses: QueueStatus[] = ["draft", "approved", "published", "rejected", "archived"];

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
    official_source_url: body.official_source_url ? String(body.official_source_url).trim() : null,
    status: allowedStatuses.includes(body.status as QueueStatus) ? body.status as QueueStatus : "draft" as QueueStatus,
  };
}

function invalid(values: ReturnType<typeof valuesFrom>) {
  return !values.title || !values.summary || !values.details;
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
  if (invalid(values)) return NextResponse.json({ error: "Title, summary and details are required." }, { status: 400 });
  try { return NextResponse.json({ story: await createStory(values) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create story." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body?.id) return NextResponse.json({ error: "Story ID is required." }, { status: 400 });
  const values = valuesFrom(body);
  if (invalid(values)) return NextResponse.json({ error: "Title, summary and details are required." }, { status: 400 });
  try { return NextResponse.json({ story: await updateStory(String(body.id), values) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update story." }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { id?: string; confirm?: string } | null;
  if (!body?.id || body.confirm !== "PERMANENTLY DELETE") return NextResponse.json({ error: "Permanent deletion requires confirmation." }, { status: 400 });
  try { await deleteStory(body.id); return NextResponse.json({ success: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete story." }, { status: 500 }); }
}
