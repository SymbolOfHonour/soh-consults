import { NextResponse } from "next/server";
import { currentWriter, EditorError, teamRequest, WRITER_COOKIE, writerCookieOptions, type TeamMember } from "../../../../../lib/editor-team";
import { checkRateLimit } from "../../../../../lib/rate-limit";
export async function GET() {
  try { return NextResponse.json({ member: await currentWriter() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Writer workspace is temporarily unavailable." }, { status: 503 }); }
}
export async function POST(request: Request) {
  try {
    const rate = await checkRateLimit(request, "writer-login", 8, 900);
    if (!rate.allowed) return NextResponse.json({ error: rate.unavailable ? "Sign-in is temporarily unavailable." : "Too many attempts. Please try again later." }, { status: rate.unavailable ? 503 : 429, headers: { "Retry-After": String(rate.retryAfter) } });
    const body = await request.json().catch(()=>null);
    if (!body || typeof body.password !== "string" || body.password.length < 8 || body.password.length > 128) throw new EditorError("Use a password between 8 and 128 characters.");
    let session: { access_token: string; expires_in: number; user: { id: string } };
    if (typeof body.invite === "string" && /^[a-f0-9]{32,128}$/i.test(body.invite)) {
      session = await teamRequest("/auth/v1/verify", { method: "POST", body: JSON.stringify({ token_hash: body.invite, type: body.recovery === true ? "recovery" : "invite" }) });
      const members = await teamRequest<TeamMember[]>(`/rest/v1/editor_team?id=eq.${session.user.id}&active=eq.true&select=*`);
      if (!members.length) throw new EditorError("This invitation has no active team access.", 403);
      await teamRequest("/auth/v1/user", { method: "PUT", headers: { Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ password: body.password }) });
    } else {
      if (typeof body.email !== "string" || body.email.length > 254) throw new EditorError("Enter your team email.");
      session = await teamRequest("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email: body.email.trim().toLowerCase(), password: body.password }) });
    }
    const members = await teamRequest<TeamMember[]>(`/rest/v1/editor_team?id=eq.${session.user.id}&active=eq.true&select=*`);
    if (!members.length) throw new EditorError("This account has no active team access.", 403);
    if (!members[0].activated_at) {
      const now=new Date().toISOString();
      await teamRequest(`/rest/v1/editor_team?id=eq.${session.user.id}&active=eq.true`,{method:"PATCH",body:JSON.stringify({activated_at:now})});
      members[0].activated_at=now;
    }
    const response = NextResponse.json({ member: members[0] }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(WRITER_COOKIE, session.access_token, writerCookieOptions(Math.min(session.expires_in || 3600, 3600)));
    return response;
  } catch (e) { return NextResponse.json({ error: e instanceof EditorError && e.status === 400 ? e.message : "Unable to sign in. Check your credentials or request a fresh invitation." }, { status: e instanceof EditorError && e.status === 400 ? 400 : 401, headers: { "Cache-Control": "no-store" } }); }
}
export async function DELETE() {
  // Revoke the provider session as well as clearing this browser's cookie.
  const { cookies } = await import("next/headers");
  const token = (await cookies()).get(WRITER_COOKIE)?.value;
  if (token) await teamRequest("/auth/v1/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  const response = NextResponse.json({ success: true });
  response.cookies.set(WRITER_COOKIE, "", writerCookieOptions(0));
  return response;
}
