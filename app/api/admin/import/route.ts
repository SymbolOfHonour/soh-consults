import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { importLatestStories } from "../../../../lib/news-importer";

export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(await importLatestStories()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed." }, { status: 500 }); }
}

