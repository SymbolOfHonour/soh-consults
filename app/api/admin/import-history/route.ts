import {NextResponse} from "next/server";
import {isAdmin} from "../../../../lib/admin-auth";
import {latestHealth} from "../../../../lib/business-intelligence";

export async function GET(){
 if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const rows=(await latestHealth()).filter(row=>row.title==="Health: news import"||row.title==="Health: daily news import");
  return NextResponse.json({runs:rows.map(row=>({id:row.id,status:row.status,at:row.created_at,details:row.details}))},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"History unavailable"},{status:500});}
}
