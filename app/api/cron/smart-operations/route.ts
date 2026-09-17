import {NextResponse} from "next/server";
import {processSmartOperations} from "../../../../lib/process-smart-operations";
export async function GET(request:Request){const secret=process.env.CRON_SECRET;if(!secret||request.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({error:"Unauthorized"},{status:401});try{return NextResponse.json(await processSmartOperations());}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Smart operations cron failed."},{status:500});}}
