import { NextResponse } from "next/server";
import { teamRequest, type TeamMember } from "../../../../../lib/editor-team";
import { sendTeamMail } from "../../../../../lib/team-mail";
import { checkRateLimit } from "../../../../../lib/rate-limit";
export async function POST(request:Request) {
  const rate=await checkRateLimit(request,"writer-recovery",3,900);
  if(!rate.allowed)return NextResponse.json({error:"Please try again later."},{status:rate.unavailable?503:429,headers:{"Retry-After":String(rate.retryAfter),"Cache-Control":"no-store"}});
  const body=await request.json().catch(()=>null);
  const email=typeof body?.email==="string"?body.email.trim().toLowerCase():"";
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return NextResponse.json({error:"Enter a valid team email."},{status:400});
  // Identical response for missing, disabled, pending and existing accounts.
  try {
    const rows=await teamRequest<TeamMember[]>(`/rest/v1/editor_team?email=eq.${encodeURIComponent(email)}&active=eq.true&activated_at=not.is.null&select=id,email`);
    if(rows[0])await sendTeamMail(rows[0],"recovery");
  } catch { /* Never disclose whether a team email exists. */ }
  return NextResponse.json({message:"If an active team account matches this email, a password reset email will be sent. Check your inbox and spam folder."},{headers:{"Cache-Control":"no-store"}});
}
