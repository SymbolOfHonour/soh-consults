import { NextResponse } from "next/server";
import { editorActor } from "../../../../../lib/editor-team";
import { getStorySlug, listPublishedStories } from "../../../../../lib/news-queue";
export async function GET() {
  try {
    await editorActor();
    const rows = await listPublishedStories({ strict: true });
    return NextResponse.json({ stories: rows.map(s => ({ title: s.title, status: "published", permalink: `/updates/${getStorySlug(s)}` })) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Unable to load published links." }, { status: 401 }); }
}
