import { NextResponse } from "next/server";
import { isAdmin } from "../../../../lib/admin-auth";
import { EditorError, memberFields, teamRequest, type TeamMember } from "../../../../lib/editor-team";
import { sendTeamMail, type EmailEvent } from "../../../../lib/team-mail";
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const [members, events] = await Promise.all([teamRequest<TeamMember[]>(`/rest/v1/editor_team?select=${memberFields}&order=created_at.desc`),teamRequest<EmailEvent[]>("/rest/v1/editor_email_events?select=id,member_id,recipient,kind,status,created_at,archive_status,delivery_status,delivery_checked_at&order=created_at.desc&limit=100")]); return NextResponse.json({ members, events }, { headers: { "Cache-Control": "no-store" } }); }
  catch (e) { return failure(e); }
}
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json().catch(()=>null);
    if (!body || typeof body !== "object") throw new EditorError("Invitation details are required.");
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !name || name.length > 100) throw new EditorError("Enter a valid email and a name of up to 100 characters.");
    if (body.action === "reset") {
      const members = await teamRequest<TeamMember[]>(`/rest/v1/editor_team?email=eq.${encodeURIComponent(email)}&active=eq.true&select=${memberFields}`);
      if (!members[0]) throw new EditorError("An enabled team account is required.", 404);
      await sendTeamMail(members[0], "recovery");
      return NextResponse.json({ emailed: true });
    }
    if (body.action === "resend") {
      const members = await teamRequest<TeamMember[]>(`/rest/v1/editor_team?email=eq.${encodeURIComponent(email)}&active=eq.true&select=${memberFields}`);
      if (!members[0]) throw new EditorError("An enabled team account is required.", 404);
      const user = await teamRequest<{ email_confirmed_at?: string }>(`/auth/v1/admin/users/${members[0].id}`);
      if (user.email_confirmed_at) throw new EditorError("This account is already activated. Use password reset instead.", 409);
      return sendInvitation(members[0], "resend");
    }
    const role = body.role === "editor" ? "editor" : "writer";
    // Probe migration readiness before creating a managed Auth account.
    const existing = await teamRequest<TeamMember[]>(`/rest/v1/editor_team?email=eq.${encodeURIComponent(email)}&select=${memberFields}`);
    if (existing.length) throw new EditorError("This email already has a team account. Use its access controls or password reset.", 409);
    // Reserve the Auth user without sending mail, then provision access before delivery.
    const result = await teamRequest<{ id: string }>("/auth/v1/admin/generate_link", { method: "POST", body: JSON.stringify({ type: "invite", email, data: { name } }) });
    await teamRequest("/rest/v1/editor_team", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ id: result.id, email, name, role, active: true }) });
    return sendInvitation({id:result.id,email}, "invitation");
  } catch (e) { return failure(e); }
}
export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json().catch(()=>null);
    if (!body || typeof body.id !== "string" || !/^[a-f0-9-]{36}$/i.test(body.id)) throw new EditorError("A valid member is required.");
    const patch: { active?: boolean; role?: string; invitation_cancelled_at?: string | null } = {};
    if (body.action === "cancel") {
      const pending = await teamRequest<TeamMember[]>(`/rest/v1/editor_team?id=eq.${body.id}&activated_at=is.null&select=${memberFields}`);
      if (!pending.length) throw new EditorError("Only pending invitations can be cancelled.",409);
      const user = await teamRequest<{email_confirmed_at?:string}>(`/auth/v1/admin/users/${body.id}`);
      if (user.email_confirmed_at) throw new EditorError("This account is already activated. Disable access instead.",409);
      patch.active=false; patch.invitation_cancelled_at=new Date().toISOString();
    }
    if (typeof body.active === "boolean") { patch.active = body.active; if(body.active) patch.invitation_cancelled_at=null; }
    if (body.role === "writer" || body.role === "editor") patch.role = body.role;
    if (!Object.keys(patch).length) throw new EditorError("Choose an access change.");
    const rows = await teamRequest<TeamMember[]>(`/rest/v1/editor_team?id=eq.${body.id}${body.action === "cancel" ? "&activated_at=is.null" : ""}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch) });
    if (!rows.length) throw new EditorError("Member not found.", 404);
    return NextResponse.json({ member: rows[0] });
  } catch (e) { return failure(e); }
}
async function sendInvitation(member: {id:string;email:string}, kind: "invitation" | "resend") {
  try {
    await sendTeamMail(member,kind);
    await teamRequest(`/rest/v1/editor_team?id=eq.${member.id}`,{method:"PATCH",body:JSON.stringify({last_invited_at:new Date().toISOString()})});
    return NextResponse.json({ emailed: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return NextResponse.json({emailed:false,error:e instanceof EditorError?e.message:"The team account exists, but email delivery could not be confirmed. Check the inbox before using Resend invitation."},{status:503,headers:{"Cache-Control":"no-store"}}); }
}
function failure(e: unknown) { return NextResponse.json({ error: e instanceof EditorError ? e.message : "Unable to manage the team." }, { status: e instanceof EditorError ? e.status : 500, headers: { "Cache-Control": "no-store" } }); }
