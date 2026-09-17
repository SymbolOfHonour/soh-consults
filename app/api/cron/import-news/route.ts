import { NextResponse } from "next/server";
import { importLatestStories } from "../../../../lib/news-importer";
import {recordHealth} from "../../../../lib/business-intelligence";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {const result=await importLatestStories();await recordHealth("daily news import",result.failures.length===0,JSON.stringify(result)).catch(error=>console.error("Health logging failed",error));return NextResponse.json(result);}
  catch (error) {const message=error instanceof Error?error.message:"Import failed.";await recordHealth("daily news import",false,message).catch(logError=>console.error("Health logging failed",logError));return NextResponse.json({error:message},{status:500});}
}
