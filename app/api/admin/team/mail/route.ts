import { NextResponse } from "next/server";
import { isAdmin } from "../../../../../lib/admin-auth";
import { EditorError } from "../../../../../lib/editor-team";
import { go54MailState, syncGo54Mail, verifyGo54Mail } from "../../../../../lib/go54-mail";
import { checkRateLimit } from "../../../../../lib/rate-limit";

export const runtime="nodejs";
export const maxDuration=60;
const headers={"Cache-Control":"no-store"};
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({error:"Unauthorized"},{status:401,headers});
  return NextResponse.json(go54MailState(),{headers});
}
export async function POST(request:Request) {
  if (!(await isAdmin())) return NextResponse.json({error:"Unauthorized"},{status:401,headers});
  const rate=await checkRateLimit(request,"owner-mail-sync",2,120);
  if (!rate.allowed)return NextResponse.json({error:"Please wait before checking the mailbox again."},{status:429,headers});
  try {
    const body=await request.json();
    if(body?.action==="verify")return NextResponse.json({verified:await verifyGo54Mail()},{headers});
    if(body?.action==="sync")return NextResponse.json(await syncGo54Mail(),{headers});
    return NextResponse.json({error:"Choose Verify or Sync."},{status:400,headers});
  } catch(e) {
    return NextResponse.json({error:e instanceof EditorError?e.message:"Could not connect to the business mailbox. Check its settings and try again."},{status:e instanceof EditorError?e.status:503,headers});
  }
}
