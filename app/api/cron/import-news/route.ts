import { NextResponse } from "next/server";
import { importLatestStories } from "../../../../lib/news-importer";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try { return NextResponse.json(await importLatestStories()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed." }, { status: 500 }); }
}
