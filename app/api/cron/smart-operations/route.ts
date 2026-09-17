import {NextResponse} from "next/server";
import {processSmartOperations} from "../../../../lib/process-smart-operations";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET;
 if(!secret||request.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const result=await processSmartOperations();return NextResponse.json(result,{status:result.failed?207:200,headers:{"Cache-Control":"no-store"}});}
 catch(error){console.error("Scheduled smart operations failed",error);return NextResponse.json({error:"Scheduled processing failed."},{status:500});}
}
