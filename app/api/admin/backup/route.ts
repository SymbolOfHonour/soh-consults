import {NextResponse} from "next/server";
import {isAdmin} from "../../../../lib/admin-auth";
import {listStories} from "../../../../lib/news-queue";
export const dynamic="force-dynamic";
export async function GET(){if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});try{const stories=await listStories();const exportedAt=new Date().toISOString();const payload={format:"soh-consults-news-queue-backup",version:1,exported_at:exportedAt,records:stories};return new Response(JSON.stringify(payload,null,2),{headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":`attachment; filename="soh-consults-backup-${exportedAt.slice(0,10)}.json"`,"Cache-Control":"no-store, private","X-Content-Type-Options":"nosniff"}});}catch{return NextResponse.json({error:"Unable to export backup."},{status:500});}}
