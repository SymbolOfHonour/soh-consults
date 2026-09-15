import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { discoverLatestStories,importLatestStories } from "../../../../lib/news-importer";
export async function GET(){if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});try{return NextResponse.json(await discoverLatestStories())}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Discovery failed."},{status:500})}}
export async function POST(){if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});try{return NextResponse.json(await importLatestStories())}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Import failed."},{status:500})}}
