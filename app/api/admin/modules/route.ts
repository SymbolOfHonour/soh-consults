import { NextRequest,NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { createModuleRecord,deleteModuleRecord,isModuleKey,listModuleRecords,updateModuleRecord } from "../../../../lib/admin-module-store";
const no=()=>NextResponse.json({error:"Unauthorized"},{status:401});
export async function GET(r:NextRequest){if(!(await isAdmin()))return no();const m=r.nextUrl.searchParams.get("module")||"";if(!isModuleKey(m))return NextResponse.json({error:"Invalid module"},{status:400});return NextResponse.json({records:await listModuleRecords(m)});}
export async function POST(r:NextRequest){if(!(await isAdmin()))return no();const b=await r.json();if(!isModuleKey(b.module)||!String(b.title||"").trim())return NextResponse.json({error:"Module and title are required"},{status:400});return NextResponse.json({record:await createModuleRecord(b.module,b)},{status:201});}
export async function PATCH(r:NextRequest){if(!(await isAdmin()))return no();const b=await r.json();if(!isModuleKey(b.module)||!b.id)return NextResponse.json({error:"Invalid request"},{status:400});return NextResponse.json({record:await updateModuleRecord(b.module,b.id,b)});}
export async function DELETE(r:NextRequest){if(!(await isAdmin()))return no();const b=await r.json();if(!b.id||b.confirmation!=="PERMANENTLY DELETE")return NextResponse.json({error:"Type PERMANENTLY DELETE to confirm"},{status:400});await deleteModuleRecord(b.id);return NextResponse.json({ok:true});}
