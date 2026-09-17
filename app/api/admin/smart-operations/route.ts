import {NextResponse} from "next/server";
import {isAdmin} from "../../../../lib/admin-auth";
import {processSmartOperations} from "../../../../lib/process-smart-operations";
export async function POST(){
 if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{return NextResponse.json(await processSmartOperations());}
 catch(error){console.error("Manual smart operations failed",error);return NextResponse.json({error:"Unable to process smart operations."},{status:500});}
}
