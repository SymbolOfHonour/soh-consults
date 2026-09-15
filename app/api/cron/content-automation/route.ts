import {NextResponse} from "next/server";
import {runContentAutomation} from "../../../../lib/content-automation";
export async function GET(request:Request){const secret=process.env.CRON_SECRET;if(!secret||request.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({error:"Unauthorized"},{status:401});try{return NextResponse.json(await runContentAutomation())}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Content automation failed."},{status:500})}}
