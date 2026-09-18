import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "../../../../lib/admin-auth";
import { deleteStory } from "../../../../lib/news-queue";
import { listAudit, listHistory, listTrash, moveStoryToTrash, restoreStoryFromTrash, restoreVersion } from "../../../../lib/admin-recovery";

function refresh() {
  revalidatePath("/");
  revalidatePath("/updates");
  revalidatePath("/admin");
  revalidatePath("/admin/updates");
  revalidatePath("/admin/recovery");
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const [trash, history, audit] = await Promise.all([listTrash(), listHistory(), listAudit()]);
    return NextResponse.json({ trash, history, audit, retention_days: null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load recovery data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { action?: string; id?: string; confirm?: string } | null;
  if (!body?.action || !body.id) return NextResponse.json({ error: "Action and ID are required." }, { status: 400 });
  try {
    let result = null;
    if (body.action === "trash") result = await moveStoryToTrash(body.id);
    else if (body.action === "restore") result = await restoreStoryFromTrash(body.id);
    else if (body.action === "restore-version") result = await restoreVersion(body.id);
    else if (body.action === "permanent-delete") {
      if (body.confirm !== "PERMANENTLY DELETE") return NextResponse.json({ error: "Permanent deletion requires confirmation." }, { status: 400 });
      // Never allow a supplied ID to delete a published, draft, or system record.
      const trash = await listTrash();
      if (!trash.some(story => story.id === body.id)) return NextResponse.json({ error: "Only updates in Trash can be permanently deleted." }, { status: 404 });
      result = await deleteStory(body.id);
    } else return NextResponse.json({ error: "Unknown recovery action." }, { status: 400 });
    if (!result) return NextResponse.json({ error: "Record not found or action unavailable." }, { status: 404 });
    refresh();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Recovery action failed." }, { status: 500 });
  }
}
