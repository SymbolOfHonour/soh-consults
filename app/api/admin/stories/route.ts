import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { listStories, updateStory, type QueueStatus } from "../../../../lib/news-queue";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ stories: await listStories() }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load stories." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "Story ID is required." }, { status: 400 });
  const allowedStatuses: QueueStatus[] = ["draft", "approved", "published", "rejected"];
  const values = {
    title: String(body.title || "").trim(),
    institution: String(body.institution || "To be confirmed").trim(),
    category: String(body.category || "Admission").trim(),
    summary: String(body.summary || "").trim(),
    details: String(body.details || "").trim(),
    deadline: body.deadline ? String(body.deadline).trim() : null,
    deadline_iso: body.deadline_iso || null,
    status: allowedStatuses.includes(body.status) ? body.status : "draft",
  };
  if (!values.title || !values.summary || !values.details) return NextResponse.json({ error: "Title, summary and details are required." }, { status: 400 });
  try { return NextResponse.json({ story: await updateStory(body.id, values) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update story." }, { status: 500 }); }
}

