import { NextResponse } from "next/server";
import { importLatestStories } from "../../../../lib/news-importer";
import { recordHealth } from "../../../../lib/business-intelligence";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const startedAt = new Date().toISOString();
  try {
    const result = await importLatestStories();
    const details = JSON.stringify({startedAt,finishedAt:new Date().toISOString(),...result});
    await recordHealth("news import",result.failures.length===0,details).catch(error=>console.error("Health logging failed",error));
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed.";
    await recordHealth("news import",false,JSON.stringify({startedAt,finishedAt:new Date().toISOString(),error:message})).catch(logError=>console.error("Health logging failed",logError));
    return NextResponse.json({error:message},{status:500});
  }
}
